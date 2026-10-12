(function executeRule(current, previous /*, ggs, gs */ ) {

    function enforceVersionPolicy() {
        if (current.http_client_version == 'V1' &&
            current.http_protocol_policy != 'FORCE_HTTP_1_1') {
            current.http_protocol_policy = 'FORCE_HTTP_1_1';
        }
    }

    function validateHostNameFormat() {
        if (!current.host_name || current.host_name.toString().trim() === '') {
            gs.addErrorMessage(gs.getMessage('Host name is required.'));
            current.setAbortAction(true);
            return false;
        }

        var hostPattern = /^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$/;
        if (!hostPattern.test(current.host_name)) {
            gs.addErrorMessage(gs.getMessage('Invalid host name format.'));
            current.setAbortAction(true);
            return false;
        }
        return true;
    }

    function validateUniqueHostClientType() {
        if (!current.host_name || !current.client_type)
            return true;

        var gr = new GlideRecord('sys_http_client_config');
        gr.addQuery('host_name', current.host_name);
        gr.addQuery('client_type', current.client_type);
        if (!current.isNewRecord())
            gr.addQuery('sys_id', '!=', current.sys_id);
        gr.setLimit(1);
        gr.query();

        if (gr.hasNext()) {
            gs.addErrorMessage(gs.getMessage('A configuration for host with client type already exists.'));
            current.setAbortAction(true);
            return false;
        }
        return true;
    }

    // Execute validations
    enforceVersionPolicy();

    if (!validateHostNameFormat()) return;
    if (!validateUniqueHostClientType()) return;

})(current, previous);
