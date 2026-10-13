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
    const {
        startDate,
        endDate
    } = api.context.props;
    const {
        payload = {}
    } = event;
    const {
        params: {
            dataSourceType,
            indicatorSysid,
            table
        } = {}
    } = payload;

    const navItemSelected = (route, extraParams = {}) => {
        api.emit("NAV_ITEM_SELECTED", {
            route,
            params: {
                startDate,
                endDate,
                ...extraParams
            }
        });
    };

    if (dataSourceType === "indicator" && indicatorSysid === "eed010cd77200210dfe21f130e5a9911" && table === "sn_ci_analytics_st_cs_event") {
        const spokeName = event.payload.data.elements[0];
        api.data.get_id.execute({
            "event_type": "Spoke",
            "name": spokeName
        });
    } else if (dataSourceType === 'indicator' && (indicatorSysid === '2596cf3877233110dfe21f130e5a9925' || indicatorSysid === 'd12820d2775142109cc2da3ccd5a99d0')) {
        const topicName = event.payload.data.elements[0];
        api.data.get_id.execute({
            "event_type": "Topic",
            "name": topicName
        });
    }
}
