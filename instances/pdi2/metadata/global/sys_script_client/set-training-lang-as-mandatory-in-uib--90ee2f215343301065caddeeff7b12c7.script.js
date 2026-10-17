function onSubmit() {
    var val = g_form.getValue('training_language');
    if (!val) {
        g_form.addErrorMessage('The following mandatory fields are not filled in: Training language');
        return false;
    }

}
