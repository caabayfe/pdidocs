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
    if(api.context.props.deflectionconfigurationId == -1){
        return;
    }

    const res = {};
    api.data.get_deflection_configuration.items.map(function(field) {
        res[field['label']]  = field['value'];
    });
    api.setState("def_config_details", res);
}
