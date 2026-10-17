modifyFieldType();

function modifyFieldType() {
    if (pm.isZboot())
        return;

    var glideRecord = new GlideRecord("sys_dictionary");
    glideRecord.addEncodedQuery("name=sys_search_source^internal_type=translated_text");
    glideRecord.query();
    if (glideRecord.next()) {
        glideRecord.setValue('internal_type', 'translated_field');
        glideRecord.update();
        gs.log('internal type modified');
    }
}
