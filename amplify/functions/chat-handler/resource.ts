import { defineFunction } from '@aws-amplify/backend';

export const chatHandler = defineFunction({
    entry: './handler.ts',
    timeoutSeconds: 60, // Give Bedrock time to think
    environment: {
        // Add any necessary env vars here
    },
});
