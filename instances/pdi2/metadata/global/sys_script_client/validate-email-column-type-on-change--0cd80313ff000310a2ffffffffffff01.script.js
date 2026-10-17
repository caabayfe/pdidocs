function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var tableName = g_form.getValue('table_name');
    if (!tableName) {
        g_form.showFieldMsg('email_column', new GwtMessage().getMessage('Please select a table first.'), 'error');
        g_form.setValue('email_column', '');
        return;
    }

    // Show loading indicator
    g_form.showFieldMsg('email_column', new GwtMessage().getMessage('Validating email column...'), 'info');

    // Use AJAX to validate email column type
    validateEmailColumnTypeAjax(tableName, newValue, control);
}

/**
 * Validate email column is of type email using GlideAjax
 * @param {String} tableName - Name of the table
 * @param {String} fieldName - Name of the field to validate
 * @param {Object} control - Form control object
 */
function validateEmailColumnTypeAjax(tableName, fieldName, control) {
    var ajax = new GlideAjax('EmailOTPFieldValidationAjax');
    ajax.addParam('sysparm_name', 'validateEmailColumnType');
    ajax.addParam('table_name', tableName);
    ajax.addParam('field_name', fieldName);

    ajax.getXMLAnswer(function(response) {
        handleEmailColumnValidationResponse(response, control);
    });
}

/**
 * Handle the AJAX response for email column validation
 * @param {String} response - JSON response from server
 * @param {Object} control - Form control object
 */
function handleEmailColumnValidationResponse(response, control) {
    try {
        var result = JSON.parse(response);

        // Clear any existing messages
        g_form.hideFieldMsg('email_column');

        if (!result.success) {
            g_form.setValue('email_column', '');
            g_form.showFieldMsg('email_column', new GwtMessage().getMessage('Selected field is not an email type field. Please choose a field with internal type "email".'), 'error');
        }
    } catch (e) {
        g_form.setValue('email_column', '');
        g_form.showFieldMsg('email_column', new GwtMessage().getMessage('Error validating email column. Please try again.'), 'error');
        console.error('Email column validation error:', e);
    }
}
