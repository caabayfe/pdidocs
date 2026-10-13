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
    if (api.data.fetch_incident_related_data.output.alert == 'info') {
        return helpers.translateSync('Publish post incident report by {0}.', api.data.fetch_incident_related_data.output.publishBy);
    } else if (api.data.fetch_incident_related_data.output.alert == 'warning') {
        return helpers.translateSync('PIR SLA {0} is approaching. Publish post incident report by {1}.', [api.data.fetch_incident_related_data.output.pir_sla, api.data.fetch_incident_related_data.output.publishBy]);
    } else if (api.data.fetch_incident_related_data.output.alert == 'critical') {
        return helpers.translateSync('Publish post incident report as soon as possible.');
    }
}
