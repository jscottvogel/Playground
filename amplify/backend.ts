import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * @see https://docs.amplify.aws/gen2/build-a-backend
 */
import { scottBotHandler } from './functions/chat-handler/resource';
import { contactNotifier } from './functions/contact-notifier/resource';

const backend = defineBackend({
    auth,
    data,
    scottBotHandler,
    contactNotifier,
    storage,
});

import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';

// Enable DynamoDB stream on GuestVisit table
const guestVisitTable = backend.data.resources.tables['GuestVisit'];
const cfnTable = guestVisitTable.node.defaultChild as any;
cfnTable.streamSpecification = {
    streamViewType: StreamViewType.NEW_AND_OLD_IMAGES
};

// Add DynamoDB Event Source trigger to contactNotifier function
backend.contactNotifier.resources.lambda.addEventSource(
    new DynamoEventSource(guestVisitTable, {
        startingPosition: StartingPosition.LATEST
    })
);

// Grant SES Email Sending Access to Notifier
backend.contactNotifier.resources.lambda.addToRolePolicy(
    new PolicyStatement({
        effect: 'Allow' as any,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*']
    })
);

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

