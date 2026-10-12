if (!GlidePluginManager.isZboot()) {
    gs.info('Fix Script: Deleting SCTASK and RITM dictionary override on priority field for upgrade customers');
    var gr = new GlideRecord('sys_dictionary_override');
    gr.addQuery('sys_id', 'IN', '9ec20af6ff34ba1097aaffffffffff75,c3f2023aff34ba1097aaffffffffff88');
    gr.deleteMultiple();
}
