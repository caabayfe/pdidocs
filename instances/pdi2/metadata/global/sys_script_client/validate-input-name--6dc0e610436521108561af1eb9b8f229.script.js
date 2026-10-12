function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
        var sanitizer = new DBNameSanitizer();

        // Sanitize input column name
        newValue = sanitizer.trimName(newValue);

        // Remove leading underscores
        newValue = newValue.replace(/^_/, '');

        sanitizer.setValueOnTargetElement('element', newValue, 'Input');
    });
}
