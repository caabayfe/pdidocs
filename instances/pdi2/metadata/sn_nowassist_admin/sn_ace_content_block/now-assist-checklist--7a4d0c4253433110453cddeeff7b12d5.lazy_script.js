(function(context, pageParams, blockcontext) {

    var checklist = [{
            image: '/images/step_indicator_one.svg',
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", 'Install Now Assist plugins'),
            description: sn_i18n.Message.getMessage("sn_nowassist_admin", "<p style='margin: 0.25rem 0;'>Visit the store to install the plugin specific to the product workflows. Browse <a href='/now/now-assist-admin/plugins/params/workflow/all'>all available plugins</a>.</p>")
        },
        {
            image: '/images/step_indicator_two.svg',
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", 'Turn on Now Assist panel'),
            description: sn_i18n.Message.getMessage("sn_nowassist_admin", "<p style='margin: 0.25rem 0;'>After a plugin is installed, return to this console to turn on the <a href='/now/now-assist-admin/now-assist-panel'>Now Assist panel</a> which will allow the skills associated with those plugins to work.</p>")

        },
        {
            image: '/images/step_indicator_three.svg',
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", 'Activate Now Assist skills'),
            description: sn_i18n.Message.getMessage("sn_nowassist_admin", "<p style='margin: 0.25rem 0;'>Once the panel is turned on, configure and customize information sources that define how the skills work.</p>")
        },
        {
            image: '/images/step_indicator_four.svg',
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", 'Review account settings'),
            description: sn_i18n.Message.getMessage("sn_nowassist_admin", "<p style='margin: 0.25rem 0;'><a href='/now/now-assist-admin/account'>Review account information</a> and manage data sharing.</p>")
        },
        {
            image: '/images/step_indicator_five.svg',
            title: sn_i18n.Message.getMessage("sn_nowassist_admin", 'Analyze Now Assist skills'),
            description: sn_i18n.Message.getMessage("sn_nowassist_admin", "<p style='margin: 0.25rem 0;'>Track and monitor the progress of your Now Assist skills.</p>")
        }
    ];
    return {
        checklistItems: checklist
    };
})(context, pageParams, blockcontext);
