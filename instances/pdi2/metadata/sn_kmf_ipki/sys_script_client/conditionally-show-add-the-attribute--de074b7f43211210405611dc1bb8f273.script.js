var addOption = g_form.getOption('enforcement', 'add');
var addOptionIndex = addOption.index;

function canAddValue(type) {
    switch (type) {
        case "static":
        case "security_attribute":
            return true;
        default:
            return false;
    }
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (!addOption)
        return;

    var hasOption = !!g_form.getOption('enforcement', 'add');
    if (canAddValue(newValue) && !hasOption) {
		console.warn(addOption, addOption.index)
        g_form.addOption('enforcement', 'add', addOption.label, addOptionIndex);
    } else if (!canAddValue(newValue) && hasOption) {
        g_form.removeOption('enforcement', 'add');
    }
}
