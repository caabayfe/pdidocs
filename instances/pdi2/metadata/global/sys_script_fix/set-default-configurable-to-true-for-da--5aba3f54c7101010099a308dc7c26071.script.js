var dictionary = new GlideRecord("sys_dictionary");
if (dictionary.isValid())
	dictionary.addQuery("name", "sys_declarative_action_payload_field");
    dictionary.addQuery("element", "configurable");
    dictionary.query();
    if (dictionary.next()) {
        dictionary.setValue("default_value", true);
        dictionary.update();
    }
