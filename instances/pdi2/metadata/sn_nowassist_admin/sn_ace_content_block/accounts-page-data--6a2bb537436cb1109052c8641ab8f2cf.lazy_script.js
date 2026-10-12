(function(context, pageParams, blockcontext) {
    
    var pluginUtil = new NowAssistAdminPluginUtil();
    var hasAdminRole = !NAARoleUtil.isNAAReadOnlyUser();
    var isGccOnPremInstance = pluginUtil.isRegulatedOrSelfHostedInstance();

    var version = NAAGenAIUtil.getGAICInstalledVersion();
    var licenseInclusions = [];
    licenseInclusions.push({
        "title": gs.getMessage("Now Assist panel"),
        "description": gs.getMessage("Empower users with a personal generative AI assistant that can help generate, draft, and summarize content. Requires a product plugin to install.")
    }, {
        "title": gs.getMessage("Now Assist skills"),
        "description": gs.getMessage("Unlock Now Assist skills you can configure to improve user productivity. Requires product plugins to install.")
    });
    var helpfulResources = [{
            "left_icon": "document-outline",
            "label": gs.getMessage("Now Assist Admin overview"),
            "link": "/api/now/v1/context_doc_url/now-assist-admin-overview",
            "right_icon": "open-link-right-outline",
            "aria_config": {
                "aria-label": gs.getMessage("Now Assist Admin overview")
            }
        },
        {
            "left_icon": "conference-room-outline",
            "label": gs.getMessage("AI & Intelligence community"),
            "link": "https://www.servicenow.com/community/ai-intelligence/ct-p/ai-intelligence",
            "right_icon": "open-link-right-outline",
            "aria_config": {
                "aria-label": gs.getMessage("AI & Intelligence community")
            }
        },
        {
            "left_icon": "document-outline",
            "label": gs.getMessage("ServiceNow Generative AI overview"),
            "link": "https://www.servicenow.com/now-platform/generative-ai.html",
            "right_icon": "open-link-right-outline",
            "aria_config": {
                "aria-label": gs.getMessage("ServiceNow Generative AI overview")
            }
        }
    ];

    var faqs = [{
            "heading": gs.getMessage("What is data sharing?"),
            "description": gs.getMessage("AI algorithms require data to identify patterns and learn. Without data, AI models cannot make predictions or generate useful content. When you use generative AI capabilities across the Now Platform, ServiceNow collects and uses that data to improve our models.")
        }, {
            "heading": gs.getMessage("Why does ServiceNow want to use my data?"),
            "description": gs.getMessage("Sharing your data enables ServiceNow to enhance the user experience, tailor products to your business needs, and improve model accuracy. Your input can help AI models learn from real-world scenarios, allowing for smarter and more contextually aware interactions.")
        },
        {
            "heading": gs.getMessage("What data is ServiceNow using?"),
            "description": gs.getMessage("ServiceNow uses the inputs, outputs, and edits to the outputs of the application. We may also collect data used or generated in connection with the generative AI application, such as the script or record in which the application is called or used.")
        },
        {
            "heading": gs.getMessage("How does ServiceNow protect my data privacy?"),
            "description": gs.getMessage("Personal identifiable information (PII) and sensitive data are anonymized and cleansed from any data collected. ServiceNow will never resell or share your data. For more information, reach out to the Now Support team or your Account Executive.")
        },
        {
            "heading": gs.getMessage("How do I opt back in to data sharing?"),
            "description": gs.getMessage("You must work with the Now Support team or your Account Executive if you wish to opt back in to data sharing.")
        }
    ];


    var accountDescription = gs.getMessage('View your account license information.');
    if (!isGccOnPremInstance && GlidePluginManager.isActive("sn_generative_ai")) {
        accountDescription = gs.getMessage('View your account license information and manage data sharing.');
    }

    return {
        version: version,
        licenseInclusions: licenseInclusions,
        helpfulResources: helpfulResources,
        faqs: faqs,
        okButton: gs.getMessage("OK"),
        accountDescription: accountDescription,
        isGccOnPremInstance: isGccOnPremInstance,
        accountTranslated: gs.getMessage("Account"),
        settingsTranslated: gs.getMessage("Settings")
    };
})(context, pageParams, blockcontext);
