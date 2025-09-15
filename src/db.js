import { PrismaClient } from "../lib/generated/prisma/index.js"
const prisma = new PrismaClient()

async function getUser(){
    const user = await prisma.client.findMany()
    console.log(user)
}

getUser()