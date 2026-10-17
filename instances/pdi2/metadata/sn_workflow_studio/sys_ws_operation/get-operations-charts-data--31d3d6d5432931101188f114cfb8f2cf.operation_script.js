(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	function getData(col, dateField) {
        var data = [];
        var agg = new GlideAggregate(table);
        agg.addAggregate('count', col);
        agg.addEncodedQuery(dateField + 'ONThis%20month@javascript:gs.beginningOfThisMonth()@javascript:gs.endOfThisMonth()');
        agg.orderByAggregate('count', col);
        agg.query();

        while (agg.next()) {
            var name = agg[col].toString();
            var count = parseInt(agg.getAggregate('count', col));
            data.push({ 'name': name, 'count': count });
        }
        
        return data;
    }
    
    var outputData = {
        executions: [],
        states: []
    };
    
    var table = request.queryParams.table.toString();
    var canRead = (function () {
        var gr = new GlideRecord(table);
        return gr.canRead();
    })();
    
    if (!canRead) {
        return outputData;
    }
    
    outputData.states = getData('state', 'sys_updated_on');
    outputData.executions = getData('name', 'sys_created_on');
    
    return outputData;
    
})(request, response);
