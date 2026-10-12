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
    if(api.data.get_service_desk_agent_shift.output && api.data.get_service_desk_agent_shift.output.nearestShift)
        return;
    let data;
    if(api.data.get_kpi_details_for_user.output)
        data = api.data.get_kpi_details_for_user.output.kpiTargets;
    if (!data || !data.kpiDetails || Object.keys(data.kpiDetails).length <= 0)
        return;
    const userId = api.context.session.user.sys_id;
    const assignToBreakdownUserStringId = data.assignedToBreakdown + ":" + userId;
    let kpiIds = [],
        elementsFilter = [];
    for (let kpiId in data.kpiDetails) {
        kpiIds.push(kpiId + ":" + assignToBreakdownUserStringId);
    }
    api.setState("kpiIds", kpiIds);
    elementsFilter.push(api.state.serviceDeskGroup);
    api.setState("elementsFilter", elementsFilter);
    api.setState("breakdown", "baec0752bf130100b96dac808c0739ed");
    api.setState("breakdownRelation","cce09263eb00020065deac6aa206fe16");
}
