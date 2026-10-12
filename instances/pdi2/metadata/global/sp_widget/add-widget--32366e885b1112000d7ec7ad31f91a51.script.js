(function() {
	
data.pageIDRequiredMsg = gs.getMessage("Page ID (Required)");
data.widgetNameRequiredMsg = gs.getMessage("Widget Name (Required)");
data.widgetIDRequiredMsg = gs.getMessage("Widget ID (Required)");

function saveWidget(input) {
	data.invalidWidgetID = false;
	data.invalidPageID = false;

	// if either widget or page ID exists, do nothing and show msg
	var widgetGR = new GlideRecordSecure("sp_widget");
	widgetGR.query("id", input.id);
	if (widgetGR.hasNext())
		data.invalidWidgetID = true;

	if (input.createTestPage) {
		var pageGR = new GlideRecordSecure("sp_page");
		pageGR.query("id", input.test_page_id);
		if (pageGR.hasNext())
			data.invalidPageID = true;
	}

	if (data.invalidPageID || data.invalidWidgetID)
		return;
	
	widgetGR.initialize();
	widgetGR.setValue("id", input.id);
	widgetGR.setValue("name", input.name);
	data.sys_id = widgetGR.insert();
	
	//set the es latest to true for new widgets
	var esLatestScriptGR = new GlideRecordSecure("sys_es_latest_script");
	esLatestScriptGR.initialize();
	esLatestScriptGR.setValue("table", "sp_widget");
	esLatestScriptGR.setValue("id", data.sys_id);
	esLatestScriptGR.setValue("use_es_latest", true);
	esLatestScriptGR.insert();

	if (input.createTestPage) {
		var newPageGR = new GlideRecordSecure("sp_page");
		newPageGR.setValue("id", input.test_page_id);
		newPageGR.setValue("title", input.name + " - Test Page");
		var newPageID = newPageGR.insert();

		var containerGR = new GlideRecordSecure("sp_container");
		containerGR.initialize();
		containerGR.sp_page = newPageID;
		var newContainerID = containerGR.insert();

		var rowGR = new GlideRecordSecure("sp_row");
		rowGR.initialize();
		rowGR.sp_container = newContainerID;
		var newRowID = rowGR.insert();

		var colGR = new GlideRecordSecure("sp_column");
		colGR.initialize();
		colGR.sp_row = newRowID;
		var newColID = colGR.insert();

		var instanceGR = new GlideRecordSecure("sp_instance");
		instanceGR.initialize();
		instanceGR.sp_column = newColID;
		instanceGR.sp_widget = data.sys_id;
		instanceGR.insert();
	}
}

if (input)
	saveWidget(input);	
	
})();
