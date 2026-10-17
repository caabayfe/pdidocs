if (!pm.isZboot()) {

    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "ml_stopwords");
    gr.addQuery("element", "name");
    gr.query();
    if (gr.next()) {
        gr.setValue("internal_type", "translated_field");
        gr.update();
        gs.info("Changed ml_stopwords name field type to translated_field");
    }

}
