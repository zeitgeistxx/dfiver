const API_URL = process.env.NEXT_PUBLIC_API_URL as string

export async function userSignIn(publicKey: string, signature: Uint8Array) {
    try {
        const res = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            body: JSON.stringify({
                publicKey,
                signature
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()

        sessionStorage.setItem('token', data.token)
    }
    catch (err) {
        console.error(err)
    }
}


export async function getPresignedURL(filename: string) {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/presignedUrl?filename=${filename}`, {
            headers: {
                "Authorization": token
            },
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}


export async function createTask(images: Array<string>, title: string, txnSignature: string) {
    const token = sessionStorage.getItem("token")
    if (!token) return

    const options = images.map((image) => ({
        imageURL: image
    }))

    try {
        const res = await fetch(`${API_URL}/task`, {
            method: 'POST',
            body: JSON.stringify({
                options,
                title,
                signature: txnSignature
            }),
            headers: {
                "Authorization": token,
                'Content-Type': 'application/json'
            }
        })

        const data = await res.json()

        return data.id
    }
    catch (err) {
        console.error(err)
    }
}


export async function getAllTasks() {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/all-tasks`, {
            headers: {
                "Authorization": token
            },
        })

        const data = await res.json()

        return data.tasks
    }
    catch (err) {
        console.error(err)
    }
}


export async function getTaskDetails(taskID: string) {
    const token = sessionStorage.getItem("token")
    if (!token) return

    try {
        const res = await fetch(`${API_URL}/task?taskID=${taskID}`, {
            headers: {
                "Authorization": token
            },
        })

        const data = await res.json()

        return data
    }
    catch (err) {
        console.error(err)
    }
}
