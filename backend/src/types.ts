import z from 'zod'

export const createTaskInput = z.object({
    options: z.array(z.object({
        imageURL: z.string()
    })),
    title: z.string().optional(),
    signature: z.string()
})

export const createSubmissionInput = z.object({
    taskID: z.number(),
    selection: z.number(),
})