function createDestroyRule() {

    var archiveRuleGr = new GlideRecord('sys_archive');
    if (archiveRuleGr.get(g_form.getUniqueValue())) {
        var destroyRuleGr = new GlideRecord('sys_archive_destroy');
        //Create new destroy rule when existing destroy rule does not exist
        if (!destroyRuleGr.get('archive', g_form.getUniqueValue())) {
            destroyRuleGr.setValue('archive', g_form.getUniqueValue());
            destroyRuleGr.setValue('table', 'ar_' + g_form.getValue('table'));
            destroyRuleGr.setValue('name', 'Destroy rule for ' + g_form.getValue('table'));
            destroyRuleGr.setValue('description', 'Destroy archived records for ' + g_form.getValue('table'));
            destroyRuleGr.setValue('destroy_related', true);
			var oneYear = '1971-01-01 00:00:00';
            destroyRuleGr.setValue('archive_duration', oneYear);
            var destroyRuleId = destroyRuleGr.insert();
            archiveRuleGr.setValue('destroy_rule', destroyRuleId);
            archiveRuleGr.update();
			g_tabs2Sections.setActive(1);
			g_navigation.reloadWindow();
        }
    }
}
