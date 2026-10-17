function handler({
    api,
    helpers,
    event,
    imports
}) {
    const {
        generateNavigationPayload
    } = imports['sn_ace.Navigation Payload']();
    try {
        const {
            endpoint = 'settings', type = 'page', nav_payload, telemetryData
        } = event.payload.item.props_details;
        const canReloadPage = api.context.app.side_nav_page_reload;
        if (type === 'page') {
            let payload = generateNavigationPayload(endpoint, api.state.selectedContent.fields, api.state.selectedContent.params, canReloadPage);
            if (payload)
                api.emit('NAV_ITEM_SELECTED', payload);
        } else if (type === 'custom') {
            if (nav_payload && nav_payload.reload && canReloadPage)
                nav_payload.reload = canReloadPage;
            if (nav_payload && nav_payload.route)
                api.emit('NAV_ITEM_SELECTED', nav_payload);
        } else {
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: endpoint
                }
            });
        }
        if (!telemetryData)
            return;
        if (telemetryData && telemetryData.disable)
            return;

        let payload = {
            title: telemetryData.title || ''
        };

        if (telemetryData && telemetryData.append_to_payload) {
            payload = {
                ...payload,
                ...telemetryData.append_to_payload
            };
        }
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: telemetryData.event_name || "ACE  Side Nav Item Clicked",
            value: {
                payload
            }
        });


    } catch (e) {
        console.error('[ACE] ERROR while navigating to side nav item', event.payload.item);
        return;
    }
}
