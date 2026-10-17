		var tableName = "cmdb_ci_service_auto";
		var columnName = "number";
		var gr = new GlideRecord(tableName);
		if(gr.isValid()){
		gr.addNullQuery(columnName);
		gr.orderBy("sys_created_on");
		gr.query();
		while(gr.next()){
			var mgr = new NumberManager();
			gr.setValue(columnName, mgr.getNextNumber(tableName));
			gr.update();
		}}
