function updateFieldType() {
    var dictionaryGr = new GlideRecord('sys_dictionary');
    dictionaryGr.addQuery('name', 'contact_responsibility');
    dictionaryGr.addQuery('element', 'name');
    dictionaryGr.query();
    if (dictionaryGr.next()) {
        dictionaryGr['internal_type'] = 'translated_text';
        dictionaryGr.update();
    }
}

updateFieldType();
