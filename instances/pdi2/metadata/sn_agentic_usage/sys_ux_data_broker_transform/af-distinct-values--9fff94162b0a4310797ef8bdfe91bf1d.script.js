function transform(input) {
    var serviceName = (input && input.serviceName) || "glide";
    var metricName  = (input && input.metricName)  || "sn.glide.action_fabric.record_action";
    var startTime   = (input && input.startTime)   || "P1M";
    var attribute   = (input && input.attribute)   || "StringAttributes.sn.glide.action_fabric.table_name";
    var numberOfGroups = parseInt((input && input.numberOfGroups) || 50, 10);
    var filterConfigurations = (input && input.filterConfigurations) || "[]";

    var adaptor = new sn_agentic_usage.TelemetryQueryAdaptorActionFabric();
    var alias = attribute.replace(/\./g, "__");

    var parsedFilters = (typeof filterConfigurations === 'string')
        ? JSON.parse(filterConfigurations || '[]') : (filterConfigurations || []);

    // Exclude this facet's own filter from the query that builds its own option
    // list — otherwise picking a value collapses the list down to just that
    // value (querying "distinct table_name WHERE table_name = <selection>").
    // Other active filters (e.g. MCP Client) should still narrow the results.
    var otherFilters = parsedFilters.filter(function(f) {
        return !(f.apply_to && f.apply_to[0] && f.apply_to[0].payload &&
                 f.apply_to[0].payload.observability === attribute);
    });

    var filterAnd = adaptor.buildFilterAnd(serviceName, metricName, startTime, otherFilters);

    var projectionGroupBy = {};
    projectionGroupBy[attribute] = alias;
    var sumProj = adaptor.buildSumProjection();
    var countKey = sumProj.alias;
    var sumOrder = {}; sumOrder[countKey] = "desc";

    var payload = {
        "type": "telemetry_counter",
        "projection": [projectionGroupBy, sumProj],
        "group": [{"name": alias, "others": false, "max_groups": numberOfGroups}],
        "filter": {"$and": filterAnd},
        "order": [sumOrder]
    };

    var queryResult = adaptor.executeQuery(payload);
    var responses   = adaptor.adaptResponse(queryResult, 0);
    var data = responses[0] || {};

    // Just return simple array of table names
    var result = [];
    if (data.response && data.response.metadata && data.response.metadata.groupBy) {
        var elements = data.response.metadata.groupBy[0].elements || [];

        for (var j = 0; j < elements.length; j++) {
            var val = elements[j].id;
            if (val && val !== "") {
                result.push(val);
            }
        }
    }

    return result;  // Just ["sys_attachment", "cmdb_ci_function_ai", ...]
}
