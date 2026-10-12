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
    if (api.data.get_deflection_pattern_details.output.alert) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'cross_scope_alert',
                status: 'warning',
                content: {
                    type: "html",
                    value: api.data.get_deflection_pattern_details.output.alert
                }
            }]
        });
        api.setState("disable_save", true);
    }
    var val = true;

    if (api.data.get_deflection_pattern_details.output.primary_activity_table != "--None--") {
        val = false;
    }
    api.setState('hide_condition_builder', val);
    api.setState('hideComponent', false);
    // copy by reference is conflicting between state variable and data variable
    try {
        var deflection_pattern_details = JSON.parse(JSON.stringify(api.data.get_deflection_pattern_details.output));
        api.setState('deflection_pattern_details', deflection_pattern_details);
    } catch (e) {
        api.setState('deflection_pattern_details', {});
    }
    var outcomeChoices = [];
    deflection_pattern_details.outcome_choices.map(function(choice) {
        outcomeChoices.push({
            id: choice.value,
            label: choice.label
        });
    });
    api.setState('outcome_items', outcomeChoices);
}
