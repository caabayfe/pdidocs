(function() {
	// Get the portal record so it can used in multiple places
	var portalRecord = $sp.getPortalRecord();
	
	/*
	 * If the system property of ux_portal_theme_to_uib_theme_mapping exists that maps to the theme 
	 * this widget is currently inside it will use that mapping record to set portal theme to a 
	 * corresponding UXF theme
	 */
	function setThemeMapping() {
		// Getting theme mapping via system property of ux_portal_theme_to_uib_theme_mapping
		var themeID = portalRecord.getValue("theme"); // get the sys property themeID
		
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name","CONTAINS","ux_portal_theme_to_uib_theme_mapping."+themeID);
		gr.orderByDesc("sys_created_on");
		gr.query();
		gr.next();

		var mappingValues = gr.getValue("value");

		if(mappingValues) {
			var themeValues = mappingValues.split(",");
			var uxTheme = themeValues[0] && themeValues[0].trim();
			var styleTheme = themeValues[1] && themeValues[1].trim();
			data.theme = uxTheme || null;
			data.themeVariant = styleTheme || null;
		}
	}

	setThemeMapping();
	
	// Required Params
	data.table = options.table_name || $sp.getParameter("table") || "interaction";
	data.layoutType = $sp.getParameter("layoutType") || "monolith";
	data.sysId = options.table_sys_id || $sp.getParameter("sys_id") || "-1";

	// URL Suffix
	data.urlSuffix = portalRecord.getDisplayValue("url_suffix") || null;
	
	// Optional Params
	data.playbookExperienceId = $sp.getParameter("playbookExperienceId") || options.playbook_experience_id;
	data.compactMode = $sp.getParameter("compactMode") || false;
	data.activityView = $sp.getParameter("activityView") || options.activity_view || "focused";
	data.query = $sp.getParameter("query") || null;
	data.fullWidthCards = $sp.getParameter("fullWidthCards") || false;
	data.hideStagePicker = $sp.getParameter("hideStagePicker") || false;
	data.numberOfStages = $sp.getParameter("numberOfStages") || null;
	data.height = options.height ? options.height + "px" : "856px";
	data.pageTitle = $sp.getParameter("title") || null;
	data.extraParams = options.extra_params || null;
	data.fullPageRefreshAfterRecordGenerator = options.full_page_refresh_after_record_generator;
	
	// Playbook UIB Page URL
	data.playbookUIBPageUrl = options.playbook_uib_page_url || "/now/playbook-portal/playbook";
	
	// Open Record
	data.openRecordWidget = options.open_record_modal_widget || "fd1f4ec347730200ba13a5554ee490c0";
	data.openRecordModalSize = options.open_record_modal_size || "lg";
	data.openRecordModalTitle = options.open_record_modal_title || "";
	data.openRecordModalMessage = options.open_record_modal_message || "";
	data.openRecordModalButtons = options.open_record_modal_buttons || null;
	data.openRecordModalView = options.open_record_modal_view || null;
	data.openRecordIsPopUp = options.open_record_is_pop_up || true;
	data.openRecordModalPreventUrlUpdateOnSubmit = (options.open_record_modal_prevent_url_update_on_submit === true || 
		options.open_record_modal_prevent_url_update_on_submit === "true") ? true : false;
	
	// Open List
	data.openListWidget = options.open_list_modal_widget || "8ae61f55cb21020000f8d856634c9c93";
	data.openListModalSize = options.open_list_modal_size || "lg";
	data.openListModalTitle = options.open_list_modal_title || "";
	data.openListModalMessage = options.open_list_modal_message || "";
	data.openListModalButtons = options.open_list_modal_buttons || null;
	
	// Dynamic height
	data.isHeightDynamic = $sp.getParameter("isHeightDynamic") || options.is_height_dynamic || false;
	data.dynamicHeightPadding = options.dynamic_height_padding || 5;

})();
