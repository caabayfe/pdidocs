/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const handlerUtil = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    var frequencyCard = JSON.parse(JSON.stringify(api.state.frequencyCard));
    frequencyCard.occurrences.count = event.payload.fieldValue;
    frequencyCard.estimatedEdnDateShow = false;
    if (frequencyCard.occurrences.count > 0 && frequencyCard.occurrences.count <= frequencyCard.occurrences.maxCount) {
        frequencyCard.estimatedEdnDateShow = true;
        handlerUtil.getEstimatedSeriesEndDate(frequencyCard);
    } else {
        frequencyCard.estimatedEdnDateShow = false;
        api.setState("frequencyCard", frequencyCard);
        handlerUtil.validateCloneRequest({"frequencyCard": frequencyCard});
    }
}
