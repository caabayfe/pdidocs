var glideRecord = new GlideRecord("sys_dictionary");
if (glideRecord.isValid()) {
    glideRecord.addQuery("name", "sys_declarative_action_assignment");
    glideRecord.addQuery("element", "view");
    glideRecord.query();
    if (glideRecord.next()) {
        glideRecord.setValue("reference_qual_condition", "groupISEMPTY^userISEMPTY^EQ");
        glideRecord.update();
    }
}
