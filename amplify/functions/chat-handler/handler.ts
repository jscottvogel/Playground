import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { Schema } from "../../data/resource";

// Initialize Bedrock Client
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

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
        name: "search_resume",
        description: "Search for specific information within the candidate's resume (files). Use this to answer questions about work history, education, or skills.",
        input_schema: {
            type: "object",
            properties: {
                query: { type: "string", description: "The specific topic to search for in the resume." }
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

export const handler: any = async (event: any) => {
    const { message } = event.arguments;
    console.log(`[Agent] Received message: ${message}`);

    // 1. Construct Conversation History (Simplified: stateless for now, just current message)
    // In a real app, pass 'history' from frontend or store in DDB.
    const messages: any[] = [{ role: "user", content: [{ text: message }] }];

    try {
        // 2. Call Bedrock with Tools
        const response = await callBedrock(messages);

        // 3. Check for Tool Use
        // 3. Check for Tool Use
        if (response.stop_reason === "tool_use") {
            const toolRequests = response.content.filter((c: any) => c.type === "tool_use");

            // Execute Tools
            const toolResults = await Promise.all(toolRequests.map(async (tool: any) => {
                const result = await executeTool(tool.name, tool.input);
                return {
                    tool_result: {
                        tool_use_id: tool.id,
                        content: [{ type: "text", text: JSON.stringify(result) }]
                    }
                };
            }));

            // Append Assistant's Tool Request and Tool Results to history
            messages.push({ role: "assistant", content: response.content });
            messages.push({ role: "user", content: toolResults });

            // 4. Call Bedrock Again with Tool Outputs
            const finalResponse = await callBedrock(messages);
            return finalResponse.content[0].text;
        }

        return response.content[0].text;

    } catch (error) {
        console.error("Agent Error:", error);
        return "Sorry, I encountered an error while thinking. Please check my logs.";
    }
};

async function callBedrock(messages: any[]) {
    const command = new InvokeModelCommand({
        modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1000,
            system: "You are an intelligent portfolio assistant for J. Scott. Use the available tools to answer questions about his resume, goals, and projects exactly. Be professional but friendly.",
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

    if (name === 'search_resume') {
        // Simulating "RAG" by returning relevant chunks or full text if small
        // Real implementation: Fetch from S3, use localized search, or Knowledge Base
        return RESUME_TEXT; // Return full text for Claude to analyze
    }

    if (name === 'aboutme_query') {
        return ABOUT_ME_DATA;
    }

    if (name === 'list_projects') {
        // In a real lambda, we would use strict DynamoDB Client here.
        // Since this is an Amplify Function defined in 'backend.ts', we might need to grant access or use fetch.
        // For MVP Demo, we'll return a static list or mocked DB response to prove the agent concept.
        // To properly access the DDB table from this Lambda, we need env vars passed from stack.
        return [
            { title: "Portfolio Site", skills: ["React", "AWS Amplify", "AI"] },
            { title: "E-Commerce App", skills: ["Vue", "Node", "Stripe"] }
        ];
    }

    return "Tool not found.";
}
