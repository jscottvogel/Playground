import { defineFunction } from '@aws-amplify/backend';

export const contactNotifier = defineFunction({
    entry: './handler.ts',
    timeoutSeconds: 30,
    environment: {
        NOTIFICATION_EMAIL: "hello@vogelsolutionslab.com",
    }
});
