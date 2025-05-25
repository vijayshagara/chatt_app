class Session {
    static getSessionValue(key: string) {
        const session: { [key: string]: string | number } = {
            userId: 'e018167d-35e7-42c2-b527-f6381104d36a',
        }
        return session[key] || null
    }
}

export default Session
