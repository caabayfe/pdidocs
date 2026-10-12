function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    // Show loading indicator
    g_form.showFieldMsg('table_name', new GwtMessage().getMessage('Validating table...'), 'info');

    // Use AJAX to check if table has sys_user reference fields
    checkTableHasSysUserReferenceAjax(newValue, control);
}

/**
 * Check if table has a sys_user reference field using GlideAjax
 * @param {String} tableName - Name of the table to validate
 * @param {Object} control - Form control object
 */
function checkTableHasSysUserReferenceAjax(tableName, control) {
    var ajax = new GlideAjax('EmailOTPFieldValidationAjax');
    ajax.addParam('sysparm_name', 'checkTableHasSysUserReference');
    ajax.addParam('table_name', tableName);

    ajax.getXMLAnswer(function(response) {
        handleTableValidationResponse(response, control);
    });
}

/**
 * Handle the AJAX response for table validation
 * @param {String} response - JSON response from server
 * @param {Object} control - Form control object
 */
function handleTableValidationResponse(response, control) {
    try {
        var result = JSON.parse(response);

        // Clear any existing messages
        g_form.hideFieldMsg('table_name');

        if (!result.success) {
            clearFieldValue(control);
            g_form.showFieldMsg('table_name', new GwtMessage().getMessage('Selected table does not have any field that references sys_user.'), 'error');
        }
    } catch (e) {
        clearFieldValue(control);
        g_form.showFieldMsg('table_name', new GwtMessage().getMessage('Error validating table. Please try again.'), 'error');
        console.error('Table validation error:', e);
    }
}

/**
 * Clear the field value
 * @param {Object} control - Form control object
 */
function clearFieldValue(control) {
    g_form.setValue('table_name', '');
}
