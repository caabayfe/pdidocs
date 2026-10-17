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
    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    switch (event.elementId){
        case 'data_privacy_nav_button':
        case 'data_privacy_view_details_nav_button':
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: 'now/dp-ux-store-app/anonymization/0',
                }
            });
            break;
        case 'plugin_alert_1':
            api.emit('NAV_ITEM_SELECTED', {
                route: "plugins",
                reload: false
            });
            break;
        case "NOW_TEXT_LINK#CLICKED" : 
            let name = "";
            switch(event.elementId){
                case "user_data_usage_policy_id" :
                    name = "User data usage policy for Now Assist";
                    break;
            }
            trackUsage("Clicked Helpful Resources", {name : name});
            break;    
        default: 
            break;
    }
    
}
