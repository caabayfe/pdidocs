function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    
    //If we are not a choice list we do not need choices
    var datatype = g_form.getValue("datatype");
	var method = g_form.getValue("method");
    if (datatype == "choice" || datatype == "scale" || datatype == "numericscale" || datatype == "imagescale" || datatype == "multiplecheckbox" || datatype == "ranking") {
        g_form.showRelatedList("asmt_metric_definition");
		if (method == "script")
			g_form.setValue("method","condscript");
    } else {
        g_form.hideRelatedList("asmt_metric_definition");
		if (datatype == "duration")
			g_form.setValue("method","script");
		else if (datatype != "long" && datatype != "percentage")
			if (method == "script")
				g_form.setValue("method","condscript");
    }
}
