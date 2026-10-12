function onLoad() {
    //If we are not a choice list we do not need choices
    var datatype = g_form.getValue("datatype");
	var method = g_form.getValue("method");
    if (datatype == "choice" || datatype == "scale" || datatype == "numericscale" || datatype == "imagescale" || datatype == "multiplecheckbox" || datatype == "ranking") {
        g_form.showRelatedList("asmt_metric_definition");
    } else {
        g_form.hideRelatedList("asmt_metric_definition");
    }
}
