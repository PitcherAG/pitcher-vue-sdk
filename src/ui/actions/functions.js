import { Instance } from '../instance'

window.updateStatusBadge = function(value) {
    Instance.updateStatusBadge(value)
}

window.getCategoryLogoURL = function() {
    return Instance.getCategoryLogoURL()
}
