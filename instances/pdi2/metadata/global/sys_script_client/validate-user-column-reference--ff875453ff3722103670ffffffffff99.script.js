function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var tableName = g_form.getValue('answer_table');

    // Show loading indicator
    g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Validating field...'), 'info');

    // Use AJAX to validate the field reference
    validateFieldReferenceAjax(tableName, newValue, control);
}

/**
 * Validate field reference using GlideAjax
 * @param {String} tableName - Name of the table
 * @param {String} fieldName - Name of the field to validate
 * @param {Object} control - Form control object
 */
function validateFieldReferenceAjax(tableName, fieldName, control) {
    var ajax = new GlideAjax('KBAnswerFieldsValidationAjax');
    ajax.addParam('sysparm_name', 'validateFieldReference');
    ajax.addParam('table_name', tableName);
    ajax.addParam('field_name', fieldName);

    ajax.getXMLAnswer(function(response) {
        handleFieldValidationResponse(response, control);
    });
}

/**
 * Handle the AJAX response for field validation
 * @param {String} response - JSON response from server
 * @param {Object} control - Form control object
 */
function handleFieldValidationResponse(response, control) {
    try {
        var result = JSON.parse(response);

        // Clear any existing messages
        g_form.hideFieldMsg('user_column');

        if (result.success) {
            // Field is valid - show success message briefly then clear it
            g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Field validation successful'), 'info');
            setTimeout(function() {
                g_form.hideFieldMsg('user_column');
            }, 2000);
        } else {
            // Field is invalid - clear value and show error
            clearFieldValue(control);
            g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Field does not have a reference'), 'error');
        }
    } catch (e) {
        // Handle JSON parsing errors
        clearFieldValue(control);
        g_form.showFieldMsg('user_column', new GwtMessage().getMessage('Error validating field. Please try again.'), 'error');
        console.error('Field validation error:', e);
    }
}

/**
 * Clear the field value
 * @param {Object} control - Form control object
 */
function clearFieldValue(control) {
    if (control) {
        control.setValue('');
    } else {
        var fieldName = 'user_column';
        g_form.setValue(fieldName, '');
    }
}
