/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    function trackUsage(eventName, eventPayload) {
        api.emit('MACROPONENT_TRACK_USAGE_REQUESTED', {
            event: eventName,
            value: eventPayload
        });
    }
    switch(event.name){
        case "NOW_TOGGLE#CHECKED_SET" : 
            if(event.payload?.value){
                trackUsage("Enabled Dynamic translation", {});
            }
            break;
        case "NOW_CONFIRM_DESTROY_MODAL#CONFIRM_CLICKED" : 
            trackUsage("Disabled Dynamic translation", {});
            break;
        case "NOW_BUTTON#CLICKED" :
            trackUsage("Clicked edit button DT", {});
            break;
        case "NOW_TEXT_LINK#CLICKED" : 
            let name = "";
            switch(event.elementId){
                case "sn_language_support_text_link" :
                    name = "ServiceNow Language support";
                    break;
                case "dt_overview_text_link" :
                    name = "Dynamic Translation overview";
                    break;
                case "sn_gen_ai_overview_text_link" :
                    name = "ServiceNow Generative AI overview";
                    break;
                case "sn_sys_admin_forum_text_link" : 
                    name = "ServiceNow SysAdmin forum";
                    break;
            }
            trackUsage("Clicked Helpful Resources", {name : name});
            break;
        case "NOW_ACCORDION_ITEM#EXPANDED_SET":
            let faq = "";
            switch(event.elementId){
                case "what_is_dt_faq":
                    faq = "What is Dynamic Translation?";
                    break;
                case "languages_can_enable_faq":
                    faq = "How many languages can I enable?";
                    break;
                case "external_lsp_faq":
                    faq = "Can I use an external language service provider?";
                    break;
            }
            trackUsage("Opened FAQ", { name : faq});
            break;
    }
}
