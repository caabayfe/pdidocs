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
    let actionData = api.state.splitButtonActionData;
    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);
    const {
        label,
        link
    } = actionData;
    if (actionData) {
        let _url = '';
        let customEventName, customEventPayload;
        switch (event.name) {
            case 'NOW_SPLIT_BUTTON#ITEM_CLICKED':
                customEventName = event.payload.item.event_name;
                if(customEventName) {
                    customEventPayload = event.payload.item;
                }
                _url = event.payload.item.link;
                break;
            case 'NOW_SPLIT_BUTTON#ACTION_CLICKED':
                const cardTitle = api.state.currentScreenData.subtitle;
                const eventName = 'CI - CTA Nav - ' + cardTitle + ' to ' + label.toLowerCase();
                trackUsage(eventName, {
                    title: label,
                    link: link
                });
                customEventName = actionData.event_name;
                if(customEventName) {
                    customEventPayload = actionData;
                }
                _url = actionData.link;
                break;
        }

        if(customEventName) {
            customEventPayload = customEventPayload || {};
            customEventPayload.screenData = JSON.parse(JSON.stringify(api.state.currentScreenData));

            api.emit('ACE_ACTION_PERFORMED_RELAY_bf1e8fa47702011039ac088b3a106145', {
                eventName: customEventName,
                eventPayload: customEventPayload
            });
        }
        
        else if (_url) {
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: _url
                }
            });
        }
    }
}
