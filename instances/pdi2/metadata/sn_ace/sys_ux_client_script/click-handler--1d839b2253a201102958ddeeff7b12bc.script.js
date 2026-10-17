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
    if (api.context.props.payload.props_details.post_action_type == "event") {
        api.emit('ACE_ACTION_PERFORMED_RELAY_c88c575953a601102958ddeeff7b122e', {
            eventName: 'POST_INSTALL_EVENT',
            eventPayload: api.context.props.payload.props_details
        });
    } else {
        var target = api.context.props.payload.props_details.new_tab_config ? '_blank' : '_self';
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: api.context.props.payload.props_details.plugin_home_url,
                target: target
            }
        });
    }
    const {telemetryData} = api.context.props.payload;

    if (telemetryData && telemetryData.disable)
        return;

    const {payload} = api.context.props;
    if (!payload)
        return;
    
    const {props_details} = payload;
    if (!props_details)
        return;
    
    const {plugin_name, post_action_label, plugin_home_url, plugins} = props_details;
    let pluginName = plugin_name  ? plugin_name : '';
    let buttonLabel = post_action_label ? post_action_label : '';
    let url = plugin_home_url ? plugin_home_url : '';
    let pluginSysId;
    if (plugins) {
        if (Object.keys(JSON.parse(plugins)).length > 0)
            pluginSysId = Object.keys(JSON.parse(plugins))[0];
    }

    let eventPayload = {
        label: buttonLabel,
        pluginSysId: pluginSysId || '',
        pluginName: pluginName,
        url: url
    }
    if (telemetryData && telemetryData.append_to_payload)
        eventPayload = {
            ...eventPayload,
            ...telemetryData.append_to_payload
        }

    api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
        event: 'Click Plugin Get Started',
        value: {
            eventPayload
        }
    });

}
