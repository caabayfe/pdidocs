function onCondition() {
    g_form.showFieldMsg('lookup_table', new GwtMessage().getMessage('Important Note: Choices will be limited to {0} records. Use a reference qualifier to ensure that the result set is less than this limit and for a better user experience.', g_scratchpad.max_choices_lookup_choice), 'info');
}
