var dictionaryRecord = new GlideRecord("sys_dictionary");
dictionaryRecord.addQuery("name", "sys_highlighted_value");
dictionaryRecord.addQuery("element", "field");
dictionaryRecord.query();
if (dictionaryRecord.next()){
	dictionaryRecord.setValue("display", true);
	dictionaryRecord.update();
}
