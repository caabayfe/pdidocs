(function executeRule(current, previous /*null when async*/) {
    var mappingType = (current.getValue('type') || '').toLowerCase();
    var usage = current.getValue('usage') || '';

    if (mappingType == 'authentication') {
        // Authentication mappings must not have a usage — auto-clear it
        if (usage) {
            current.setValue('usage', '');
        }
    } else if (mappingType == 'identification') {
        // Identification mappings allow primary, fallback, or empty usage
        if (usage && usage != 'primary' && usage != 'fallback') {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage('Cannot save the record. Identification usage must be Primary, Fallback, or empty.'));
            return;
        }

        // On update: prevent removing the last primary for a service profile
        if (current.operation() == 'update' && previous && previous.getValue('usage') == 'primary' && usage != 'primary') {
            var checkGr = new GlideRecord(current.getTableName());
            checkGr.addQuery('service_profile', current.getValue('service_profile'));
            checkGr.addQuery('type', 'identification');
            checkGr.addQuery('usage', 'primary');
            checkGr.addQuery('sys_id', '!=', current.getUniqueValue());
            checkGr.addActiveQuery();
            checkGr.setLimit(1);
            checkGr.query();
            if (!checkGr.hasNext()) {
                current.setAbortAction(true);
                gs.addErrorMessage(gs.getMessage('Cannot save the record. At least one primary identification mapping must exist for this service profile.'));
            }
        }
    }
})(current, previous);
