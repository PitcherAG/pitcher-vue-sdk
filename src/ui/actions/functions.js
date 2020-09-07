import { Instance } from '../instance'

window.updateStatusBadge = function(value) {
    Instance.updateStatusBadge(value)
}

window.getCategoryLogoURL = function() {
    return Instance.getCategoryLogoURL()
}

window.finishedCreatingPresentation = function() {
    Instance.loadPresentationsFromDB()
}

window.sentPitcherEvent = function() {
    Instance.sentPitcherEvent()
}
