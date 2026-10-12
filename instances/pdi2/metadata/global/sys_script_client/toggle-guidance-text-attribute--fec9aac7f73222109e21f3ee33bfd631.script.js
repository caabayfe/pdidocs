function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (newValue === '') {
        g_form.setMandatory('guidance_text', true);
    } else {
        g_form.setMandatory('guidance_text', false);
    }

}
