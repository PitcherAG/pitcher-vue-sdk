const source = 'modal'
let fireEventCount = 0

function fireEvent(name, params) {
    return new Promise((resolve, reject) => {
        const eventID = fireEventCount++

        const callback = `fireEventCB${eventID}`
        const errorCallback = `fireEventErrorCB${eventID}`

        if (!params) {
            params = {}
        }

        params.callBackFunc = callback
        params.callBack = callback
        params.errorFunc = errorCallback
        params.emptyFunction = errorCallback
        params.source = params.source || source

        function destroyEvent() {
            delete window[callback]
            delete window[errorCallback]
        }

        window[callback] = res => {
            if (res.startsWith('{') || res.startsWith('[')) {
                try {
                    resolve(JSON.parse(res))
                } catch (e) {
                    reject('Invalid JSON')
                }
            } else {
                resolve(res)
            }

            destroyEvent()
        }

        window[errorCallback] = error => {
            reject(error)
            destroyEvent()
        }

        if (Object.prototype.hasOwnProperty.call(window, 'Ti')) {
            window.Ti.App.fireEvent(name, params)
        } else {
            reject('Ti not found')
        }
    })
}

export { fireEvent, fireEventCount, source }
