function onLoad() {
    var severityValue = parseInt(g_form.getValue('severity'), 10);
    var severityLabel = valueToLabel(severityValue);
    if (severityLabel)
        g_form.setValue('severity_label', severityLabel);

    /**
     * Converts a numeric severity value to its label
     * @param {number} value - The numeric severity value
     * @returns {string|null} The severity label or null if invalid
     */
    function valueToLabel(value) {
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 499) {
            return null;
        }

        if (value <= 99) return 'critical';
        if (value <= 199) return 'high';
        if (value <= 299) return 'medium';
        if (value <= 399) return 'low';
        return 'info';
    }
}
