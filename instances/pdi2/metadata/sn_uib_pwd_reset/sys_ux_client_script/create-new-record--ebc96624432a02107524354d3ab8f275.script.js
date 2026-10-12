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
    const result = event.payload.data.output ? event.payload.data.output : {};

    if (!result.isValid || !api.context.props.additionalInfo.recordInfo)
        return;

    const pwdResetUtil = imports["sn_uib_pwd_reset.PwdResetUxfClientUtil"]();
    const table = api.context.props.additionalInfo.recordInfo.table;
    const sysId = api.context.props.additionalInfo.recordInfo.sysId;
    const shortDescription = api.state.errorDetails.shortDescription;

    if (!table || !sysId || !shortDescription)
        return;

    if (table === 'incident') { //Open new L2 tab for child incident
        api.emit('NAV_ITEM_SELECTED', {
            "route": "record",
            "targetRoute": "current",
            "fields": {
                "table": "incident",
                "sysId": -1
            },
            "params": {
                "query": "category=password_reset^urgency=" + pwdResetUtil.getIncidentDefaultUrgency() + "^short_description=" + shortDescription + "^impact=" + result.impact + "^caller_id=" + result.assignedTo + "^parent_incident=" + sysId
            }
        });
    } else { //open the newly created incident in L2 tab
        api.emit('NAV_ITEM_SELECTED', {
            "route": "record",
            "targetRoute": "current",
            "fields": {
                "table": "incident",
                "sysId": result.incidentSysId
            }
        });
    }
}
