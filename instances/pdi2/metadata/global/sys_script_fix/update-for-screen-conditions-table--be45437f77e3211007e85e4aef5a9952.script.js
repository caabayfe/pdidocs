var dictionaryGR = new GlideRecord("sys_dictionary");
if (dictionaryGR.isValid()) {
    dictionaryGR.addQuery("name", "sys_ux_screen_condition");
    dictionaryGR.addQuery("element", "is_result_memoizable");
    dictionaryGR.query();
    if (dictionaryGR.next()) {
        dictionaryGR.setValue("column_label", "Cache Result");
	dictionaryGR.setValue("default_value", true);
        dictionaryGR.update();
    }
}
var documentationGR = new GlideRecord("sys_documentation");
if (documentationGR.isValid()) {
    documentationGR.addQuery("name", "sys_ux_screen_condition");
    documentationGR.addQuery("element", "is_result_memoizable");
    documentationGR.query();
    if (documentationGR.next()) {
        documentationGR.setValue("hint", "Set to false if script needs to re-evaluate on screen loads or changes");
        documentationGR.update();
    }
}
