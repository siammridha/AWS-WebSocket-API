module.exports = function () {
    let defaultCode = 200
    const send = function (body) {
        return {
            statusCode: defaultCode,
            body: JSON.stringify(body)
        }
    }
    const status = function (code) {
        defaultCode = code
        return this
    }
    const sendStatus = function (code) {
        return {
            statusCode: code ? code : defaultCode
        }
    }
    const redirect = function (URL) {
        return {
            statusCode: 301,
            headers: {
                Location: URL
            }
        }
    }
    return { send, status, sendStatus, redirect }
}()