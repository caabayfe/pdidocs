/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState('isLoading', true);

    var allIndicators = JSON.parse((await imports['sn_sd.getBmInfo'](helpers, 'indicators?sysparm_category=' + api.context.props.category)).response.result);
    var formatedIndicators = imports['sn_sd.formatIndicators'](allIndicators);
    var currentTab = api.state.currentTab;
    var currentIndicators = formatedIndicators.filter(function(indicator) {
        if (indicator.category == api.context.props.category) {
            if (currentTab.sys_id == "ALL") {
                return indicator;
            } else {
                if (indicator.group == currentTab.sys_id) return indicator;
            }
        }
    });
    api.setState('allIndicators', allIndicators);
    api.setState('formatedIndicators', formatedIndicators);
    api.setState('currentIndicators', currentIndicators);
    api.setState('isLoading', false);
    api.setState("changedPayload", {});

}
