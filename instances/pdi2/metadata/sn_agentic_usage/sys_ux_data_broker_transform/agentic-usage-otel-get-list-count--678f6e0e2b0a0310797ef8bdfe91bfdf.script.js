function transform(input) {
    // Extract and validate input parameters with defaults
    var serviceName = (input && input.serviceName) || "glide";
    var metricName = (input && input.metricName) || "sn.glide.action_fabric.record_action";
    var startTime = (input && input.startTime) || "P3M";
    var endTime = (input && input.endTime) || null;
    var groupByField = (input && input.groupBy) || '';
    var groupByFields = groupByField ? groupByField.split(',').map(function(s) { return s.trim(); }) : [];
    var projections = (input && input.projections) || [];
    var predicateComposition = (input && input.predicateComposition) || {};

    var filterConfigurations = (input && input.filterConfigurations) || "[]";

    var adaptor = new sn_agentic_usage.TelemetryQueryAdaptorActionFabric();

    function getScoreCount() {
        var startTimeStr, endTimeStr;
        if (endTime) {
            var gdtStart = new GlideDateTime();
            gdtStart.setDisplayValue(startTime);
            startTimeStr = gdtStart.getValue().substring(0, 19);
            var gdtEnd = new GlideDateTime();
            gdtEnd.setDisplayValue(endTime);
            endTimeStr = gdtEnd.getValue().substring(0, 19);
        } else {
            var dateRange = adaptor.getAbsoluteDateRange(startTime);
            startTimeStr = dateRange.startTimeStr;
            endTimeStr = dateRange.endTimeStr;
        }

        var parsedFilterConfigurations = (typeof filterConfigurations === 'string')
            ? JSON.parse(filterConfigurations || '[]')
            : (filterConfigurations || []);
        var filterAnd = adaptor.buildFilterAndFromRange(serviceName, metricName, startTimeStr, endTimeStr, parsedFilterConfigurations);

        var parsedProjections = Array.isArray(projections) ? projections : [];
        if (!parsedProjections.length && typeof projections === 'string') {
            try { parsedProjections = JSON.parse(projections); } catch(e) { parsedProjections = []; }
        }

        var queryProjections;
        if (groupByFields.length > 0) {
            queryProjections = parsedProjections
                .filter(function(p) { return p.key !== 'Total'; })
                .map(function(p) { var proj = {}; proj[p.key] = p.label; return proj; });
            queryProjections.push(adaptor.buildSumProjection());
        } else {
            queryProjections = [{"$count": "MetricName", "alias": "MetricName_1"}];
        }

        var parsedPredicates = predicateComposition;
        if (typeof parsedPredicates === 'string') {
            try { parsedPredicates = JSON.parse(parsedPredicates); } catch(e) { parsedPredicates = {}; }
        }
        if (parsedPredicates && parsedPredicates.predicate &&
            Array.isArray(parsedPredicates.predicate.predicates) &&
            parsedPredicates.predicate.predicates.length > 0) {
            var predicateFilters = parsedPredicates.predicate.predicates.map(function(p) {
                var prop = p.predicateProperties.selectedProperty;
                var val = p.predicateProperties.selectedValue[0];
                var cond = {};
                cond[prop] = {"$eq": val};
                return cond;
            });
            filterAnd.push({"$and": predicateFilters});
        }

        var payload = {
            "type": "telemetry_counter",
            "projection": queryProjections.length > 0 ? queryProjections : [{"MetricName": "MetricName"}],
            "filter": {"$and": filterAnd}
        };
        if (groupByFields.length > 1) {
            payload.group = groupByFields;
        } else if (groupByFields.length === 1) {
            payload.group = [{"name": groupByFields[0]}];
        }
        var data = adaptor.executeQuery(payload) || {};
        if (groupByFields.length > 0) {
            return data.rows ? data.rows.length : 0;
        }
        return (data.rows && data.rows.length > 0) ? data.rows[0][0] : 0;
    }

    return {
        value: getScoreCount()
    };
}
