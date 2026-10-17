if (!pm.isZboot()) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_search_event");
    gr.addQuery("element=ais_profile");
    gr.query();
    if (gr.next()) {
        gr.setValue("internal_type", "reference");
        gr.setValue("reference", "ais_search_profile");
        gr.update();
    }
}
