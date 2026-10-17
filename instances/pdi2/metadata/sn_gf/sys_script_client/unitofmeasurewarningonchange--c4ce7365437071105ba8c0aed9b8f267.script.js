function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(g_form.isNewRecord()){
		if(newValue)
			g_form.getReference('measure', handleCallback);
			
		return;
	}
    if (isLoading) {
        g_scratchpad.unitOfMeasureOldValueSysId = "";
        return;
    }
    if (g_scratchpad.unitOfMeasureOldValueSysId === newValue) {
        return;
    }

    if (!g_scratchpad.unitOfMeasureOldValueSysId) {
        g_scratchpad.unitOfMeasureOldValueSysId = oldValue;
    }

    function clearFields(fields) {
        for (var field in fields) {
            g_form.clearValue(fields[field]);
			g_form.setMandatory(fields[field], false);
        }
    }

    function handleCallback(measureGr) {
        var quantitativeFields = ["base_value", "target_value", "actual_value","percent_complete"];
        var qualitativeFields = ["qualitative_base_value", "qualitative_target_value", "qualitative_actual_value","percent_complete"];
        if (measureGr.getValue('choice_set')) {
            g_scratchpad.recentQuantitativeType = "";
            clearFields(quantitativeFields);
        } else {
            clearFields(qualitativeFields);
        }
    }

    function doComplete() {
        g_scratchpad.unitOfMeasureOldValueSysId = newValue;
        if (g_scratchpad.isGFAInstalled && g_form.getValue("breakdown_interval") !== "") {
            g_form.setValue("breakdown_interval", "");
        }
        g_form.getReference('measure', handleCallback);
    }

    function doCancel() {
        g_form.setValue("measure", g_scratchpad.unitOfMeasureOldValueSysId);
    }

    function showDialogBox(message) {
        if (!this) {
            var dialog = new GlideModal("glide_modal_confirm");
            dialog.setTitle(getMessage("Confirmation"));
            dialog.setPreference('warning', true);
            dialog.setPreference('body', message);
            dialog.setPreference('buttonLabelComplete', getMessage('Yes'));
            dialog.setPreference('buttonLabelCancel', getMessage('No'));
            dialog.setPreference('onPromptComplete', doComplete);
            dialog.setPreference('onPromptCancel', doCancel);
            dialog.render();
        } else {
            g_modal.confirm(getMessage("Confirmation"), message, function(ret) {
                if (!ret) {
                    doCancel();
                } else {
                    doComplete();
                }
            });
        }
    }

    if (newValue) {
        var goalFrameworkAjaxProcessor = new GlideAjax('sn_gf.GoalFrameworkAjaxProcessor');
        goalFrameworkAjaxProcessor.addParam('sysparm_name', 'getWarningMessageForUnitOfMeasure');
        goalFrameworkAjaxProcessor.addParam('sysparm_old_value', g_scratchpad.unitOfMeasureOldValueSysId);
        goalFrameworkAjaxProcessor.addParam('sysparm_new_value', newValue);
        goalFrameworkAjaxProcessor.getXMLAnswer(function(response) {
            var answer = JSON.parse(response);
            if (answer && answer['warningMessage']) {
                showDialogBox(answer['warningMessage']);
            } else {
                g_scratchpad.unitOfMeasureOldValueSysId = newValue;
            }
        });
    }
}
