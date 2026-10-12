function transform(input) {
    // HELPER METHOD 1: Get Total Error Count
    function getTotalErrorCount(encodedQuery) {
        var baseFilter = "state!=ignored";
        var finalQuery = encodedQuery ? encodedQuery + "^" + baseFilter : baseFilter;
        var ga = new GlideAggregate("sys_error");
        ga.addEncodedQuery(finalQuery);
        ga.addAggregate("COUNT");
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate("COUNT")) : 0;
    }
    
    // HELPER METHOD 2: Get Critical Error Count
    function getCriticalErrorCount(encodedQuery) {
        var baseFilter = "state!=ignored";
        var criticalFilter = "error_code.severity_label=critical";
        var finalQuery = baseFilter + "^" + criticalFilter;
        if (encodedQuery) {
            finalQuery = encodedQuery + "^" + finalQuery;
        }
        var ga = new GlideAggregate("sys_error");
        ga.addEncodedQuery(finalQuery);
        ga.addAggregate("COUNT");
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate("COUNT")) : 0;
    }
    
    // HELPER METHOD 3: Get Unresolved Error Count
    function getUnresolvedErrorCount(encodedQuery) {
        var unresolvedFilter = "state!=ignored^state!=closed";
        var finalQuery = encodedQuery ? encodedQuery + "^" + unresolvedFilter : unresolvedFilter;
        var ga = new GlideAggregate("sys_error");
        ga.addEncodedQuery(finalQuery);
        ga.addAggregate("COUNT");
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate("COUNT")) : 0;
    }
    
    // HELPER METHOD 4: Get Resolved Today Count
    function getResolvedTodayCount(encodedQuery) {
        var baseFilter = "state!=ignored";
        var todayFilter = "state=closed^sys_updated_on>javascript:gs.daysAgoStart(0)";
        var finalQuery = baseFilter + "^" + todayFilter;
        if (encodedQuery) {
            finalQuery = encodedQuery + "^" + finalQuery;
        }
        var ga = new GlideAggregate("sys_error");
        ga.addEncodedQuery(finalQuery);
        ga.addAggregate("COUNT");
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate("COUNT")) : 0;
    }

    // MAIN LOGIC STARTS HERE
    try {
        var encodedQuery = input.encodedQuery || "";
        
        // CALCULATE ALL METRICS
        var metrics = {
            total_errors: getTotalErrorCount(encodedQuery),
            critical_errors: getCriticalErrorCount(encodedQuery),
            unresolved_errors: getUnresolvedErrorCount(encodedQuery),
            resolved_today: getResolvedTodayCount(encodedQuery)
        };
        
        return {
            success: true,
            data: metrics,
            metadata: {
                query_applied: encodedQuery || "No additional filter",
                timestamp: new GlideDateTime().getValue()
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.toString(),
            data: {
                total_errors: 0,
                critical_errors: 0,
                unresolved_errors: 0,
                resolved_today: 0
            }
        };
    }
}
