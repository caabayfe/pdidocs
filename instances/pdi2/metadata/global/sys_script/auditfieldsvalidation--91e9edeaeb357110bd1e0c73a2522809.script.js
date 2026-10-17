(function executeRule(current, previous /*null when async*/ ) {

    var isUnsupportedFieldPresent;
    var unSupportedFields;
    if (current.table_name == 'sys_user') {
        unSupportedFields = ['sys_created_on', 'sys_created_by', 'sys_updated_by', 'sys_updated_on', 'last_login', 'last_login_time', 'last_login_device', 'enable_multifactor_authn', 'default_perspective', 'calendar_integration', 'federated_id', 'password_needs_reset', 'failed_attempts', 'last_password', 'ldap_server', 'locked_out', 'notification', 'roles', 'sys_domain', 'sys_domain_path', 'time_format', 'hashed_user_id', 'sys_class_name', 'sys_mod_count'];
        isUnsupportedFieldPresent = checkUnsupportedFieldPresentByUnsupportedFieldsList(unSupportedFields);
    } else if (current.table_name == 'sys_user_has_role') {
        var supportedFields = ['user', 'role', 'inherited', 'inh_count'];
        isUnsupportedFieldPresent = checkUnsupportedFieldPresentBySupportedFieldsList(supportedFields);
    } else {
        unSupportedFields = ['sys_created_on', 'sys_created_by', 'sys_updated_by', 'sys_updated_on'];
        isUnsupportedFieldPresent = checkUnsupportedFieldPresentByUnsupportedFieldsList(unSupportedFields);
    }
    if (isUnsupportedFieldPresent) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Invalid update, few of the selected fields aren’t supported for auditing. Click <a href="/api/now/v1/context_doc_url/fields-for-audit" target="_blank"> here</a> to view the list of allowed fields for audit.'));
    }

    function checkUnsupportedFieldPresentByUnsupportedFieldsList(unSupportedFields) {
        var currentFieldList = current.field_list.split(",");
        var arrayUtil = new ArrayUtil();
        var areUnSupportedFieldsPresent = currentFieldList.some(function(field) {
            return arrayUtil.contains(unSupportedFields, field);
        });
        return areUnSupportedFieldsPresent;
    }

    function checkUnsupportedFieldPresentBySupportedFieldsList(supportedFields) {
        var currentFieldList = current.field_list.split(",");
        var arrayUtil = new ArrayUtil();
        var areAllCurrentFieldsPresentInSupportedFields = currentFieldList.every(function(field) {
            return arrayUtil.contains(supportedFields, field);
        });
        return !areAllCurrentFieldsPresentInSupportedFields;
    }
})(current, previous);
