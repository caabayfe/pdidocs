function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var tableName = g_form.getValue('table_name');
    if (!tableName) {
        g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Please select a table first.'), 'error');
        g_form.setValue('user_column', '');
        return;
    }

    // Show loading indicator
    g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Validating user column...'), 'info');

    // Use AJAX to validate user column references sys_user
    validateUserColumnReferenceAjax(tableName, newValue, control);
}

/**
 * Validate user column references sys_user using GlideAjax
 * @param {String} tableName - Name of the table
 * @param {String} fieldName - Name of the field to validate
 * @param {Object} control - Form control object
 */
function validateUserColumnReferenceAjax(tableName, fieldName, control) {
    var ajax = new GlideAjax('EmailOTPFieldValidationAjax');
    ajax.addParam('sysparm_name', 'validateUserColumnReference');
    ajax.addParam('table_name', tableName);
    ajax.addParam('field_name', fieldName);

    ajax.getXMLAnswer(function(response) {
        handleUserColumnValidationResponse(response, control);
    });
}

/**
 * Handle the AJAX response for user column validation
 * @param {String} response - JSON response from server
 * @param {Object} control - Form control object
 */
function handleUserColumnValidationResponse(response, control) {
    try {
        var result = JSON.parse(response);

        // Clear any existing messages
        g_form.hideFieldMsg('user_column');

        if (!result.success) {
            g_form.setValue('user_column', '');
            g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Selected field does not reference sys_user. Please choose a valid reference field.'), 'error');
        }
    } catch (e) {
        g_form.setValue('user_column', '');
        g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Error validating user column. Please try again.'), 'error');
        console.error('User column validation error:', e);
    }
}
