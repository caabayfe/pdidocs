function updateDefaultValue(fieldName, newValue) {
    var dictionaryGr = new GlideRecord('sys_dictionary');
    dictionaryGr.addQuery('name', 'mid_k8s_deployment');
    dictionaryGr.addQuery("element", fieldName);
    dictionaryGr.query();
    if (dictionaryGr.next()) {
        dictionaryGr.setValue("default_value", newValue);
        dictionaryGr.update();
        gs.info("Default value of mid_k8s_deployment." + fieldName + " set to " + newValue);
    } else {
        gs.log("Failed to update dictionary entry for table: mid_k8s_deployment could not find a valid dictionary record for field :" + fieldName);
    }
}
updateDefaultValue("ss_choice", 'true');
updateDefaultValue("security_context_fs_group", '');
