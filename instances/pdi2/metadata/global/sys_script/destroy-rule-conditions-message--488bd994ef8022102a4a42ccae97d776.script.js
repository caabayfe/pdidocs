(function executeRule(current, previous /*null when async*/ ) {
    g_scratchpad.shouldDisplayConditions = gs.getProperty('glide.db.archive_destroy.conditions.enabled') == 'true'
        && !GlideArchiveTable.hasColumnarArchive(current.getValue('table'));
    g_scratchpad.showOffloadMessage = g_scratchpad.shouldDisplayConditions && current.tier2_rule && current.destroy_rule;
})(current, previous);
