(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.exportDisplayDefaults = {
		csv : {
			display_value : gs.getProperty("glide.export.csv.raw.value", false) == "false",
			display_label : gs.getProperty("glide.export.csv.column_header_label", false)
		},
		excel : {
			display_value : gs.getProperty("glide.export.excel.display_value", true),
			display_label : gs.getProperty("glide.export.excel.column_header_label", true)
		},
		xlsx : {
			display_value : gs.getProperty("glide.export.xlsx.display_value", true),
			display_label : gs.getProperty("glide.export.xlsx.column_header_label", true)
		},
		json : {
			display_value : gs.getProperty("glide.json.return_displayValue", false),
			display_label : false
		},
		xml : {
			display_value : false,
			display_label : false
		}
	};
})(current, previous);
