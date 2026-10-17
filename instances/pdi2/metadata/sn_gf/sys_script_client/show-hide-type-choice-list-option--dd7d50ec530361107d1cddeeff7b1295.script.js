function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    if (newValue == '') {
        //hide qualitative fields
        g_form.setDisplay('qualitative_base_value', false);
        g_form.setDisplay('qualitative_actual_value', false);
        g_form.setDisplay('qualitative_target_value', false);

        if (g_form.getValue('automate_actual_value') == 'false') {
            g_form.setVisible('actual_value_source', false);
            g_form.setSectionDisplay("actual_valuesourceconfiguration", false);
        }

        //handle qual. and quant. columns as well
        //show non-qualitative fields
        g_form.setDisplay('base_value', true);
        g_form.setDisplay('actual_value', true);
        g_form.setDisplay('target_value', true);

        //show breakdown_interval as well
        if (g_scratchpad.isTargetBreakdownDisabled !== "true") {
            g_form.setVisible('breakdown_interval', true);
            if (g_form.getValue('breakdown_interval') !== "") {
                g_form.setMandatory('target_value', true);
            }
        }

        var previousType = g_scratchpad.recentQuantitativeType;
        g_form.clearOptions('type');
        getMessage('Maximize', function(label) {
            g_form.addOption('type', 'maximize', label);
        });
        getMessage('Minimize', function(label) {
            g_form.addOption('type', 'minimize', label);
        });
        var newTypeToSet = (previousType && previousType === 'minimize') ? 'minimize' : 'maximize';
        g_form.setValue('type', newTypeToSet);
        g_form.setReadOnly('type', false);

        return;
    } else {
        g_form.getReference('measure', handleCallback);

    }
}

function handleCallback(measureGr) {
    var choiceSet = measureGr.getValue('choice_set');

    if (choiceSet) {
        //hide non-qualitative fields
        g_form.setMandatory('target_value', false);
        g_form.setDisplay('base_value', false);
        g_form.setDisplay('actual_value', false);
        g_form.setDisplay('target_value', false);

        //hide breakdown interval as well
        if (g_scratchpad.isTargetBreakdownDisabled !== "true")
            g_form.setVisible('breakdown_interval', false);

        //show qualitative fields
        g_form.setDisplay('qualitative_base_value', true);
        g_form.setDisplay('qualitative_actual_value', true);
        g_form.setDisplay('qualitative_target_value', true);

        //clear the values of automate actual value, it is not supported for qual. targets
        g_form.setValue('automate_actual_value', false);

        g_form.clearOptions('type');
        getMessage('Milestone', function(label) {
            g_form.addOption('type', 'milestone', label);
        });
        g_form.setValue('type', 'milestone');
        g_form.setReadOnly('type', true);

        //populate choice for qual. fields
        var ga = new GlideAjax('PopulateQualitativeChoiceFieldHelper');
        ga.addParam('sysparm_name', 'getChoiceList');
        ga.addParam('sysparm_choice_set', choiceSet);
        ga.getXML(ChoiceListHandler);

    } else {

        //hide qualitative fields
        g_form.setDisplay('qualitative_base_value', false);
        g_form.setDisplay('qualitative_actual_value', false);
        g_form.setDisplay('qualitative_target_value', false);

        if (g_form.getValue('automate_actual_value') == 'false') {
            g_form.setVisible('actual_value_source', false);
            g_form.setSectionDisplay("actual_valuesourceconfiguration", false);
        }

        //show non-qualitative fields
        g_form.setDisplay('base_value', true);
        g_form.setDisplay('actual_value', true);
        g_form.setDisplay('target_value', true);

        //show breakdown interval as well
        if (g_scratchpad.isTargetBreakdownDisabled !== "true") {
            g_form.setVisible('breakdown_interval', true);
            if (g_form.getValue('breakdown_interval') !== "") {
                g_form.setMandatory('target_value', true);
            }
        }

        var previousType = g_scratchpad.recentQuantitativeType;
        g_form.clearOptions('type');
        getMessage('Maximize', function(label) {
            g_form.addOption('type', 'maximize', label);
        });
        getMessage('Minimize', function(label) {
            g_form.addOption('type', 'minimize', label);
        });
        var newTypeToSet = (previousType && previousType === 'minimize') ? 'minimize' : 'maximize';
        g_form.setValue('type', newTypeToSet);
        g_form.setReadOnly('type', false);
    }
}

function ChoiceListHandler(response) {
    var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
    var qualitativeFields = ["qualitative_base_value", "qualitative_target_value", "qualitative_actual_value"];
    var choiceFieldValues = Object.keys(answer).map(function(key) {
        return answer[key]['value'];
    });

    for (var fieldIndex = 0; fieldIndex < qualitativeFields.length; fieldIndex++) {
        var fieldValue = g_form.getValue(qualitativeFields[fieldIndex]);
        g_form.clearOptions(qualitativeFields[fieldIndex]);
        g_form.clearValue(qualitativeFields[fieldIndex]);
        for (var key in answer) {
            g_form.addOption(qualitativeFields[fieldIndex], answer[key]['value'], answer[key]['label']);
        }
        if (fieldValue && (choiceFieldValues.indexOf(fieldValue) > -1)) {
            g_form.setValue(qualitativeFields[fieldIndex], fieldValue);
        }
    }
}
