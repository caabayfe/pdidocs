function transform(input) {
    /**
     * Returns a computed summary object for the Insights summary card component.
     * No LLM call — pure algorithmic computation from EFInsightsDataBuilder.
     *
     * Input:
     *   @param {string} input.errorPrefix  - Error prefix (e.g. 'SN-DISC')
     *   @param {string} [input.domainPath] - Domain path for STARTSWITH filtering
     *   @param {number} [input.timeRangeDays] - Lookback window in days (default: 14)
     *
     * Returns:
     *   { success: true, data: { source_application, error_prefix, total_errors,
     *     total_error_codes, critical_error_codes, high_error_codes,
     *     total_ignored, total_recent, time_range_days, message } }
     */
    function getSummary(errorPrefix, domainPath, timeRangeDays) {
        var logger = EFLogger.forClass('EFInsightsSummaryTransform');

        if (!errorPrefix) {
            logger.error('Missing required parameter: errorPrefix');
            return EFResponse.failure('Missing required parameter: errorPrefix').toJSON();
        }

        try {
            var options = {};
            if (domainPath) options.domainPath = domainPath;
            if (timeRangeDays) options.timeRangeDays = parseInt(timeRangeDays);

            var builder = new EFInsightsDataBuilder(errorPrefix, options);
            var summary = builder.getSummary();

            return EFResponse.success(summary).toJSON();

        } catch (e) {
            logger.error('getSummary failed: ' + e.message);
            return EFResponse.failure('Summary computation failed: ' + e.message).toJSON();
        }
    }

    return getSummary(input.errorPrefix, input.domainPath, input.timeRangeDays);
}
