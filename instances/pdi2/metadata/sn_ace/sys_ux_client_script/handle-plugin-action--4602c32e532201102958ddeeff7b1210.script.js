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
        plugins,
        mode
    } = api.context.props.payload;
    const pluginss = plugins.map(p => {
        return {
            ...p,
            install_demo_data: false
        };
    });
    api.setState('plugins', pluginss);
    console.log("MODE",mode)
    switch (mode) {
        case 'install':
            {
                if (pluginss.length == 1) {
                    api.setState('plugin', pluginss[0]);
                    helpers.modal.open("[component-id$='single_plugin_install_modal']");
                    api.setState('hideSinglePluginInstallModal', false);
                } else if (pluginss.length > 1) {
                    helpers.modal.open("[component-id$='plugin_properties_modal']");
                    api.setState('hideModal', false);
                }
                break;

            }
        case 'update':
            {
                if (pluginss.length == 1) {
                    api.setState('plugin', pluginss[0]);
                    helpers.modal.open("[component-id$='single_plugin_update_modal']");
                    api.setState('hideSinglePluginUpdateModal', false);
                } else if (pluginss.length > 1) {
                    helpers.modal.open("[component-id$='plugin_properties_update_modal']");
                    api.setState('hideUpdateModal', false);
                }


            }
    }
}
