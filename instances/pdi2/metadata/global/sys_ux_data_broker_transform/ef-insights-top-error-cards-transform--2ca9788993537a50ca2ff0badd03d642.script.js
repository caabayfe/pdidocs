function transform(input) {
    /**
     * Returns top N error code cards ranked by impact_score for the error cards
     * list component. No LLM call — pure algorithmic computation from EFInsightsDataBuilder.
     *
     * Input:
     *   @param {string} input.errorPrefix     - Error prefix (e.g. 'SN-DISC')
     *   @param {string} [input.domainPath]    - Domain path for STARTSWITH filtering
     *   @param {number} [input.topN]          - Number of cards to return (default: 5)
     *   @param {number} [input.timeRangeDays] - Lookback window in days (default: 14)
     *
     * Returns:
     *   { success: true, data: { cards: [...], summary: {...} } }
     *   Each card: { stats_sys_id, error_code, error_code_name, error_code_sys_id,
     *                severity_label, category_name, error_count, recent_error_count,
     *                error_ignored_count, impact_score }
     */
    function getTopErrorCards(errorPrefix, domainPath, topN, timeRangeDays) {
        var logger = EFLogger.forClass('EFInsightsTopErrorCardsTransform');

        if (!errorPrefix) {
            logger.error('Missing required parameter: errorPrefix');
            return EFResponse.failure('Missing required parameter: errorPrefix').toJSON();
        }

        try {
            var options = {};
            if (domainPath) options.domainPath = domainPath;
            if (timeRangeDays) options.timeRangeDays = parseInt(timeRangeDays);

            var builder = new EFInsightsDataBuilder(errorPrefix, options);
            var n = topN ? parseInt(topN) : 5;

            var cards = builder.getTopErrorCodeCards(n);
            var summary = builder.getSummary();

            return EFResponse.success({
                cards: cards,
                summary: summary
            }).toJSON();

        } catch (e) {
            logger.error('getTopErrorCards failed: ' + e.message);
            return EFResponse.failure('Top error cards computation failed: ' + e.message).toJSON();
        }
    }

    return getTopErrorCards(input.errorPrefix, input.domainPath, input.topN, input.timeRangeDays);
}
