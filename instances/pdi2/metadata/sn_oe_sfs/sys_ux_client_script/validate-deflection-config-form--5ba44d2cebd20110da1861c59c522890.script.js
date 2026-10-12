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
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);

    var {
        name,
        description
    } = api.state.def_config_details;

    const deflectionConfigPrevVal = api.data.get_deflection_configuration.result || {};
    
    var payload = {
        deflection_configuration_id: api.context.props.deflectionconfigurationId,
        name: name,
        description: description
    };
    if (name == '' || name == undefined) {
        api.setState('invalid', true);
        payload = null;
    }
    const {
        name: configName = {},
        description: configDescription = {}
    } = deflectionConfigPrevVal;

    const sysId = api.context.props.deflectionconfigurationId;

    if (api.context.props.deflectionconfigurationId != -1 && name == deflectionConfigPrevVal._row_data.displayValue && description == deflectionConfigPrevVal.description.displayValue) {
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

    var modifiedFields = [];
    if (sysId != -1) {
        if (name && name != configName.value) {
            modifiedFields.push('name');
        }
        if (!(configDescription.value == null && !description) && description != configDescription.value) {
            modifiedFields.push('description');
        }
    }
    modifiedFields.forEach(function(field) {
        trackUsage('CI - Frequently modified fields - Deflection Configuration', {
            fields: field
        });
    });

    api.data.get_deflection_configuration.refresh();

    helpers.timing.setTimeout(() => {
        api.emit('NOW_UXF_PAGE#CLEAR_NOTIFICATIONS', {});
    }, 10 * 1000);

}
