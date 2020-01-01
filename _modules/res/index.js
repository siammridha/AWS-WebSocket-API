module.exports = function () {
    this.defaultCode = 200
    const send = function (arg) {
        return {
            statusCode: this.defaultCode,
            body: JSON.stringify(arg)
        }
    }
    const status = function (code) {
        this.defaultCode = code
        return this
    }
    const sendStatus = function (code) {
        return {
            statusCode: code ? code : this.defaultCode
        }
    }
    return { sendStatus, status, send }
}