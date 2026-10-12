(function executeRule(current, previous /*null when async*/ ) {
    // Only proceed if default field is being changed to true
    if (!(current['default'].changes() && current['default'] == true)) {
        return;
    }

    // Prevent setting default=true on an inactive configuration
    if (current['active'] == false) {
        gs.addErrorMessage(gs.getMessage('This configuration is inactive and cannot be set as the default. Please activate it first.'));
        current.setAbortAction(true);
        return;
    }

    // Check if another default configuration already exists
    var gr = new GlideRecord('dp_byo_anonymization_service_configuration');
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.addQuery('default', true);
    gr.setLimit(1);
    gr.query();

    if (gr.next()) {
        // Another default exists - prevent this change
        var existingDefaultLabel = gr.getValue('service_label');
        gs.addErrorMessage(gs.getMessage('Cannot set this configuration as default. Another configuration "{0}" is already set as default. Please unset that one first.', existingDefaultLabel));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
