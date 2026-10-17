(function(context) {
    var payload = [{
            id: "com.sn_hr_awa",
            displayName: gs.getMessage("HR Service Delivery"),
            name: "Advanced Work Assignment for HRSD",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.sn_hr_awa"
        },
        {
            id: "com.sn_customerservice",
            displayName: gs.getMessage("Customer Service Management"),
            name: "Customer Service",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.sn_customerservice"
        },
        {
            id: "com.snc.incident.awa",
            displayName: gs.getMessage("IT Service Management"),
            name: "Advanced Work Assignment for Incidents",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.snc.incident.awa"
        },
        {
            id: "com.glide.interaction.awa",
            displayName: gs.getMessage("Agent Chat"),
            name: "Agent Chat",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.glide.interaction.awa"
        },
        {
            id: "com.snc.walkup",
            displayName: gs.getMessage("Walk-up Experience"),
            name: "Walk-up Experience",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.snc.walkup"
        },
        {
            id: "sn_awa_sms_int",
            displayName: gs.getMessage("Conversational SMS"),
            name: "Conversational SMS",
            isInstalled: "",
            appLink: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/8540f75153401010dfd2ddeeff7b1237"
        },
        {
            id: "com.glide.messaging.awa",
            displayName: gs.getMessage("Conversational Messaging"),
            name: "Conversational Messaging",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.glide.messaging.awa"
        },
        {
            id: "com.glide.awa.agent_affinity",
            displayName: gs.getMessage("Agent Affinity"),
            name: "Advanced Work Assignment - Agent Affinity",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.glide.awa.agent_affinity"
        },
        {
            id: "sn_csm_wfo_workspa",
            displayName: gs.getMessage("Workforce Optimization for CSM"),
            name: "Workforce Optimization for CSM",
            isInstalled: "",
            appLink: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/23c03d2c874a2010926420eac5cb0bc6"
        },
        {
            id: "sn_wfo_cfg_itsm",
            displayName: gs.getMessage("Workforce Optimization for ITSM"),
            name: "Workforce Optimization for ITSM",
            isInstalled: "",
            appLink: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/6b3b849f73203010dd6131ff2ef6a7e6"
        },
        {
            id: "sn_va_fb_messenger",
            displayName: gs.getMessage("Facebook Messenger"),
            name: "Facebook Messenger",
            isInstalled: "",
            appLink: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/85f01c541ba25010bfbd10a61a4bcb99"
        },
        {
            id: "sn_va_whatsapp_twi",
            displayName: gs.getMessage("Whatsapp"),
            name: "Whatsapp",
            isInstalled: "",
            appLink: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/d98482560f721010a0ba483f68767e89"
        },
        {
            id: "sn_va_line",
            displayName: gs.getMessage("Line"),
            name: "Line",
            isInstalled: "",
            appLink: "https://store.servicenow.com/sn_appstore_store.do#!/store/application/9d4fd88edb3e941062a19d62ba9619bb"
        },
        {
            id: "com.snc.pa.awa",
            displayName: gs.getMessage("Performance Analytics Content Pack"),
            name: "Performance Analytics - Content Pack - Advanced Work Assignment",
            isInstalled: "",
            appLink: "/nav_to.do?uri=$allappsmgmt.do?sysparm_search==com.snc.pa.awa"
        }
    ];
    var allPlugins = new sn_oe_sfs.CIUtil().getAWAHomePlugins(payload);

    //update installed plugins and available plugins items to the child context based on the key
    context.children = context.children.filter(function(child) {
        //Hide Installed Plugins header if there is no installed plugin
        if (child.props_details.key === "installed_plugins") {
            child.props_details.items = allPlugins.installedPlugins;
            return child.props_details.items.length > 0;
        }
        //Hide Available Plugins header if there is no available plugin
        if (child.props_details.key === "available_plugins") {
            child.props_details.items = allPlugins.availablePlugins;
            return child.props_details.items.length > 0;
        }
        return true;
    });
})(context);
