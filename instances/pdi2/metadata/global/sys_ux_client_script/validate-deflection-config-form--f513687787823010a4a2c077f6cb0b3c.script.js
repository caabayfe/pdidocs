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
    var {
        name,
        description
    } = api.state.def_config_details;

    var payload = {
        deflection_configuration_id: api.context.props.deflectionconfigurationId,
        name: name,
        description: description
    };
    if (name == '' || name == undefined) {
        api.setState('invalid', true);
        payload = null;
    }

    if (api.context.props.deflectionconfigurationId != -1 && name == api.data.get_deflection_configuration.result._row_data.displayValue && description == api.data.get_deflection_configuration.result.description.displayValue) {
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
        api.data.update_deflection_configuration.execute(payload);
    }

    helpers.timing.setTimeout(() => {
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS', {});
    }, 10 * 1000);

}
