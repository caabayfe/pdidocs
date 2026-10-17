(function executeRule(current, previous /*null when async*/ ) {
    if (current.active) {
        var existingActive = new GlideRecord('sys_attachment_migration_tracker');
        existingActive.addQuery('active', true);
        existingActive.addQuery('sys_id', '!=', current.sys_id);
        existingActive.query();
        if (existingActive.next()) {
            var errorMessage = gs.getMessage('Another migration is already active. Only one migration can be active at a time.');
            gs.addErrorMessage(errorMessage);
            current.setAbortAction(true);
        }
    }
})(current, previous);
