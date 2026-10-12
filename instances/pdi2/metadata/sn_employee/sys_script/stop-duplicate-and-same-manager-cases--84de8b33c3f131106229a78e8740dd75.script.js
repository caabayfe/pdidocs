(function executeRule(current, previous /*null when async*/ ) {
    if (current.employee + '' === current.secondary_manager + '') {
        gs.addErrorMessage(gs.getMessage("Employee cannot report to themselves, please check the values."));
        current.setAbortAction(true);
    } else {
        var secondManagerGr = new GlideRecord(current.getTableName());
        secondManagerGr.addQuery("employee", current.employee);
        secondManagerGr.addQuery("secondary_manager", current.secondary_manager);
        secondManagerGr.addQuery("relationship_type", current.relationship_type);
        secondManagerGr.query();
        if (secondManagerGr.next()) {
            gs.addErrorMessage(gs.getMessage("Creating duplicate record is not allowed."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
