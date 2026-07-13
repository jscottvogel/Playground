import { DynamoDBStreamHandler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-1' });

export const handler: DynamoDBStreamHandler = async (event) => {
    console.log(`Processing DynamoDB Stream Event with ${event.Records.length} records.`);
    
    for (const record of event.Records) {
        // We only care about new contact entries
        if (record.eventName !== 'INSERT') continue;
        
        const newImage = record.dynamodb?.NewImage;
        if (!newImage) continue;
        
        const email = newImage.email?.S;
        const visitedAt = newImage.visitedAt?.S || newImage.createdAt?.S;
        
        if (!email) continue;
        
        // Skip log spam/test placeholders if "Guest" is submitted
        if (email.toLowerCase() === 'guest') {
            console.log("Guest token initialization detected. Skipping email alert.");
            continue;
        }
        
        console.log(`New Lead Detected: ${email} submitted at ${visitedAt}`);
        
        const destination = process.env.NOTIFICATION_EMAIL || 'hello@vogelsolutionslab.com';
        
        const emailParams = {
            Source: destination, // Must be verified in AWS SES
            Destination: {
                ToAddresses: [destination],
            },
            Message: {
                Subject: {
                    Data: `[Vogel Lab LLC] New Lead: ${email}`,
                },
                Body: {
                    Text: {
                        Data: `Hello,\n\nA new inquiry has been submitted on Vogel Solutions Lab LLC:\n\nEmail: ${email}\nTime: ${visitedAt}\n\nBest,\nAutomated Lead System`,
                    },
                },
            },
        };
        
        try {
            const command = new SendEmailCommand(emailParams);
            const result = await ses.send(command);
            console.log(`Notification email sent successfully. MessageId: ${result.MessageId}`);
        } catch (error) {
            console.error(`Failed to send notification email via SES. (Note: Make sure destination email is verified in AWS SES console). Error:`, error);
        }
    }
};
