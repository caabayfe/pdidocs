/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { hasCmdbAdminOrAdminOrMaint } = imports["sn_cmdb_ws.userRoleUtils"]();
  
    // Handles boolean coercion for the visible property, which does not behave as expected by default.
    var dynamicIreEnabled = api.data.get_system_properties_values.output?.properties?.[
        'glide.identification_engine.dynamic_ire_enabled'
    ];

    // Convert string or boolean to boolean
    var isDynamicIreEnabled = dynamicIreEnabled === true || dynamicIreEnabled === 'true';

    var isCmdbAdmin = hasCmdbAdminOrAdminOrMaint(api.context.session.user.roles);

    api.setState('showDynamicIreEnabled', (isCmdbAdmin && isDynamicIreEnabled) ? 1 : 0);
    api.setState('showDynamicIreDisabled', (isCmdbAdmin && !isDynamicIreEnabled) ? 1 : 0);
}
