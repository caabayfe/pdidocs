gs.log("** Updating labels of ecc_agent_ext_context_metric in sys_db_object and in sys_documentation tables **");

	updateTables();

	gs.log("** Update finished **");


	function updateTables() {
	
		if (!updateDbObjectTable ())
			return;
			
		updateDocumentationTable ();
	
	}

	
	function updateDbObjectTable () {
		
		var TABLE_NAME = "sys_db_object";
		
		var table = new GlideRecord(TABLE_NAME);
		
		if (!table.isValid()) {
			gs.error("Invalid table: " + TABLE_NAME);
			return false;
		}
		
		table.addQuery("name", "ecc_agent_ext_context_metric");
		table.addQuery("label", "Operational Intelligence Metrics Context");
		table.query();
		
		if (table.next()) {
		
		 	gs.log ("Record found. Changing label in " + TABLE_NAME);		
			table.setValue("label", "Metric Intelligence Context");
			
			if (!table.update()) {
				gs.error("Could not update value of label field in " + TABLE_NAME );
				return false;
			}
		}
		
		return true;
	
	}
	
	
	function updateDocumentationTable () {
	
		var TABLE_NAME = "sys_documentation";
		
		var table = new GlideRecord(TABLE_NAME);
		
		if (!table.isValid()) {
			gs.error("Invalid table: " + TABLE_NAME);
			return false;
		}
		
		table.addQuery("name", "ecc_agent_ext_context_metric");
		table.addQuery("label", "Metric Intelligence Context");
		table.addNullQuery("element");
		table.query();
		
		if (table.next()) {
		
		 	gs.log ("Record found. Changing plural in " + TABLE_NAME);	
			table.setValue("plural", "Metric Intelligence Contexts");
			
			if (!table.update()) {
				gs.error("Could not update value of label field in " + TABLE_NAME );
				return false;
			}
		}
			
	}
