function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === oldValue)
        return;

    // Convert numeric severity value to label based on ranges
    // - 0-99: Critical
    // - 100-199: High
    // - 200-299: Medium
    // - 300-399: Low
    // - 400-499: Info
    var severityValue = parseInt(newValue, 10);
    var severityLabel = valueToLabel(severityValue);
    if (severityLabel)
        g_form.setValue('severity_label', severityLabel);

    /**
     * Converts a numeric severity value to its label
     * @param {number} value - The numeric severity value
     * @returns {string|null} The severity label or null if invalid
     */
    function valueToLabel(value) {
        // Ensure value is a number and within valid range (0-499)
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 499) {
            return null;
        }

        // Convert value to label based on ranges
        if (value <= 99) return 'critical';
        if (value <= 199) return 'high';
        if (value <= 299) return 'medium';
        if (value <= 399) return 'low';
        return 'info';
    }
}
