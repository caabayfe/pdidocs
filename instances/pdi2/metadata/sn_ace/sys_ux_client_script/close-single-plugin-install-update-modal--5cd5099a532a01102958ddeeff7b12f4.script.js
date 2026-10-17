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
    helpers.modal.close("single_plugin_install_update_modal");
    api.setState('hideSinglePluginInstallUpdateModal', true);
    //call for close the Single plugin install model
    if (api.state.status == 'ready to install') {
        // ready to install status will be come once user will manually close the dailog
        
        const {telemetryData} = api.context.props.payload;
        if (telemetryData && telemetryData.disable)
            return;
        
        const plugins = api.state.plugins || 0;
        if (!plugins.length)
            return;

        const buttonLabel = api.context.props.payload.buttonLabel;
        const eventName = 'Close Plugin Install Dialog';
        plugins.forEach(p => {
            let payload = {
                label: buttonLabel,
                pluginSysId: p.pluginId || '',
                pluginName: p.name || ''
            }

            if (telemetryData && telemetryData.append_to_payload)
                payload = {
                    ...payload,
                    ...telemetryData.append_to_payload
                }

            api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
                event: eventName,
                value: {
                    payload
                }
            });
        });

    }
}
