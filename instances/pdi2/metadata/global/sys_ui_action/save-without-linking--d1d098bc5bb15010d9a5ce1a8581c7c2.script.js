// Client Side function called on click
function saveForm() {
    if (!labelIsValid()) {
        g_form.addErrorMessage("You can't submit until all required fields are filled in");
        return false;
    }
	
    g_form.save();
}

function labelIsValid() {
    return g_form.getValue('label') != null && g_form.getValue('label').trim().length > 0;
}
