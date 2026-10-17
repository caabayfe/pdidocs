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
    const {
        handleRemoveNotifications
    } = imports["sn_sd.SDNotificationHandler"]();
    const emit = api.emit;
    if (event.payload.id == 'modify') {
        let categorySD = api.data.look_up_a_single_record_1.result;

        if (categorySD && categorySD._row_data && categorySD._row_data.uniqueValue == api.context.props.category) {
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert1",
                    status: "critical",
                    icon: "circle-close-fill",
                    content: {
                        type: "html",
                        value: "<p style=\"margin-block: 0\">You cannot update the Success Dashboard Metrics from this page. Modify  <a href=\"/now/success-dashboard-admin-console/kpi-details\" target=\"_blank\" rel=\"noopener noreferrer nofollow\">Success Dashboard Registry</a> to update the indicator.</p>"
                    },
                    action: {
                        type: "dismiss"
                    },
                }]
            });
            handleRemoveNotifications(emit, 'alert1', helpers);
        } else {
            var payload = event.payload;
            var changedPayload = {};
            var sysId = payload.task.indicator_id;
            changedPayload[sysId] = {
                "description": payload.task.description.displayValue
            };

            for (let i = 0; i < payload.task.child_kpis.length; i++) {
                if (payload.task.child_kpis[i]) {
                    var child_sysId = payload.task.child_kpis[i].sys_id;
                    changedPayload[child_sysId] = {
                        "description": payload.task.child_kpis[i].description.displayValue,
                        "condition": payload.task.child_kpis[i].conditions.value
                    };
                }
            }

            api.setState("selectedPayload", payload);
            api.setState("changedPayload", changedPayload);
            helpers.modal.open('custom_1');
        }
    } else {
        var selectedSysId = event.payload.task.sys_id;

        if (event.payload.id == 'optIn') {
            api.setState('isLoading', true);
            var allIndicators = api.state.allIndicators;
            var response = await imports['sn_sd.activateIndicators'](helpers, allIndicators, selectedSysId, event.payload.id);
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
        } else if (event.payload.id == 'optOut') {
            api.setState('sysIdForOptOut', {
                sysId: selectedSysId,
                status: event.payload.id
            });
            helpers.modal.open('confirm_and_destroy_1');
        }
    }
}
