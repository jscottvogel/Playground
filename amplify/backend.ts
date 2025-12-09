import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend
 */
import { chatHandler } from './functions/chat-handler/resource';

const backend = defineBackend({
    auth,
    data,
    chatHandler,
    storage,
});

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Grant Bedrock Access to the Chat Function
backend.chatHandler.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        effect: 'Allow' as any,
        actions: ['bedrock:InvokeModel'],
        resources: [`arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0`]
    })
);

// Grant Chat Handler access to read from storage (resumes, etc.)
backend.storage.resources.bucket.grantRead(backend.chatHandler.resources.lambda);
