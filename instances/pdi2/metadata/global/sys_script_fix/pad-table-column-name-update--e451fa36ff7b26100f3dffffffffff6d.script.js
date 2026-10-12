// Tables and configs
var tables = ['sys_pd_activity_definition', 'sys_pd_derivative'];
var columnName = 'ai_agent_execution_mode';
var newColumnLabel = 'Complete independently';

// --- Update sys_dictionary entries ---
for (var i = 0; i < tables.length; i++) {
    var dictGR = new GlideRecord('sys_dictionary');
    dictGR.addQuery('name', tables[i]);
    dictGR.addQuery('element', columnName);
    dictGR.query();

    if (dictGR.next()) {
        gs.info('Found dictionary entry in ' + tables[i] + ': ' + dictGR.sys_id);

        // Update values
        dictGR.column_label = newColumnLabel;
        dictGR.internal_type = 'radio';
        dictGR.choice = null;
        dictGR.default_value = 'off';
        dictGR.update();

        gs.info('Updated column label in ' + tables[i] + ' to: ' + dictGR.column_label);
    } else {
        gs.warn('No sys_dictionary record found for table ' + tables[i] + ' with column ' + columnName);
    }

    // --- Delete existing sys_choice records ---
    var deleteChoiceGR = new GlideRecord('sys_choice');
    deleteChoiceGR.addQuery('name', tables[i]);
    deleteChoiceGR.addQuery('element', columnName);
    deleteChoiceGR.query();

    var deletedCount = 0;
    while (deleteChoiceGR.next()) {
        gs.info('Deleting choice "' + deleteChoiceGR.value + '" with label "' + deleteChoiceGR.label + '" from ' + tables[i]);
        deleteChoiceGR.deleteRecord();
        deletedCount++;
    }
    gs.info('Deleted ' + deletedCount + ' existing choice records from ' + tables[i]);

    // --- Create new sys_choice records ---
    var newChoices = [
        { value: "off", label: "Off", sequence: 0 },
        { value: "on", label: "On", sequence: 1 }
    ];

    for (var j = 0; j < newChoices.length; j++) {
        var newChoiceGR = new GlideRecord('sys_choice');
        newChoiceGR.initialize();
        
        newChoiceGR.name = tables[i];
        newChoiceGR.element = columnName;
        newChoiceGR.value = newChoices[j].value;
        newChoiceGR.label = newChoices[j].label;
        newChoiceGR.sequence = newChoices[j].sequence;
        
        var newChoiceSysId = newChoiceGR.insert();
        gs.info('Created new choice "' + newChoices[j].label + '" (' + newChoices[j].value + ') in ' + tables[i] + ' with sys_id: ' + newChoiceSysId);
    }

    // --- Update ai_agent_field_display_preferences dictionary default ---
    var prefGR = new GlideRecord('sys_dictionary');
    prefGR.addQuery('name', tables[i]);
    prefGR.addQuery('element', 'ai_agent_field_display_preferences');
    prefGR.query();

    if (prefGR.next()) {
        prefGR.default_value = 'enable_ai_agent=all;ai_agent_objective=all;ai_agent_run_as=all;ai_agent_execution_mode=all;conversational_agents=all;ai_agent_obj_additional_detail=all;ai_agent_supported_actions=all';
        prefGR.update();
        gs.info('Updated default value for ai_agent_field_display_preferences in ' + tables[i]);
    } else {
        gs.warn('No sys_dictionary record found for ai_agent_field_display_preferences in ' + tables[i]);
    }
}

// Phase 2: Update data in both tables
var targetTables = ['sys_pd_activity_definition', 'sys_pd_derivative'];
var targetField = 'ai_agent_execution_mode';
var targetValue = 'off';

var activitiesSupportAutoCompletion = ['f16277690703001070e493d0fad30018', 'caee4d471b0c1010affd0e55cc4bcbaf', 'c9839e38b701311004c164fdde11a904', 'cdb5cd6f777b71106ed97a8c8c5a9957'];


for (var t = 0; t < targetTables.length; t++) {
    var recGR = new GlideRecord(targetTables[t]);
    recGR.query();

    var updatedCount = 0;
    while (recGR.next()) {
        var sysId = recGR.getValue('sys_id');

        // Set execution_mode to 'on' for activities that support autocompletion
        if (activitiesSupportAutoCompletion.includes(sysId)) {
            targetValue = 'on';
        } else {
            targetValue = 'off';
        }

        // Set execution_mode to target value
        recGR.setValue(targetField, targetValue);

        recGR.update();
        updatedCount++;
    }
    gs.info('Phase 2: Updated ' + updatedCount + ' records in ' + targetTables[t] +
        ' setting ' + targetField + ' = ' + targetValue);
}
