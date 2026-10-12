var CMDBCountHelper = Class.create();
CMDBCountHelper.prototype = {
    initialize: function() {},
    getCICountsForClasses: function() {
        var count = new GlideAggregate("cmdb_ci");
        count.addAggregate("count", "sys_class_path");
        count.setCategory("cmdb_queries");
        count.query();
        var data = {};
		var className = "";
        while (count.next()) {
			className = this.getClassNameFromDBObject(count.getValue("sys_class_path"));
			if(className === null)
				continue;
            data[className] = parseInt(count.getAggregate("count", "sys_class_path"));
        }
        var stringified = JSON.stringify(data);
		/* update the CI Count to db */
		this.updateClassCount(stringified);
    },
	
	getClassNameFromDBObject: function(key) {
		var grDbObject = new GlideRecord("sys_db_object");
		grDbObject.addQuery("sys_class_path", key);
		grDbObject.query();
		while (grDbObject.next()) {
			var className = grDbObject.getValue("name");
			/* Exclude all classes which are not part of cmdb_ci hierarchy */
			var tableUtil = new TableUtils(className);
			if (tableUtil.getAbsoluteBase() == 'cmdb_ci') {
				return className;
			}
			
		}	
		return null;
	},
	updateClassCount: function(jsonData) {
		var gr = new GlideRecord("cmdb_job_context");
		// Add a query to filter matches wuth CMDBCI Hierarchy row
		gr.addQuery('key', 'cmdbCIClassHierarchy');
		gr.query();
		// Check if the record exists or create a new one
		if (gr.next()) {
			// Record exists, update it
			gr.setValue('json', jsonData);
			gr.update();
		} else {
			// Record does not exist, create a new one
			gr.initialize();
			gr.setValue('key', 'cmdbCIClassHierarchy');
			gr.setValue('json', jsonData);
			gr.insert();
		}
	},
    type: 'CMDBCountHelper'
};
