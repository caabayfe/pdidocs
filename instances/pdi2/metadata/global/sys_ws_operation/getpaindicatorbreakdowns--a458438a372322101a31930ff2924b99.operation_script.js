(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var sysparm_query = request.queryParams.sysparm_query;
    var sysparm_having = request.queryParams.sysparm_having;

    var result = [];
    var uniqueBreakDowns = [];

    var breakdowns = new GlideAggregate('pa_indicator_breakdowns');
    if (sysparm_having) {
        breakdowns.addAggregate('COUNT');
        breakdowns.groupBy('breakdown');
    }
    breakdowns.addEncodedQuery(sysparm_query);
    breakdowns.orderBy('breakdown');
    breakdowns.query();
    while (breakdowns.next()) {
        if (sysparm_having) {
            var count = breakdowns.getAggregate('COUNT');
            if (parseInt(count) <= 1)
                continue;
        }

        var breakdownId = breakdowns.getValue('breakdown');
        var breakdown = {
            groupby_fields: [{
                field: 'breakdown',
                value: breakdowns.getValue('breakdown'),
                display_value: breakdowns.getDisplayValue('breakdown'),
            }, ],
        };

        // Add only unique breakdowns
        if (!uniqueBreakDowns.includes(breakdownId)) {
            var breakdownGR = new GlideRecordSecure('pa_breakdowns');
            // Return only breakdowns that user has access to
            if (breakdownGR.get(breakdownId))
                result.push(breakdown);

            uniqueBreakDowns.push(breakdownId);
        }
    }

    response.setBody(result);

})(request, response);
