function onLoad() {
    var quantitativeFields = ["base_value", "target_value", "actual_value"];
    var qualitativeFields = ["qualitative_base_value", "qualitative_target_value", "qualitative_actual_value"];
    var choiceList = g_scratchpad.unitOfMeasureChoiceList;

    if (choiceList) {
        //hide non-qualitative fields
        g_form.setMandatory('target_value', false);
        setFieldsDisplay(quantitativeFields, false);

        //hide breakdown interval as well
        if (g_scratchpad.isTargetBreakdownDisabled !== "true")
            g_form.setVisible('breakdown_interval', false);

        //show qualitative fields
        setFieldsDisplay(qualitativeFields, true);

        populateChoiceOptions(choiceList, qualitativeFields);

        g_form.clearOptions('type');
        getMessage('Milestone', function(label) {
            g_form.addOption('type', 'milestone', label);
        });
        g_form.setValue('type', 'milestone');
        g_form.setReadOnly('type', true);

    } else {
        //hide qualitative fields
        setFieldsDisplay(qualitativeFields, false);

        //show non-qualitative fields
        setFieldsDisplay(quantitativeFields, true);

        //show breakdown interval as well
        if (g_scratchpad.isTargetBreakdownDisabled !== "true") {
            g_form.setVisible('breakdown_interval', true);
            if (g_form.getValue('breakdown_interval') !== "") {
                g_form.setMandatory('target_value', true);
            }
        }

        var previousType = g_scratchpad.recentQuantitativeType;
        g_form.clearOptions('type');
        var newTypeToSet = (previousType && previousType === 'minimize') ? 'minimize' : 'maximize';
        getMessage('Maximize', function(label) {
            g_form.addOption('type', 'maximize', label);
            getMessage('Minimize', function(label) {
                g_form.addOption('type', 'minimize', label);
                g_form.setValue('type', newTypeToSet);
            });
        });
        g_form.setReadOnly('type', false);
    }
}

function setFieldsDisplay(fields, isVisible) {
    for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
        g_form.setDisplay(fields[fieldIndex], isVisible);
    }
}

function populateChoiceOptions(choiceList, qualitativeFields) {
    for (var fieldIndex = 0; fieldIndex < qualitativeFields.length; fieldIndex++) {
        var fieldValue = g_form.getValue(qualitativeFields[fieldIndex]);
        g_form.clearOptions(qualitativeFields[fieldIndex]);
        g_form.clearValue(qualitativeFields[fieldIndex]);
        for (var key in choiceList) {
            g_form.addOption(qualitativeFields[fieldIndex], choiceList[key]['value'], choiceList[key]['label']);
        }
        if (fieldValue) {
            g_form.setValue(qualitativeFields[fieldIndex], fieldValue);
        }
    }
}
