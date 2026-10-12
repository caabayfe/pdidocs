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
    // MIM Use case
    const {
        payload: {
            route = '',
            fields = {}
        } = {}
    } = event;
    const {
        record: {
            table,
            sysId,
            form = {}
        }
    } = api.data;
    if (route === 'promote_to_major_incident' || route === 'reject_major_incident_candidate') {
        event.payload.fields.table = table;
        event.payload.fields.sysId = sysId;
        if (form.fields) {
            event.payload.fields.number = (form.fields.number && form.fields.number.value);
            if (route === 'promote_to_major_incident')
                event.payload.fields.businessImpact = (form.fields.business_impact && form.fields.business_impact.value);
        }
    }
    api.emit("SOW_RECORD#OPEN_MODAL_RELAY", event.payload);
}
