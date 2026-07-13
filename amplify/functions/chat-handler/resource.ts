import { defineFunction } from '@aws-amplify/backend';

export const scottBotHandler = defineFunction({
    name: 'chatHandler',
    resourceGroupName: 'data',
    entry: './handler.ts',
    timeoutSeconds: 60, // Give Bedrock time to think
    environment: {
        // Add any necessary env vars here
        FORCE_REDEPLOY: "true2",
    },
});
