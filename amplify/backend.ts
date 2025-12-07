import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend
 */
import { chatHandler } from './functions/chat-handler/resource';

const backend = defineBackend({
    auth,
    data,
    chatHandler,
});

// Grant Bedrock Access to the Chat Function
backend.chatHandler.resources.lambda.addToRolePolicy({
    effect: 'Allow',
    actions: ['bedrock:InvokeModel'],
    resources: [`arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`]
} as any);
