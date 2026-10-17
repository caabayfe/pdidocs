function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (!isLoading && newValue == 25)
        g_form.setValue('mask_use_encryption', true);

}
