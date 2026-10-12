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
    if (!api.state.amountValidation) {
        response.push({
            "status": "critical",
            "content": "Expected format: [CUR;1234.56] or 1234.56"
        });
    }
    return response;
}
