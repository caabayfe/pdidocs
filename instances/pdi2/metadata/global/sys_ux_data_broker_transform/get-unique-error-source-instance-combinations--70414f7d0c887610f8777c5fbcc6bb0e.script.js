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
        var ga = new GlideAggregate('sys_error_code_inst_stats');
        ga.addQuery(EFConstants.ERROR_CODE_INSTANCE_STATS_FIELDS.APPLICATION, sourceApplicationId);
        ga.addNotNullQuery('error_instance_table');
        ga.addNotNullQuery('error_instance');
        
        // Group by unique combinations
        ga.groupBy('error_source_table');
        ga.groupBy('error_source');
        ga.groupBy('error_instance_table');
        ga.groupBy('error_instance');
        
        ga.query();

        var results = [];
        
        while (ga.next()) {
            var errorSourceTable = ga.getValue('error_source_table') || '';
            var errorSourceId = ga.getValue('error_source') || '';
            var errorInstanceTable = ga.getValue('error_instance_table');
            var errorInstanceId = ga.getValue('error_instance');
            
            var errorInstanceDisplay = ga.getDisplayValue('error_instance');
            
            // Skip if error_instance display value is not available
            if (!errorInstanceDisplay)
                continue;
            
            var errorSourceDisplay = errorSourceId ? ga.getDisplayValue('error_source') || 'Unknown' : '';
            
            results.push({
                error_source_table: errorSourceTable,
                error_source: errorSourceId,
                error_source_display: errorSourceDisplay,
                error_instance_table: errorInstanceTable,
                error_instance: errorInstanceId,
                error_instance_display: errorInstanceDisplay,
                is_standalone: !errorSourceTable || !errorSourceId // Flag for standalone instances
            });
        }

        // Sort results by instance table first, then by instance display value descending
        results.sort(function(a, b) {
            var instanceTableCompare = a.error_instance_table.localeCompare(b.error_instance_table);
            if (instanceTableCompare !== 0)
                return instanceTableCompare;
            
            return b.error_instance_display.localeCompare(a.error_instance_display); // Descending
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
