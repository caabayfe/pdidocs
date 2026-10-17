function updateBoxes() {
    // First hide all the hidden fields
    var allHiddenFields = document.getElementsByClassName("hidden_field");
    for (var i = 0; i < allHiddenFields.length; i++) {
        allHiddenFields[i].hidden = "true";
    }

    // Get the selected radio button
    var choices = document.getElementsByName('pattern');
    var selectedPattern = '';
    for (var i = 0; i < choices.length; i++) {
        if (choices[i].checked) {
            selectedPattern = choices[i].value;
            break;
        }
    }

    // If nothing selected, stop processing
    if (selectedPattern == '')
        return;


    // Unhide the text fields for the selection
    var allHiddenFieldsForPattern = document.getElementsByName('hidden_' + selectedPattern);
    for (var i = 0; i < allHiddenFieldsForPattern.length; i++) {
        allHiddenFieldsForPattern[i].removeAttribute("hidden");
    }
}

function cancelForm() {
    GlideDialogWindow.get().destroy();
}

function okForm() {

    // Get the selected radio button
    var choices = document.getElementsByName('pattern');
    var selectedPattern = '';
    for (var i = 0; i < choices.length; i++) {
        if (choices[i].checked) {
            selectedPattern = choices[i].value;
            break;
        }
    }

    // Ensure a selection is made
    if (selectedPattern == '') {
        alert(getMessage("Please make a selection"));
        return;
    }


    var generatedRegex = '';
    // Set the value of regex based on selection made
    try {
        switch (selectedPattern) {
            case "prefix":
                generatedRegex = getPrefixRegex();
                break;
            case "number_pattern":
                generatedRegex = getNumberPatternRegex();
        }
        GlideDialogWindow.get().destroy();
        g_form.setValue('regex', generatedRegex);
		g_form.setReadOnly('regex', true);
    } catch (e) {

    }

}

function getPrefixRegex() {
    var prefixText = document.getElementById('prefix_text').value;
    if (prefixText == '') {
        alert(getMessage("Please enter a prefix string"));
        throw new Error();
    }

    return prefixText + "\\d{1,20}";

}

function getNumberPatternRegex() {
    // Get the selected radio button
    var choices = document.getElementsByName('delimiter');
    var selectedDelimiter = '';
    for (var i = 0; i < choices.length; i++) {
        if (choices[i].checked) {
            selectedDelimiter = choices[i].value;
            break;
        }
    }

    // If nothing selected
    if (selectedDelimiter == '') {
        alert(getMessage('Please select a delimiter'));
        throw new Error();
    }

    if (selectedDelimiter == '/')
        selectedDelimiter = '\\/'; // Slash needs to be escaped

    return "^[0-9" + selectedDelimiter + "]{1,20}$";

}
