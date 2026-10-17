var KMGenAISimilarTaskSearchUtil = Class.create();
KMGenAISimilarTaskSearchUtil.prototype = {
    initialize: function() {
    },

	calculateOrder: function (encodedQuery) {
        var orderMap = {};
        var taskIds = encodedQuery.split('sys_idIN'); //Remove begin params
        if (taskIds.length != 2)
            return null;
        taskIds = taskIds[1];
        taskIds = taskIds.split('^')[0]; //Remove end params
        var taskIdArr = taskIds.split(",");
        var order = 1;
        taskIdArr.forEach(function(taskId) {
            orderMap[taskId] = order;
            order++;
        });
        return orderMap;
    },

	getTasks: function (query, table, v_table) {
		query = query.split('^')[0];
		if(query == 'sys_idIN')
			return;
		var orderMap = this.calculateOrder(query);
		query = query+'^ORDERBYorder';
		var taskGr = new GlideRecordSecure(table);        
        taskGr.addEncodedQuery(query);
        taskGr.query();
        while (taskGr.next()) {
            var row = {};
            row.table = table;
            row.sys_id = taskGr.getUniqueValue();
            row.number = taskGr.getDisplayValue('number');
            row.description = taskGr.getDisplayValue('description');
            row.short_description = taskGr.getDisplayValue('short_description');
            row.close_notes = taskGr.getDisplayValue('close_notes');
            row.order = orderMap[taskGr.getUniqueValue()];
            v_table.addRow(row);
        }
	},

    type: 'KMGenAISimilarTaskSearchUtil'
};
