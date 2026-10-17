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
    const eventPayload = (event.payload.data && event.payload.data.output) || {};
    const {
        plugins = [], status, isUpdateAvailable
    } = eventPayload;
    api.setState('status', status);
    const {
        mode,
        configureDemoData,
        postActionLink
    } = api.context.props.payload;
    const pluginss = plugins.map(p => {
        return {
            ...p,
            install_demo_data: configureDemoData && p.hasDemoData
        };
    });
    if(pluginss.length > 0){
        api.setState('showLoader',false);
    }
    api.setState('plugins', pluginss);
    api.setState('newPluginList', pluginss.filter((plugin) => {
        return !plugin.installed;
    }));
    api.setState('updatePluginList', pluginss.filter((plugin) => {
        return plugin.installed;
    }));

    const {telemetryData} = api.context.props.payload;

    if (telemetryData && telemetryData.disable)
        return;

    if (!pluginss.length)
        return;

    const buttonLabel = api.context.props.payload.buttonLabel;
    pluginss.forEach(p => {
        const pluginName = p.name || '';
        const pluginSysId = p.pluginId || '';
        let payload = {
            label: buttonLabel,
            pluginSysId: pluginSysId,
            pluginName: pluginName
        }

        if (telemetryData && telemetryData.append_to_payload) 
            payload = {
                ...payload,
                ...telemetryData.append_to_payload
            }
        
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: 'Install Plugin',
            value: {
                payload
            }
        });
    });
}
