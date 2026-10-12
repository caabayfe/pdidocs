function updateToTranslatedText(table, column) {
    var glideRecord = new GlideRecord("sys_dictionary");
    glideRecord.addQuery('name', table);
    glideRecord.addQuery('element', column);
    glideRecord.addQuery('internal_type', 'translated_field');
    glideRecord.query();

    while (glideRecord.next()) {
        glideRecord.setValue('internal_type', 'translated_text');
        glideRecord.update();
    }
}
updateToTranslatedText('sys_sg_media_section', 'text');
