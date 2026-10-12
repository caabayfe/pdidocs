(function executeRule(current, previous /*null when async*/ ) {
    // Only (re)compute severity_label on insert or when the numeric severity changes.
    // severity_label is read-only and mandatory, so this rule is its server-side source
    // of truth — form client scripts only cover interactive edits, not programmatic/seed
    // inserts (DEF0850762).
    if (!current.isNewRecord() && !current.severity.changes())
        return;

    var severityValue = parseInt(current.getValue(EFConstants.ERROR_CODE_FIELDS.SEVERITY), 10);
    current.setValue(EFConstants.ERROR_CODE_FIELDS.SEVERITY_LABEL, valueToLabel(severityValue));

    /**
     * Converts a numeric severity value to its label.
     * Ranges: 0-99 critical, 100-199 high, 200-299 medium, 300-399 low, 400-499 info.
     * Non-numeric / out-of-range falls back to 'low' (matches the severity column default of 399).
     * @param {number} value - The numeric severity value
     * @returns {string} The severity label
     */
    function valueToLabel(value) {
        if (typeof value !== 'number' || isNaN(value) ||
            value < EFConstants.SEVERITY_VALUES.CRITICAL || value > EFConstants.SEVERITY_VALUES.INFO + 99)
            return EFConstants.SEVERITY_LEVELS.LOW;
        if (value < EFConstants.SEVERITY_VALUES.HIGH) return EFConstants.SEVERITY_LEVELS.CRITICAL;
        if (value < EFConstants.SEVERITY_VALUES.MEDIUM) return EFConstants.SEVERITY_LEVELS.HIGH;
        if (value < EFConstants.SEVERITY_VALUES.LOW) return EFConstants.SEVERITY_LEVELS.MEDIUM;
        if (value < EFConstants.SEVERITY_VALUES.INFO) return EFConstants.SEVERITY_LEVELS.LOW;
        return EFConstants.SEVERITY_LEVELS.INFO;
    }
})(current, previous);
