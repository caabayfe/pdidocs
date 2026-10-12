function handler({ api, helpers, event, imports }) {
    const { generateNavigationPayload } = imports['sn_ace.Navigation Payload']();
    try {
        const { endpoint = 'settings', type ='page' } = event.payload.item.props_details;
        if ( type === 'page') {
            let payload = generateNavigationPayload(endpoint, api.state.selectedContent.fields, api.state.selectedContent.params);
            if (payload)
                api.emit('NAV_ITEM_SELECTED', payload);
        } else {
            if (endpoint)
                api.emit('NAV_ITEM_SELECTED', {
                    external: {
                        url:  endpoint
                    }
                });
        }

    } catch (e) {
        console.error('[ACE] ERROR while navigating to side nav item', event.payload.item);
        return;
    }
}
