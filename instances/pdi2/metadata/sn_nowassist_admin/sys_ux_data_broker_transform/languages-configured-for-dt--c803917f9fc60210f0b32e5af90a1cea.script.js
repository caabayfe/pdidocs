function transform(input) {
    var languages = [];
    try {
        var languageGr = new GlideRecord('sys_cs_dynamic_translation_virtual_agent');
        languageGr.addQuery('dt_enabled', true);
        languageGr.query();
        while (languageGr.next()) {
            languages.push({
                'pillText': languageGr.getDisplayValue('language')
            });
        }
    } catch (e) {
        gs.error("Failed to get languages");
    }

    return languages;
}
