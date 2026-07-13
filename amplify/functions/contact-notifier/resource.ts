import { defineFunction } from '@aws-amplify/backend';

export const contactNotifier = defineFunction({
    name: 'contactNotifier',
    resourceGroupName: 'data',
    entry: './handler.ts',
    timeoutSeconds: 30,
    environment: {
        NOTIFICATION_EMAIL: "hello@vogelsolutionslab.com",
    }
});
