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
        name,
        outcome,
        primary_activity_table,
        filter_conditions
    } = api.state.deflection_pattern_details;

    var payload = {
        name: name,
        outcome: outcome,
        primary_activity_table: primary_activity_table,
        deflection_configuration_id: api.context.props.configId,
        activity_pattern_id: api.context.props.patternId,
        primary_activity_filter: filter_conditions
    };

    if (name == '' || name == undefined) {
        api.setState('invalid', true);
        payload = null;
    }

    const {
        name: patternName,
        outcome: patternOutcome,
        primary_activity_table: pattern_primary_activity_table,
        filter_conditions: pattern_filter_conditions
    } = api.data.get_deflection_pattern_details.output;

    if (api.context.props.patternId != -1 &&
        name == patternName &&
        outcome == patternOutcome &&
        primary_activity_table == pattern_primary_activity_table &&
        filter_conditions == pattern_filter_conditions
    ) {
        payload = null;
    }

    if (!payload) {
        api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
            loading: true
        });
        helpers.timing.setTimeout(() => {
            api.emit('NOW_UXF_PAGE#SET_LOADING_STATE', {
                loading: false
            });
        }, 1000);
    } else {
        api.data.update_deflection_pattern_details.execute(payload);
    }

    helpers.timing.setTimeout(() => {
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS', {});
    }, 10 * 1000);

}
