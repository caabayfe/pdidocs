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

    const {telemetryData} = api.context.props.payload;

    if (telemetryData && telemetryData.disable)
        return;

    const plugins = api.state.plugins || [];
    if (!plugins.length)
        return;

    if (api.context.props && api.context.props.payload &&
        api.context.props.payload.buttonLabel) {
        const buttonLabel = api.context.props.payload.buttonLabel || '';
        const eventName = 'Click Plugin Learn More';
        plugins.forEach(p => {
            let url = '';
            if (p.type == 'plugin' && p.id) {
                url = `$allappsmgmt.do?sysparm_search=${p.id}`;

            } else if (p.type == 'application' && p.id) {
                url = `https://store.servicenow.com/sn_appstore_store.do#!/store/application/${p.id}/`;
            }
            const pluginName = p.name || '';
            const pluginSysId = p.pluginId || '';
            if (telemetryData && telemetryData.disable)  
                return;

            let payload = {
                label: buttonLabel,
                pluginSysId: pluginSysId,
                pluginName: pluginName,
                url: url
            };

            if (telemetryData && telemetryData.append_to_payload) {
                payload = {
                    ...payload,
                    ...telemetryData.append_to_payload
                }
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
