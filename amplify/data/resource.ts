import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*
 * Define your data schema
 * @see https://docs.amplify.aws/gen2/build-a-backend/data/models
 */

const schema = a.schema({
    Project: a
        .model({
            title: a.string(),
            description: a.string(),
            imageUrl: a.string(),
            demoUrl: a.string(),
            gitUrl: a.string(),
            skills: a.string().array(),
            isActive: a.boolean().default(true),
        })
        .authorization((allow) => [
            // Public can read projects
            allow.publicApiKey().to(['read']),
            // Admins group can do everything
            allow.groups(['Admins']).to(['create', 'update', 'delete']),
            // Owner (if signed in and not admin, though admin group covers most)
            allow.owner(),
        ]),

    GuestVisit: a
        .model({
            email: a.string().required(),
            visitedAt: a.datetime(),
        })
        .authorization((allow) => [
            // Guests (public) can create a visit record (submit email)
            allow.publicApiKey().to(['create']),
            // Admin can read these
            allow.owner(),
        ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'apiKey',
        // API Key is used for public access
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});
