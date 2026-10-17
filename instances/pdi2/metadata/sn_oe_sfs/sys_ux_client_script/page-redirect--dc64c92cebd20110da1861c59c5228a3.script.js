/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var defConfigId = api.context.props.deflectionconfigurationId;
    if(defConfigId == -1)
        helpers.navigate.to('deflection-settings',{},{"timestamp": Date.now()});
}
