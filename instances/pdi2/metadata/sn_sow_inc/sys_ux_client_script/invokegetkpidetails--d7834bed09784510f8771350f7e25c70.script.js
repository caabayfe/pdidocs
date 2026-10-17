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
    if (event.name == 'MACROPONENT_PROPERTY_CHANGED' && event.payload.name != 'performancePluginActive')
            return;
    if (api.data.get_service_desk_agent_shift.output && api.data.get_service_desk_agent_shift.output.nearestShift)
        return;
    if (api.context.props.performancePluginActive) {
        const {
            NowDateTime
        } = imports['sn_uxf.core_libraries']();
        let startDate = NowDateTime.utc().subtract(7, 'days');
        let endDate = NowDateTime.utc();
        api.setState('startDate', startDate.$y + "-" + ("0" + (startDate.$M+1)).slice(-2) + "-" + ("0" + startDate.$D).slice(-2));
        api.setState('endDate', endDate.$y + "-" + ("0" + (endDate.$M+1)).slice(-2) + "-" + ("0" + endDate.$D).slice(-2));
        api.setState('serviceDeskGroup','f31b182fb3210010ed7fc9c316a8dc2a');
    }
}
