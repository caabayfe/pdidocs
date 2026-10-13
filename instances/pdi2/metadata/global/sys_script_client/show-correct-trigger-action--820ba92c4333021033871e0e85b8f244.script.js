var choices = {
    subflow: {
        field: "trigger_subflow",
        display: true,
        mandatory: true
    },
    script: {
        field: "trigger_script",
        display: false,
        mandatory: false
    },
    workflow: {
        field: "trigger_workflow",
        display: false,
        mandatory: false
    }
};

function onChange() {
    var triggerAction = g_form.getValue('trigger_action');
    var triggerChoices = processTriggerChoices(choices, triggerAction);
    for (var choice in triggerChoices) {
        var props = triggerChoices[choice];
        updateDisplayAndMandatory(props.field, props.display, props.mandatory);
    }
}

function updateDisplayAndMandatory(field, display, mandatory) {
    if (!field) return;
    g_form.setMandatory(field, mandatory);
    g_form.setDisplay(field, display);
}

function processTriggerChoices(choices, action) {
    for (var choice in choices) {
        var isTriggerChoice = choice == action;
        for (var property in choices[choice]) {
            if (property != "field") choices[choice][property] = isTriggerChoice;
        }
    }
    return choices;
}
