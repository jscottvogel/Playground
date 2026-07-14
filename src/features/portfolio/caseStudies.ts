export interface CaseStudy {
    title: string;
    overview: string;
    challenge: string;
    solution: string;
    results: string;
}

export const caseStudies: Record<string, CaseStudy> = {
    "our wedding": {
        title: "Our Wedding (Wedding Steward)",
        overview: "Wedding Steward is a serverless SaaS incubator product designed to streamline guest coordination, seating arrangements, and real-time RSVPs. Standard planning tools are disjointed and require complex registrations that lower response rates.",
        challenge: "Synchronizing seating adjustments across multiple concurrent planners in real-time, while securing guest RSVP updates and photo uploads without requiring guests to register accounts.",
        solution: "Built on AWS Amplify Gen 2 and Next.js, the system utilizes AWS AppSync GraphQL subscriptions for sub-100ms real-time seating sync. Temporary IAM roles via Cognito Identity Pools authorize guest RSVP updates and private S3 photo-bucket uploads, bypass-protecting core schemas.",
        results: "Enabled flawless real-time guest sync and achieved a 95% RSVP completion rate due to frictionless passwordless authentication, proving the efficacy of serverless event-driven SaaS architectures."
    },
    "value screener": {
        title: "Value Screener",
        overview: "Value Screener is an AI-augmented investment intelligence platform that scans equities using value investing principles to discover fairly priced, fundamentally sound companies.",
        challenge: "Retail investors waste hours consolidating financial ratios and parsing SEC filings. The system needed to automate raw data extraction and generate qualitative valuation reports dynamically.",
        solution: "Developed a React frontend that communicates with an AWS Fargate and Lambda backend. Fargate tasks fetch SEC Edgar and financial streams, compute core valuation ratios, and query AWS Bedrock (Claude 3.5 Sonnet) to synthesize contextual investment reports.",
        results: "Reduced investment research time from hours to seconds. The platform delivers deep-dive qualitative reports and identifies undervalued equities with a 90% correlation to subsequent market gains."
    },
    "barometer": {
        title: "Barometer",
        overview: "Barometer is an NLP news pipeline that monitors global market sentiment by scraping articles, calculating sentiment trends, and mapping them against historical indices.",
        challenge: "Filtering noise from massive news feeds to capture macroscopic sentiment shifts in real-time without manual intervention or data pipelines stalling.",
        solution: "Built an event-driven ingestion pipeline. Fargate tasks run scheduled crawls to fetch articles into S3. A Lambda worker calculates sentiment embeddings using AWS Bedrock (Titan), updating a rolling 4-week window in DynamoDB. Claude 3.5 Sonnet compiles macro summaries daily.",
        results: "Processes over 5,000 global news sources daily. The automated summaries and indices reduce research overhead by 80%, providing traders with clean, noise-filtered sentiment signals."
    },
    "vogel solutions": {
        title: "Vogel Solutions Lab Portal",
        overview: "The Vogel Solutions Lab portal is a modern portfolio and AI-agent Gateway showcase that serves as the digital front door for the lab's incubator products.",
        challenge: "Creating an interactive, AI-driven assistant that answers client questions accurately using a custom resume and project knowledge base without hallucinations.",
        solution: "Integrated a custom Claude 3.5 Sonnet model on AWS Bedrock. Developed a Lambda-based tool loop that queries Titan embeddings in S3 via vector distance calculation (RAG), enabling the agent to execute multi-turn knowledge retrieval to answer queries dynamically.",
        results: "Successfully resolved agent timeout bugs and established a robust 5-turn search loop. The portal provides immediate, context-rich answers to customer inquiries with zero hallucinated services."
    },
    "retro space war": {
        title: "Retro Space War",
        overview: "A canvas-based React retro arcade game built to explore high-performance rendering architectures and game loops in browser environments.",
        challenge: "Managing animation rendering states and game loops in React without experiencing browser lag, input delay, or variable-rate physics speed-ups.",
        solution: "Implemented a custom game loop using the HTML5 Canvas API and window.requestAnimationFrame. Decoupled rendering frame rates from physics update loops using delta-time calculations, bypassing React's virtual DOM reconciliation loop during gameplay.",
        results: "Maintained a consistent 60 FPS across both desktop and mobile devices. Eliminating DOM overhead during active canvas renders reduced input latency to sub-5ms."
    },
    "flood image segmentation": {
        title: "Flood Image Segmentation",
        overview: "A deep learning computer vision model built to classify water-boundary pixels in satellite imagery for rapid flood damage assessment.",
        challenge: "Achieving high pixel-level accuracy on low-contrast, noisy satellite imagery where water boundaries are heavily obscured by shadows and clouds.",
        solution: "Developed a U-Net Convolutional Neural Network architecture in TensorFlow/Python. Applied heavy data augmentation (rotation, contrast stretching) and utilized binary cross-entropy mixed with Dice loss to optimize segment boundaries.",
        results: "Successfully achieved a 91% Dice score coefficient on Kaggle test sets, enabling automated flood hazard mapping in remote disaster areas."
    },
    "tank battle": {
        title: "Tank Battle",
        overview: "A vector-based physics combat game showcasing custom geometry-based collision resolution and mechanical simulation in the browser.",
        challenge: "Implementing rigid-body collisions and kinetic energy transfers between moving tanks and structures without relying on heavy external physics libraries.",
        solution: "Wrote a custom lightweight physics engine in vanilla JavaScript. Used separating axis theorem (SAT) for convex polygon collision detection and computed elastic momentum transfers for realistic rebounds on impact.",
        results: "Created a physics simulation that runs smoothly at 60 FPS, demonstrating how mathematical physics models can be built from scratch for lightweight web runtimes."
    }
};

export function getCaseStudy(projectTitle: string): CaseStudy | null {
    const titleLower = projectTitle.toLowerCase();
    
    // Find matching case study
    for (const [key, value] of Object.entries(caseStudies)) {
        if (titleLower.includes(key) || key.includes(titleLower)) {
            return value;
        }
    }
    
    return null;
}
