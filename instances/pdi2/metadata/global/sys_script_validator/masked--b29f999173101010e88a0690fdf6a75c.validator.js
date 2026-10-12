function isValidPassword(value, field, isPortal) {
    if (typeof field.useConfirmation !== 'undefined' && field.useConfirmation) {
        if (isPortal)
            return value === field.confirmPassword;
        else
            return value === field.confirmationValue;
    }
    return true;
}

function validate(value, fieldName) {
    var field = g_form.$private.getField(fieldName);
    var fieldLabel = field.label;
    var isPortal = !!NOW.sp;
    if (typeof g_aw !== 'undefined') {
        if (isValidPassword(value, field, isPortal))
            return true;
        else {
            g_form.addErrorMessage(format(getMessage("Error validating fields: {0}"), fieldLabel));
            return false;
        }
    } else {
        if (!isPortal) {
            if (isValidPassword(value, field, isPortal))
                return true;
            loadMessage(message, message);
            g_form.addErrorMessage(getMessage("Error validating fields: {0}", fieldLabel));
            return false;
        }
        var validator = function(callback) {
            if (isValidPassword(value, field, isPortal))
                callback(fieldName, true);
            else
                callback(fieldName, false, "");
        };
        var executor = g_ui_scripts['sp.validation.executor']();
        return executor.execute(fieldName, validator, g_validation_script_field_count, g_form, NOW);
    }
}
