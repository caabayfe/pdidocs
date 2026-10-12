(function executeRule(current, previous /*null when async*/ ) {
    var MAX_SIZE_PROPERTY = "glide.cache.scoped.private_cache_max_entries";
    var maxSize = parseInt(gs.getProperty(MAX_SIZE_PROPERTY, 1000));
    var maxEntries = parseInt(current.getValue('max_entries'));

    if (isNaN(maxEntries)) {
        current.setValue('max_entries', 0);
        gs.addInfoMessage(gs.getMessage("Max Entries should be an integer greater than or equal to 0."));
        return;
    }

    if (maxEntries > maxSize) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Max Entries cannot exceed {0}.", maxSize));
        return;
    }

    if (maxEntries < 0) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Max Entries should be greater than or equal to 0."));
        return;
    }


})(current, previous);
