/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var home_info = api.data.get_home_info.output;
    var carousel_cards = {};

    // Set up / Install IAR for HR
    var iar_hr_title = await helpers.translate(home_info.sn_iar_hr
        ? "Set up IAR for HR"
        : "Install IAR for HR");
    carousel_cards.iar_for_hr = {
        "title": iar_hr_title,
        "image": home_info.sn_iar_hr
            ? "/images/setup-apps.svg"
            : "/images/install-app.svg",
        "description": await helpers.translate(home_info.sn_iar_hr
            ? "Jump start your HR IAR journey by reviewing and activating one or more of your IAR configurations."
            : "Install the IAR for HR application to auto-resolve high-volume, non-critical HR cases and escalate sensitive or critical cases for agent assistance."),
        "button": iar_hr_title
    };

    // Set up / Install IAR for ITSM
    var iar_itsm_title = await helpers.translate(home_info.sn_itsm_va
        ? "Set up IAR for ITSM"
        : "Install IAR for ITSM");
    carousel_cards.iar_for_itsm = {
        "title": iar_itsm_title,
        "image": home_info.sn_itsm_va
            ? "/images/setup-apps.svg"
            : "/images/install-app.svg",
        "description": await helpers.translate(home_info.sn_itsm_va
            ? "Jump start your ITSM IAR journey by reviewing and activating your IAR Incident configuration."
            : "Install pre-built ITSM conversations to help your organizations quickly deploy automated self-service experiences."),
        "button": iar_itsm_title
    };

    // Enable / Manage Virtual Agent (VA) on your portal
    carousel_cards.enable_va = {
        "title": await helpers.translate(home_info.va_enabled
            ? "Manage Virtual Agent (VA) on your portal"
            : "Enable Virtual Agent (VA) on your portal"),
        "button": await helpers.translate(home_info.va_enabled
            ? "Manage Virtual Agent"
            : "Enable Virtual Agent")
    };


    // Enable / Manage Virtual Agent (VA) notifications
    carousel_cards.va_notifications = {
        "title": await helpers.translate(home_info.notifications_enabled
            ? "Manage Virtual Agent (VA) notifications"
            : "Enable Virtual Agent (VA) notifications"),
        "button": await helpers.translate(home_info.notifications_enabled
            ? "Manage VA notifications"
            : "Turn on VA notifications")
    };

    // Turn on / Manage AI Search
    carousel_cards.ais = {
        "title": await helpers.translate(home_info.ais_enabled
            ? "Manage AI Search"
            : "Turn on AI Search"),
        "button": await helpers.translate(home_info.ais_enabled
            ? "Manage AI Search"
            : "Request AI Search")
    };
    
    api.setState("carousel_cards", carousel_cards);
}
