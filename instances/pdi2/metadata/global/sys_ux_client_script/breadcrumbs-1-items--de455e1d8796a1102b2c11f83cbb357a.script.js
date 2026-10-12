/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        "label": helpers.translateSync("Simulations"),
        "href": "/now/conversation/iar/simulation/home"
    }, {
        "label": api.state.simulationName,
        "href": "/now/conversation/iar/simulation/details/params/sim-record-id/" + api.state.simulationID
    }, {
        "label": helpers.translateSync("Run at {0}", api.state.completedTime)
    }];
}
