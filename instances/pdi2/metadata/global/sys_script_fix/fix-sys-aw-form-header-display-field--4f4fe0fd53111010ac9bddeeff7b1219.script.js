var dictionaryRecord = new GlideRecord("sys_dictionary");
dictionaryRecord.addQuery("name", "sys_aw_form_header");
dictionaryRecord.addQuery("element", "table");
dictionaryRecord.query();
if (dictionaryRecord.next()){
	dictionaryRecord.setValue("display", true);
	dictionaryRecord.update();
}
