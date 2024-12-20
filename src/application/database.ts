import {PrismaClient} from "@prisma/client";

export const prismaClient = new PrismaClient({
    log :[
        {
            emit : 'event',
            level :'query'
        },
        {
            emit: 'event',
            level: 'error'
        },
        {
            emit: 'event',
            level: 'info'
        },
        {
            emit: 'event',
            level: 'warn'
        }
    ]
})