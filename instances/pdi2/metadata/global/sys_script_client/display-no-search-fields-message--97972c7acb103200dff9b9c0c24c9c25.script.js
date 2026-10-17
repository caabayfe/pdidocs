function onLoad() {
	var fieldField = g_form.getControl("field");
	if (fieldField){
		var options = fieldField.select("option");
		if ((typeof options === "undefined") || options.length === 0 || (options.length === 1 && options[0].value === ""))
			g_form.addInfoMessage(getMessage("All available <strong>Search Fields</strong> for this table have already been created"));
	}
}
