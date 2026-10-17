(function executeRule(current, previous /*null when async*/) {
    // Auto-generate service_name from service_label with esc_ prefix
    // This prevents collision with data channel names

    if (current.service_label.nil()) {
        gs.addErrorMessage(gs.getMessage('Service Label is required'));
        current.setAbortAction(true);
        return;
    }

    // Generate service_name: esc_ + lowercase service_label with spaces replaced by underscores
    var serviceLabel = current.service_label.toString();
    var serviceName = 'esc_' + serviceLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Set service_name if it's nil or if service_label changed
    if (current.service_name.nil() || current.service_label.changes()) {
        current.service_name = serviceName;
    }

    // Always check for duplicate service_name on insert or when service_label changes
    // This handles "Insert and Stay" scenarios where the record is resubmitted
    if (current.isNewRecord() || current.service_label.changes()) {
        var gr = new GlideRecord('dp_byo_anonymization_service_configuration');
        gr.addQuery('service_name', serviceName);
        gr.addQuery('sys_id', '!=', current.sys_id);
        gr.query();

        if (gr.next()) {
            gs.addErrorMessage(gs.getMessage('A configuration with service name "{0}" already exists. Please use a different service label.', serviceName));
            current.setAbortAction(true);
        }
    }

})(current, previous);
