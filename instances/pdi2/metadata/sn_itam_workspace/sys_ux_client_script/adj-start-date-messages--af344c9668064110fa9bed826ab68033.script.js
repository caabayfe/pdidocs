/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    var response = [];
    if (!api.state.adjStartValid) {
        var format = api.context.session.user.dateFormat.toUpperCase();
        response.push({
            "status": "critical",
            "content": "Expected format: " + format
        });
    }
    return response;
}
