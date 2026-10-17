/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.fetch_incident_related_data.output == null)
        return;
    let records = api.data.fetch_incident_related_data.output.relatedRecords;
    let noOfRecords = records.length;
    return noOfRecords;
}
