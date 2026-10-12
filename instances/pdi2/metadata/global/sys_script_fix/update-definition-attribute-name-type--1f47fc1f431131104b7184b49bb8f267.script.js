var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_one_extend_definition_attribute");
gr.addQuery("element", "name");
gr.addQuery('internal_type', 'translated_text');
gr.query();
if (gr.next()) {
    gr.setValue('internal_type', 'string');
    gr.update();

    var attribute = new GlideRecord("sys_schema_attribute_m2m");
    attribute.addQuery("schema", gr.getUniqueValue());
    attribute.addQuery("attribute", "095b70b3eb321100d4360c505206fee5"); //serializer attribute
    attribute.addQuery("value", "com.glide.script.TranslatedTextXMLSerializer");
    attribute.query();
    if (attribute.next()) {
        attribute.deleteRecord();
    }
}
