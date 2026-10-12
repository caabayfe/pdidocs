(function executeRule(current, previous /*null when async*/ ) {
    var arrayUtil = new ArrayUtil();
    var ppFields = arrayUtil.convertArray(current.getElements());
    var ppFieldsLength = ppFields.length;
    //Fields to be excluded from audit
    var excludedFields = ["password", "password_strength_script", "password_rule_script", "sys_updated_by", "sys_updated_on", "sys_mod_count"];

    for (i = 0; i < ppFieldsLength; i++) {
        var currField = ppFields[i].getName();
        if (excludedFields.indexOf(currField) < 0 && current.getElement(currField).changes())
            gs.info("PasswordPolicyAudit: '{0}' field updated from '{1}' to '{2}' for the Default Password Policy", current.getElement(currField).getLabel(), previous.getElement(currField), current.getElement(currField));
    }

})(current, previous);
