import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'drive',
    access: (allow) => ({
        'resumes/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.groups(['Admins']).to(['read', 'write', 'delete'])
        ],
        'projects/*': [
            allow.guest.to(['read']),
            allow.authenticated.to(['read', 'write', 'delete']),
            allow.groups(['Admins']).to(['read', 'write', 'delete'])
        ]
    })
});
