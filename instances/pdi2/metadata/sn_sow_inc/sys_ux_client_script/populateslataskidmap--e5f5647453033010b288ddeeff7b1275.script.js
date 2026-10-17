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
    var slaTaskIdMap = {};
    var serviceDeskUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
    var evamDef = serviceDeskUtils.getEvamDef();
    if (api.state.currentVizSelection.evamId == evamDef.incidentSlaEvamDefinitionId) {
        var items = api.data.bind_data_to_component_prop_1.output.items;
        for (var index in items) {
            if (!slaTaskIdMap[items[index].propValues.model.sysId])
                slaTaskIdMap[items[index].propValues.model["sysId"]] = items[index].propValues.model["task.sys_id"];
        }
    }
    api.setState('slaTaskIdMap', slaTaskIdMap);
}
