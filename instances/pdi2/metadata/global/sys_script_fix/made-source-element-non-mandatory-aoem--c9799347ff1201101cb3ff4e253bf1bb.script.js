var glideRecord = new GlideRecord("sys_dictionary");
if (glideRecord.isValid()) {
    glideRecord.setWorkflow(false);
    glideRecord.setUseEngines(false);
    glideRecord.addQuery("name", "sys_ux_addon_event_mapping");
    glideRecord.addQuery("element", "source_element_id");
    glideRecord.query();
    if (glideRecord.next()) {
        glideRecord.setValue("mandatory", "false");
        glideRecord.update();
    }
}
