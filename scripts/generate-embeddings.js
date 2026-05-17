import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';


const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

async function getEmbedding(text) {
    // Basic scrubbing to reduce noise
    const scrubbed = text.replace(/\s+/g, " ").trim();
    if (!scrubbed) return null;

    const command = new InvokeModelCommand({
        modelId: "amazon.titan-embed-text-v1",
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({ inputText: scrubbed })
    });
    const response = await bedrock.send(command);
    const body = JSON.parse(new TextDecoder().decode(response.body));
    return body.embedding;
}

// Extract raw text based on file extension
async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.txt') {
        return fs.readFileSync(filePath, 'utf-8');
    }

    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    }

    return null;
}

async function main() {
    const docsDir = path.join(__dirname, '../docs');

    // Ensure docs dir exists
    if (!fs.existsSync(docsDir)) {
        console.error(`Docs directory not found at: ${docsDir}`);
        return;
    }

    const files = fs.readdirSync(docsDir);
    const documents = [];

    console.log(`Found ${files.length} files in docs/ directory. Generating embeddings...`);

    for (const file of files) {
        const filePath = path.join(docsDir, file);
        const fileName = file;

        try {
            const rawText = await extractTextFromFile(filePath);

            if (!rawText) {
                console.log(`Skipping unsupported or empty file: ${fileName}`);
                continue;
            }

            // Simple chunking strategy: Split by double newline (paragraphs) first
            // If that yields huge blobs, you might want more sophisticated logic, 
            // but this is usually sufficient for resumes/docs.
            let chunks = rawText.split(/\n\s*\n/);

            // Filter out short noise (page numbers, headers, empty lines)
            chunks = chunks.filter(c => c.trim().length > 50);

            if (chunks.length === 0) {
                // Fallback if split didn't work well (e.g. PDF yielded one big block)
                // Just take the whole thing if it's not massive, or rudimentary split
                if (rawText.length > 50) chunks = [rawText];
            }

            console.log(`Processing ${fileName}: ${chunks.length} chunks found.`);

            for (const [index, chunk] of chunks.entries()) {
                try {
                    const embedding = await getEmbedding(chunk);
                    if (embedding) {
                        documents.push({
                            text: chunk.trim(),
                            embedding: embedding,
                            source: `${fileName} (chunk ${index + 1})`
                        });
                    }
                } catch (e) {
                    console.error(`Error embedding chunk from ${fileName}:`, e.message);
                    if (e.message.includes('expired') || e.message.includes('security token')) {
                        console.error("\n[!] TIP: It looks like your credentials are expired or not found.");
                        console.error("    Try running with your SSO profile explicitly:");
                        console.error("    AWS_PROFILE=AdministratorAccess-520477993393 node scripts/generate-embeddings.js\n");
                        // Stop usage to prevent spamming errors
                        process.exit(1);
                    }
                }
            }

        } catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
        }
    }

    const outputPath = path.join(__dirname, '../knowledge-base.json');
    fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

    console.log("----------------------------------------------------------------");
    console.log(` SUCCESSFULLY COMPLETED`);
    console.log(` Generated ${documents.length} embeddings.`);
    console.log(` Saved to: ${outputPath}`);
    console.log("----------------------------------------------------------------");
    console.log(" NEXT STEP: Upload this file to your S3 bucket.");
    console.log(" Command: aws s3 cp knowledge-base.json s3://<YOUR_BUCKET_NAME>/knowledge-base/embeddings.json");
}

main();
