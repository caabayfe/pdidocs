function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    //If user column is not mandatory skip the check
    var propValue = true;
    var gr = new GlideRecord('sys_properties');
    gr.addQuery('name', 'glide.auth_factors.kba.enable_user_column');
    gr.query();

    if (gr.next()) {
        propValue = gr.value == 'true';
    }

    if (!propValue) {
        return;
    }

    // Show loading indicator
    g_form.showFieldMsg('answer_table', new GwtMessage().getMessage('Validating table...'), 'info');


    // Use AJAX to check if table has reference fields
    checkTableHasReferenceAjax(newValue, control);
}

/**
 * Check if table has a reference fields using GlideAjax
 * @param {String} tableName - Name of the table to validate
 * @param {Object} control - Form control object
 */
function checkTableHasReferenceAjax(tableName, control) {
    var ajax = new GlideAjax('KBAnswerFieldsValidationAjax');
    ajax.addParam('sysparm_name', 'checkTableHasReference');
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
        g_form.hideFieldMsg('answer_table');

        if (result.success) {
            // Table has reference fields - show success message briefly
            var fieldCount = result.data.fieldCount || 0;
            g_form.showFieldMsg('answer_table', new GwtMessage().getMessage('Table validation successful (number of reference fields found: {0})', fieldCount), 'info');
            setTimeout(function() {
                g_form.hideFieldMsg('answer_table');
            }, 3000);

            // Optionally log the user fields found for debugging
            if (result.data.userFields && result.data.userFields.length > 0) {
                console.log('Reference fields found in table ' + result.data.table + ':',
                    result.data.userFields);
            }
        } else {
            // Table does not have reference fields - clear value and show error
            clearFieldValue(control);
            g_form.showFieldMsg('answer_table', new GwtMessage().getMessage('Selected table should have a field referenced.'), 'error');
        }
    } catch (e) {
        // Handle JSON parsing errors
        clearFieldValue(control);
        g_form.showFieldMsg('answer_table', new GwtMessage().getMessage('Error validating table. Please try again.'), 'error');
        console.error('Table validation error:', e);
    }
}

/**
 * Clear the field value
 * @param {Object} control - Form control object
 */
function clearFieldValue(control) {
    var fieldName = 'answer_table';
    g_form.setValue(fieldName, '');
}
