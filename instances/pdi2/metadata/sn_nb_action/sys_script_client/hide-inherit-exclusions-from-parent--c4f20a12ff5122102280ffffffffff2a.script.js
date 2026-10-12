function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    //Hide Inherit exclusions from parent context field when parent context is empty
    if (newValue === '') {
        g_form.setDisplay('inherit_exclusions_from_parent_context', false);
    } else {
        g_form.setDisplay('inherit_exclusions_from_parent_context', true);
    }
}
