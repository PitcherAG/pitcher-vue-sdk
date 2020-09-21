function json_fetch(path, timeout = 5) {
    return new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest()
        xhttp.ontimeout = function() {
            reject({
                error: () => {
                    return { message: 'Timeout' }
                },
                json: () => {
                    return {}
                }
            })
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200 || this.status == 0) {
                    resolve({
                        json: () => JSON.parse(this.response)
                    })
                } else {
                    reject({
                        json: () => {
                            return {}
                        }
                    })
                }
            }
        }
        xhttp.open('GET', path, true)
        xhttp.responseType = 'application/json'
        xhttp.timeout = timeout * 1000
        xhttp.send(null)
    }).catch(error => {
        console.log(error)
    })
}

export { json_fetch }
