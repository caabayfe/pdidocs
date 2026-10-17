function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var userDotwalkedField = 'user_dotwalked_field';
    if (newValue == 'dot_walked_field') {
        g_form.setDisplay(userDotwalkedField, true);
        g_form.setMandatory(userDotwalkedField, true);
    } else {
        g_form.setDisplay(userDotwalkedField, false);
    }

}
