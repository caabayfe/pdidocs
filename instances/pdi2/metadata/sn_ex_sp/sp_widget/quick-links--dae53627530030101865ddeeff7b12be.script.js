(function() {
    data.load_config = options.load_config;
    // Fallback to false if async_load is undefined
    var async_load = options.async_load || false; // SP portal skeleton loading configuration

    if(async_load) data.load_config = "";

    if (data.load_config === "async" && !input)
        return;
    data.quickLinkHeader = gs.getMessage(options.title);
    data.instanceId = $sp.getDisplayValue("sys_id");
    var quickLinkId = $sp.getParameter("quick_link_id");
    var pageId = $sp.getParameter("id");
    var stats = {};
    stats.callerId = data.instanceId;
    stats.textPrefix = 'Quick Links';
    stats.startTime = new GlideDateTime();
    stats.shortDesc = 'Load Data';
    stats.guid = gs.generateGUID();

    data.portal = $sp.getPortalRecord();
    data.headingLevel = options.title_heading_level || 'h3';
    var quickLinkUtil = new sn_ex_sp.QuickLinkUtil();

    setOptions(options);
    if (quickLinkId && pageId == "quick_link_preview") {
        data.json_data = quickLinkUtil.fetchQuicklinksForHomePage(quickLinkId, data.instanceId, undefined, stats.guid);
    } else if (options.quick_links) {
        data.json_data = quickLinkUtil.fetchQuicklinksForHomePage(options.quick_links, data.instanceId, undefined, stats.guid);
    }

    new sn_ex_sp.PerformanceIndicatorUtil().postInstanceHotspot(stats);

    function setOptions(customOptions) {
        var cardSizes = {
            "Small": "card-small",
            "Medium": "card-medium"
        };

        data.card_type = customOptions.card_type;
        data.card_size = cardSizes[customOptions.card_size];
        data.text_alignment = customOptions.text_alignment === "Center" ? customOptions.text_alignment : "Default";

        data.show_background = customOptions.show_background;
        data.show_icon = customOptions.show_icon;
        data.show_description = customOptions.show_description;

        data.background_color = customOptions.background_color;
        data.background_hexcode = customOptions.background_hexcode;

        data.icon_background_color = customOptions.icon_background_color;
        data.icon_background_hexcode = customOptions.icon_background_hexcode;

        data.show_text_overlay = customOptions.show_text_overlay;
        data.text_overlay_hexcode = customOptions.text_overlay_hexcode;

        data.text_color = customOptions.text_color;
        data.text_color_hexcode = customOptions.text_color_hexcode;
        data.showEmptyState = options.show_empty_state;
    }

    if (input && input.action == 'openGuidedhelp' && input.guidedHelpId) {
        data.pageId = $sp.getParameter('id') ? $sp.getParameter('id') : data.portal.homepage.getDisplayValue();
        data.guidedHelpResponse = new sn_ex_sp.QuickLinkUtil().handleGuidedHelpClick(input.guidedHelpId, data.pageId, "quick_link");
    }

})();
