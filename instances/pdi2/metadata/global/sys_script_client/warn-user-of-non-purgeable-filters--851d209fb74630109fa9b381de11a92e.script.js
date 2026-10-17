function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var ga = new GlideAjax('AISIndexSourceUtils');
    ga.addParam("sysparm_name", "decodeConditions");
    ga.addParam("condition", newValue);
    ga.addParam("table", g_form.getValue('source'));
    ga.getXML(validateConditions);

    function validateConditions(response) {
        var conditions = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
        var warnableFields = [];
        for (var i = 0; i < conditions.size(); i++) {
            var condition = conditions[i];
			var field = condition['field'];
            if (g_scratchpad.no_text_index_fields.includes(field)) {
				if (!warnableFields.includes(field))
					warnableFields.push(field);
            } else if (field == '123TEXTQUERY321') {
                g_form.showFieldMsg("filter", "keyword is a not a supported filter", "error");
            }
        }
        if (warnableFields.size() >= 1) {
            var fields = warnableFields.join(", ");
            var is = (warnableFields.size() > 1) ? "are non indexed fields" : "is a non indexed field";
            g_form.showFieldMsg("filter", (fields + " " + is + ". Currently ingested documents that do not match this new condition will not be autopurged. Please reindex the source to remove these documents."), "warn");
        }
    }
}
