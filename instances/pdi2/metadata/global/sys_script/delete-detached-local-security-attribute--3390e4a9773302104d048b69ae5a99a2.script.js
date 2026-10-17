(function executeRule(current, previous /*null when async*/ ) {
    // check if previous SA was a local SA, and not empty. If it was, delete the SA

    if (!(previous['security_attribute']).nil()) {
        var oldSAId = previous['security_attribute'].sys_id;
        var oldSAGr = new GlideRecord("sys_security_attribute");

        oldSAGr.get(oldSAId);

        // only delete the old security attribute if it was localized
        // existing security attributes could still be used on other ACLs
        if (oldSAGr.getValue("is_localized") === "0")
            return;

        // deactivate the attribute so the protective "prevent deleting active sec attribute" BR does not abort the delete
        oldSAGr.setValue('active', false);
        oldSAGr.deleteRecord();
    }
})(current, previous);
