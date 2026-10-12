function transform(input) {
    var startTime = new GlideDateTime().getNumericValue();

    try {
        var sourceApplicationId = input.source_application;
        
        if (!sourceApplicationId) {
            return {
                success: false,
                error: 'source_application parameter is required',
                data: [],
                timestamp: new GlideDateTime().getValue()
            };
        }

        // Use GlideAggregate to get unique combinations
        var ga = new GlideAggregate('sys_error_code_src_stats');
        ga.addQuery(EFConstants.ERROR_CODE_SOURCE_STATS_FIELDS.APPLICATION, sourceApplicationId);
        ga.addNotNullQuery('error_source_table');
        ga.addNotNullQuery('error_source');
        
        // Group by unique combinations
        ga.groupBy('error_source_table');
        ga.groupBy('error_source');
        
        ga.query();

        var results = [];
        
        while (ga.next()) {
            var errorSourceTable = ga.getValue('error_source_table');
            var errorSourceId = ga.getValue('error_source');
            var errorSourceDisplay = ga.getDisplayValue('error_source');
            
            // Skip if error_source display value is not available
            if (!errorSourceDisplay)
                continue;
            
            results.push({
                error_source_table: errorSourceTable,
                error_source: errorSourceId,
                error_source_display: errorSourceDisplay
            });
        }

        // Sort results by table name first, then by display value descending
        results.sort(function(a, b) {
            var tableCompare = a.error_source_table.localeCompare(b.error_source_table);
            if (tableCompare !== 0)
                return tableCompare;
            
            return b.error_source_display.localeCompare(a.error_source_display); // Descending
        });

        var endTime = new GlideDateTime().getNumericValue();
        
        return {
            success: true,
            data: results,
            count: results.length,
            source_application: sourceApplicationId,
            timestamp: new GlideDateTime().getValue(),
            execution_time_ms: endTime - startTime
        };
        
    } catch (error) {
        var errorEndTime = new GlideDateTime().getNumericValue();
        
        return {
            success: false,
            error: error.toString(),
            data: [],
            timestamp: new GlideDateTime().getValue(),
            execution_time_ms: errorEndTime - startTime
        };
    }
}
