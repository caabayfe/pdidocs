function onCondition() {
	var selectedTrigger = g_form.getValue("async_load_trigger");
	if(!selectedTrigger){
		g_form.setValue("async_load_trigger","viewport");
	}
    var selectedDeviceTypes = g_form.getValue("async_load_device_type");
    if (!selectedDeviceTypes) {
        g_form.setValue("async_load_device_type", "desktop,mobile,tablet");
    }
    var defaultPlaceholderDimensions = g_form.getValue("placeholder_dimensions");
	var defaultPlaceholderHeight = "250px";
    if (!defaultPlaceholderDimensions) {
        g_form.setValue(
            "placeholder_dimensions",
            JSON.stringify({
                mobile: {
                    height: defaultPlaceholderHeight,
                    width: "100%"
                },
                desktop: {
                    height: defaultPlaceholderHeight,
                    width: "100%"
                },
                tablet: {
                    height: defaultPlaceholderHeight,
                    width: "100%"
                },
            }, null, 2)
        );
    }
    var defaultPlaceholderTemplate = g_form.getValue("placeholder_template");
    if (!defaultPlaceholderTemplate) {
        g_form.setValue(
            "placeholder_template",
            "<!--\n" +
            "  AngularJS template with configurable options.\n" +
            "  Use the `options` object to control dynamic behavior.\n" +
            "\n" +
            "  Example: Display an element only when max row count is 10:\n" +
            "  <div ng-if=\"options.maxRowCount === 10\"></div>\n" +
            "\n" +
            "  The `skeleton-container` class is used for loading placeholders.\n" +
            "-->\n" +
			"<div class=\"skeleton-container\">\n" +
			"  <!-- Header Skeleton -->\n" +
			"  <div class=\"skeleton-box skeleton-header\"></div>\n" +
			"\n" +
			"  <!-- Body Skeleton -->\n" +
			"  <div class=\"skeleton-box skeleton-line\"></div>\n" +
			"  <div class=\"skeleton-box skeleton-line small\"></div>\n" +
			"  <div class=\"skeleton-box skeleton-line medium\"></div>\n" +
			"\n" +
			"</div>"
        );
    }
	var defaultPlaceholderDimenstionsScript = g_form.getValue("placeholder_dimensions_script");
	if (!defaultPlaceholderDimenstionsScript) {
    g_form.setValue("placeholder_dimensions_script", 'function evaluateConfig(options) { \n' +
        '    return {\n' +
        '        "mobile": {\n' +
        '            "height": "'+ defaultPlaceholderHeight +'",\n' +
        '            "width": "100%"\n' +
        '        },\n' +
        '        "desktop": {\n' +
        '            "height": "'+ defaultPlaceholderHeight +'",\n' +
        '            "width": "100%"\n' +
        '        },\n' +
        '        "tablet": {\n' +
        '            "height": "'+ defaultPlaceholderHeight +'",\n' +
        '            "width": "100%"\n' +
        '        }\n' +
        '    };\n' +
        '}');
	}

}
