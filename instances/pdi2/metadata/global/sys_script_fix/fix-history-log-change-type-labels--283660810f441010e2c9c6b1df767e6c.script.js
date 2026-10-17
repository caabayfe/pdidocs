runFixLabelsAndDefault();

function runFixLabelsAndDefault() {
    var labels = {
        "no_code": "Code unchanged",
        "code": "Code changed"
    };

    for (var value in labels)
        updateChoiceLabel('change_type', 'sys_upgrade_history_log', 'en', value, labels[value]);

    updateDefault('change_type', 'sys_upgrade_history_log', 'not_evaluated');
}

function updateChoiceLabel(element, table, language, value, newLabel) {
    var choiceEntry = new GlideRecord('sys_choice');
    choiceEntry.addQuery('name', table);
    choiceEntry.addQuery('element', element);
    choiceEntry.addQuery('value', value);
    choiceEntry.addQuery('language', language);
    choiceEntry.setLimit(1);
    choiceEntry.query();

    if (choiceEntry.next()) {
        choiceEntry.setValue('label', newLabel);
        choiceEntry.update();
        gs.info("Updated " + table + " " + element + " label to " + newLabel);
    } else
        gs.info("Did not find the choice record for " + element + " in " + table);
}

function updateDefault(element, table, newDefault) {
    var dictEntry = new GlideRecord('sys_dictionary');
    dictEntry.addQuery('name', table);
    dictEntry.addQuery('element', element);
    dictEntry.setLimit(1);
    dictEntry.query();

    if (dictEntry.next()) {
        dictEntry.setValue('default_value', newDefault);
        dictEntry.update();
        gs.info("Updated " + table + " " + element + " default to " + newDefault);
    } else
        gs.info("Did not find the dictionary record for " + element + " in " + table);
}
