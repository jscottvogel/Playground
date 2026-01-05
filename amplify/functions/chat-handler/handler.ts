import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { BedrockAgentRuntimeClient, RetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import type { Schema } from "../../data/resource";

// Initialize Clients
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const bedrockAgent = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

// --- MOCK DATA FOR TOOLS (In production, fetch from S3 / DynamoDB) ---
const RESUME_TEXT = `
EXPERIENCE:
- Sr. Full Stack Engineer at TechCorp (2020-Present): Led React migration.
- Web Developer at StartUp Inc (2018-2020): Built key features using Vue.js.

SKILLS: React, TypeScript, AWS, Node.js, Python.
EDUCATION: BS Computer Science, University of Code.
`;

const ABOUT_ME_DATA = `
OBJECTIVE: To leverage agentic AI and cloud architecture to build scalable, intelligent systems.
GOALS: Master Bedrock, Contribute to Open Source, Build a fully autonomous coding agent.
FUN FACTS: I love hiking, I brew my own coffee, and I once met Linus Torvalds.
`;

// --- TOOL DEFINITIONS ---
const tools = [
    {
        name: "search_knowledge",
        description: "Search for specific information within the candidate's knowledge base (files, FAQs, resume, descriptions). Use this to answer questions about work history, education, skills, or general facts.",
        input_schema: {
            type: "object",
            properties: {
                query: { type: "string", description: "The specific topic to search for." }
            },
            required: ["query"]
        }
    },
    {
        name: "aboutme_query",
        description: "Get general facts, personal and professional goals, and the objective statement of the candidate.",
        input_schema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "list_projects",
        description: "List portfolio projects from the database. Can filter by skills or status.",
        input_schema: {
            type: "object",
            properties: {
                skill: { type: "string", description: "Filter projects by a specific skill (e.g. 'React')." }
            }
        }
    }
];

interface BotSettings {
    preferredName: string;
    fallbackPhrase: string;
    restrictions: string;
    instructions: string;
}

const DEFAULT_SETTINGS: BotSettings = {
    preferredName: 'ScottBot',
    fallbackPhrase: "I'm sorry, I don't have information about that.",
    restrictions: '',
    instructions: 'Be professional, helpful, and concise.'
};

async function loadBotConfig(): Promise<BotSettings> {
    const bucketName = process.env.STORAGE_BUCKET_NAME;
    if (!bucketName) {
        console.warn("STORAGE_BUCKET_NAME not set, using defaults.");
        return DEFAULT_SETTINGS;
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: 'knowledge-base/bot-settings.json'
        });
        const response = await s3.send(command);
        const str = await response.Body?.transformToString();
        if (!str) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(str) };
    } catch (error) {
        console.warn("Could not load bot config (using defaults):", error);
        return DEFAULT_SETTINGS;
    }
}

export const handler: any = async (event: any) => {
    const { message } = event.arguments;
    console.log(`[Agent] Received message: ${message}`);

    // Load dynamic config
    const config = await loadBotConfig();

    // 1. Construct Conversation History (Simplified: stateless for now, just current message)
    // In a real app, pass 'history' from frontend or store in DDB.
    const messages: any[] = [{ role: "user", content: [{ type: 'text', text: message }] }];

    try {
        // 2. Call Bedrock with Tools
        const response = await callBedrock(messages, config);

        // 3. Check for Tool Use
        if (response.stop_reason === "tool_use") {
            const toolRequests = response.content.filter((c: any) => c.type === "tool_use");

            // Execute Tools
            const toolResults = await Promise.all(toolRequests.map(async (tool: any) => {
                const result = await executeTool(tool.name, tool.input);
                return {
                    type: 'tool_result',
                    tool_use_id: tool.id,
                    content: [{ type: "text", text: JSON.stringify(result) }]
                };
            }));

            // Append Assistant's Tool Request and Tool Results to history
            messages.push({ role: "assistant", content: response.content });
            messages.push({ role: "user", content: toolResults });

            // 4. Call Bedrock Again with Tool Outputs
            const finalResponse = await callBedrock(messages, config);
            return finalResponse.content[0].text;
        }

        return response.content[0].text;

    } catch (error) {
        console.error("Agent Error:", error);
        return `Error: ${(error as Error).message}`;
    }
};

async function callBedrock(messages: any[], config: BotSettings) {
    const systemPrompt = `
You are an intelligent portfolio assistant for Scott.
Your name is: ${config.preferredName}.
Instructions: ${config.instructions}
Restrictions: ${config.restrictions}
If you cannot find an answer after checking your tools, or if the question violates restrictions, reply with exactly: "${config.fallbackPhrase}"
    `.trim();

    const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            system: systemPrompt,
            messages: messages,
            tools: tools
        })
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody;
}

async function executeTool(name: string, input: any) {
    console.log(`[Tool] Executing ${name} with input:`, input);

    if (name === 'search_knowledge') {
        try {
            const kbId = process.env.KNOWLEDGE_BASE_ID;
            if (!kbId) {
                console.warn("KNOWLEDGE_BASE_ID not set, falling back to mock data.");
                return RESUME_TEXT;
            }

            const command = new RetrieveCommand({
                knowledgeBaseId: kbId,
                retrievalQuery: { text: input.query },
                retrievalConfiguration: {
                    vectorSearchConfiguration: { numberOfResults: 3 }
                }
            });

            const response = await bedrockAgent.send(command);
            const validResults = response.retrievalResults?.filter(r => r.content?.text).map(r => r.content!.text).join('\n\n') || "No relevant info found in KB.";

            return validResults;

        } catch (error) {
            console.error("Error querying Knowledge Base:", error);
            return `Error retrieving information from Knowledge Base: ${(error as Error).message}`;
        }
    }

    if (name === 'aboutme_query') {
        return ABOUT_ME_DATA;
    }

    if (name === 'list_projects') {
        // In a real lambda, we would use strict DynamoDB Client here.
        // For MVP Demo, we'll return a static list or mocked DB response to prove the agent concept.
        return [
            { title: "Portfolio Site", skills: ["React", "AWS Amplify", "AI"] },
            { title: "E-Commerce App", skills: ["Vue", "Node", "Stripe"] }
        ];
    }

    return "Tool not found.";
}
