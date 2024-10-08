import { Worker } from "bullmq"
import { PrismaClient } from "@prisma/client";
import { failedPayoutQueue } from "./config";
import { redisConnection } from "../../config";
import { processPayout } from "../payout";


const prismaClient = new PrismaClient()


interface PayoutJob {
    payout_id: number;
    to: string;
    amount: number;
}


export const payoutWorker = new Worker('payouts', async (job) => {
    const data: PayoutJob = job.data
    console.log('Job Received.. ', job.id)

    const signature = await processPayout({
        to: data.to,
        amount: data.amount
    })

    if (!signature) {
        /* add failed payouts to DLQ */
        await failedPayoutQueue.add(`failed_payout_${data.to}`, data)

        await job.moveToFailed(new Error('Payout to worker failed'), 'Payout to worker failed', true)
    }
    else {
        const worker = await prismaClient.worker.findUnique({
            where: {
                address: data.to
            }
        })

        if (!worker) throw new Error("Worker not found")

        await prismaClient.$transaction(async (tx) => {
            await tx.balance.update({
                where: {
                    worker_id: worker.id
                },
                data: {
                    processing_amount: {
                        decrement: data.amount
                    },
                    locked_amount: {
                        increment: data.amount
                    }
                }
            })


            await tx.payouts.update({
                where: {
                    id: data.payout_id
                },
                data: {
                    signature,
                    status: 'Success'
                }
            })
        })


        return 'Payment Successful'
    }

}, {
    connection: redisConnection,
    concurrency: 2,
    limiter: {
        max: 4,
        duration: 10 * 1000
    }
})
