/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */

function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        comparisonRowValueUpdated
    } = imports["sn_ci_analytics.VAConditionBuilderUtils"]();
    const {
        comparisonModel
    } = api.state;

    const labels = api.data.analytics_cb_locale_get_list.output || api.state.DurationFilterLocale;
    const updatedComparisonModel = comparisonRowValueUpdated(event.payload, comparisonModel, labels);
    api.setState('comparisonModel', updatedComparisonModel);
    api.setState('selectedFilterId', '');
}
