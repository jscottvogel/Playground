import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend
 */
import { scottBotHandler } from './functions/chat-handler/resource';

const backend = defineBackend({
    auth,
    data,
    scottBotHandler,
    storage,
});

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Grant Bedrock Access to the Chat Function
backend.scottBotHandler.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        effect: 'Allow' as any,
        actions: ['bedrock:InvokeModel'],
        resources: [
            `arn:aws:bedrock:*::foundation-model/*`,
            `arn:aws:bedrock:*:*:inference-profile/*`
        ]
    })
);

// Grant Chat Handler access to read from storage (resumes, etc.)
backend.storage.resources.bucket.grantRead(backend.scottBotHandler.resources.lambda);

// Pass bucket name to env vars so Lambda knows where to look for config
backend.scottBotHandler.resources.lambda.addEnvironment('STORAGE_BUCKET_NAME', backend.storage.resources.bucket.bucketName);
