function dropProviderColumn () {
	gs.print("Now dropping the column 'provider' from 'sys_cs_nlu_language'.");
	gs.dropColumn('sys_cs_nlu_language', 'provider');
}

dropProviderColumn();

function updateLanguageColumnType() {
    var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "sys_cs_nlu_language");
    gr.addQuery("internal_type", "string");
    gr.addQuery("element", "language");
    gr.query();
    if(gr.next()) {
        gr.setValue("internal_type", "reference");
		gr.setValue("reference", "open_nlu_driver_language");
        gr.setValue("max_length", "32");
        gr.setValue("unique", "false");
        gr.update();
    }
}

updateLanguageColumnType();
