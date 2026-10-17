(function executeRule(current, previous /*null when async*/ ) {
    var existingAppGr = new GlideRecord('sn_employee_app');
    var appName = current.name;
    if (!gs.nil(appName)) {
        appName = appName.trim(appName);

        // If We have a record with same name check if sys_id is same
        // if same that means we are updating existing record so should be fine 
        // otherwise it is different record and should not be allowed
        if (existingAppGr.get('name', appName) && current.getUniqueValue() != existingAppGr.getUniqueValue()) {
            gs.addErrorMessage(gs.getMessage('Unable to proceed as the app record with this name already exists. Please make sure the name is unique.'));
            current.setAbortAction(true);
        }
    }

})(current, previous);
