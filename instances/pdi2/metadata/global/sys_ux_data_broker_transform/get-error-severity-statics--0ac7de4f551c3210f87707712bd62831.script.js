function transform(input) {
    const startTime = new GlideDateTime().getNumericValue();

    // -------------------- Helper for consistent responses --------------------
    function buildResponse(success, data, errorMsg) {
        const endTime = new GlideDateTime().getNumericValue();
        return {
            success: success,
            data: data || [],
            count: (data && data.length) || 0,
            source_application: input.source_application || null,
            domain_path: input.sys_domain_path || null,
            domain_filter_operator: input.domain_filter_operator || '=',
            include_ignored: input.include_ignored !== 'false',
            error: errorMsg || null,
            timestamp: new GlideDateTime().getValue(),
            execution_time_ms: endTime - startTime
        };
    }

    try {
        const sourceApplicationId = input.source_application;
        const domainPath = input.sys_domain_path;
        const domainFilterOperator = input.domain_filter_operator || '=';
        const includeIgnored = input.include_ignored !== 'false';

        if (!sourceApplicationId)
            return buildResponse(false, [], 'source_application parameter is required');

        // -------------------- Aggregate by Severity --------------------
        const errorStatsAggregate = new GlideAggregate('sys_error_code_stats');
        errorStatsAggregate.addQuery(EFConstants.ERROR_CODE_STATS_FIELDS.APPLICATION, sourceApplicationId);

        if (domainPath && domainPath !== 'all')
            errorStatsAggregate.addQuery('sys_domain_path', domainFilterOperator, domainPath);
        
        errorStatsAggregate.addNotNullQuery('error_code');
        errorStatsAggregate.groupBy('error_code.severity_label');
        errorStatsAggregate.addAggregate('SUM', 'error_count');
        errorStatsAggregate.addAggregate('SUM', 'error_ignored_count');
        errorStatsAggregate.query();

        const severityStats = [];
        while (errorStatsAggregate.next()) {
            const severityLabel =
                errorStatsAggregate.getDisplayValue('error_code.severity_label') ||
                errorStatsAggregate.getValue('error_code.severity_label') ||
                'Unknown';
            const errorCount = parseInt(errorStatsAggregate.getAggregate('SUM', 'error_count')) || 0;
            const ignoredCount = parseInt(errorStatsAggregate.getAggregate('SUM', 'error_ignored_count')) || 0;

            severityStats.push({
                severity_label: severityLabel,
                error_count: errorCount,
                error_ignored_count: ignoredCount
            });
        }

        // -------------------- Return Success --------------------
        return buildResponse(true, severityStats);

    } catch (error) {
        return buildResponse(false, [], error.toString());
    }
}
