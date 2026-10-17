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
    const plugins = api.context.props.payload.plugins;
    const {
        postActionLink,
        mode,
        pluginName,
        pluginDetails
    } = api.context.props.payload;
    const status = api.state.status;

     if (status == 'installed' || status == 'updated') {
        api.emit("NAV_ITEM_SELECTED", {
            external: {
                url: postActionLink,
                target: "_self"
            }
        });
    } else {
        const plugins = JSON.parse(api.context.props.payload.plugins);
        const pluginsLength = Object.keys(plugins).length;
        if (pluginsLength == 1) {
            helpers.modal.open("single_plugin_install_update_modal");
            api.setState('hideSinglePluginInstallUpdateModal', false);
        } else if (pluginsLength > 1) {
            helpers.modal.open("plugin_batch_install_update_modal");
            api.setState('hidePluginBatchInstallUpdateModal', false);
        }
        api.data.ace_plugin_details.execute({
            payload: {
                plugins: plugins,
                progress_id: api.state.progressId,
                action: mode,
                pluginDetails: pluginDetails,
                pluginName: pluginName
            }
        });
    }
}
