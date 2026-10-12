var dictionary = new GlideRecord("sys_dictionary");
if (dictionary.isValid()) {
    dictionary.addQuery("name", "sys_declarative_action_assignment");
    dictionary.addQuery("element", "specificity");
    dictionary.query();
    if (dictionary.next()) {
        dictionary.setValue("virtual", false);
		dictionary.setValue("calculation", "");
        dictionary.update();
    }
}
