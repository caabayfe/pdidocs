function transform(input) {
    var dtLanguages = input.dt_languages;
    if (gs.nil(dtLanguages))
        return 'error';

    try {
        if (dtLanguages.length > 0) {
            dtLanguages.forEach((dt_language) => {
                var dtGr = new GlideRecord('sys_cs_dynamic_translation_virtual_agent');
                dtGr.addQuery('language', dt_language.language_id);
                dtGr.query();
                if (dtGr.next()) {
                    var id = dtGr.getUniqueValue();
                    var naaGlobalUtil = new global.NowAssistAdminGlobalScopedUtil();
                    naaGlobalUtil.updateRecord("sys_cs_dynamic_translation_virtual_agent", id, {
                        dt_enabled: dt_language.dt_enabled
                    });
                }
            });
        }
		return 'success';
    } catch (e) {
        gs.error("Failed to enable/disable dynamic translation for a language");
		return 'error';
    }
}
