'use client'
import Loader from '@/components/Loader';
import { getTaskDetails } from '@/lib/apiCalls';
import { rgbDataURL } from '@/lib/blurryImage';
import Image from 'next/image';
import { useEffect, useState } from 'react'

export default function TaskPage({ params: { taskID } }: { params: { taskID: string } }) {

    const [result, setResult] = useState<Record<string, {
        count: number;
        option: {
            imageURL: string
        }
    }>>({})

    const [taskDetails, setTaskDetails] = useState<{ title?: string }>({})
    const [loading, setLoading] = useState(true)


    async function fetchData() {
        getTaskDetails(taskID)
            .then((data) => {
                setResult(data.result)
                setTaskDetails(data.taskDetails)
                setLoading(false)
            })
            .catch((e) => {
                setLoading(false)
            })
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(() => fetchData(), 5000)

        return () => clearInterval(interval)
    }, [taskID])


    if (loading) {
        return <Loader bgHeight="80vh" height="4rem" width="4rem" color="#ffffff" />
    }

    return (
        <>
            <span className='text-2xl pt-20 flex justify-center'>
                {taskDetails.title}
            </span>
            <div className='w-full flex flexflex-wrap justify-center gap-6 pt-8 px-12'>
                {Object.keys(result || {}).map((taskID, idx) => <Task key={idx} imageURL={result[taskID].option.imageURL} votes={result[taskID].count} />)}
            </div>
        </>
    )
}

function Task({ imageURL, votes }: { imageURL: string; votes: number; }) {
    return (
        <div className='flex flex-col items-center gap-2'>
            <Image
                className="rounded-md"
                src={imageURL}
                width={400}
                height={300}
                alt='task-image'
                placeholder='blur'
                blurDataURL={rgbDataURL(128, 128, 128)}
                unoptimized
            />
            <span className='text-xl'>{votes}</span>
        </div>
    )
}