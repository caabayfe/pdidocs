var dictionaryRecord = new GlideRecord("sys_dictionary");
dictionaryRecord.addQuery("name", "sys_declarative_action_assignment");
dictionaryRecord.addQuery("element", "action_attributes");
dictionaryRecord.query();
if (dictionaryRecord.next()){
	dictionaryRecord.setValue("max_length", 4000);
	dictionaryRecord.update();
}
