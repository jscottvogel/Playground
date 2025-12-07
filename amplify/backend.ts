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

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Grant Bedrock Access to the Chat Function
backend.chatHandler.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        effect: 'Allow' as any, // Cast to any if strict enum types mismatch between versions, but usually Effect.ALLOW is best. Keeping it simple.
        actions: ['bedrock:InvokeModel'],
        resources: [`arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`]
    })
);
