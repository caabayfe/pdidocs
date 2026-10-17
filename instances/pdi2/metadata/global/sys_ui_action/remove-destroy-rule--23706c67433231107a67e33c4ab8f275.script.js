function onPromptComplete(promptResponse) {
    if (promptResponse.toLowerCase() == "yes") {
        deleteDestroyRule();
    }
}

function deleteDestroyRule() {
    var archiveRuleGr = new GlideRecord('sys_archive');
    if (archiveRuleGr.get(g_form.getUniqueValue())) {
        var destroyRuleGr = new GlideRecord('sys_archive_destroy');
        if (destroyRuleGr.get(archiveRuleGr.getValue('destroy_rule'))) {
            archiveRuleGr.destroy_rule = null;
            archiveRuleGr.update();
            destroyRuleGr.deleteRecord();
            g_navigation.reloadWindow();
        }
    }
}
