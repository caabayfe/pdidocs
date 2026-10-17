/*
	This event fires when the value is changed on the 
	component associated with the content_type variable. 
	This event also fires when the form initially loads.

	This change handler is used to conditionally hide/show 
	components in the variable editor form.
*/
function onChange(control, oldValue, newValue, isLoading) {

    var choiceTypeFields = ['5', '3'];
    var choicesFormValue = g_form.getValue('choices') || "[]";
    var choices = JSON.parse(choicesFormValue);

    // if initially a question w/o choices and switched to choice question w/o choices, insure choices are empty
    if (!choiceTypeFields.includes(oldValue) && !choiceTypeFields.includes(newValue)) {
        choices = [];
    }

    // filter out the "-- None --" choice
    var filteredChoices = choices.filter(item => item.value);
    // update the order for each choice
    filteredChoices.forEach((choice, index) => {
        choice.order = index;
    })

    g_form.setValue('choices', JSON.stringify(filteredChoices));
    g_form.setDisplay('choices', choiceTypeFields.includes(newValue));
}
