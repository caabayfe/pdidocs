// the pm.Zboot check is to skip the script on clean install
if (!pm.isZboot()) {
    var currentDateTime = new GlideDateTime(gs.nowNoTZ());
    gs.log("updateAlertsAfterUpgrade() Start Time: " + currentDateTime);
	
	var alertManager = new SNC.AlertManager();
	alertManager.updateAlertsAfterUpgrade();
	
	var endDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("updateAlertsAfterUpgrade() End Time: " + endDateTime);
	
	var timeDifference = GlideDateTime.subtract(currentDateTime, endDateTime).getDurationValue();
	gs.log("updateAlertsAfterUpgrade() Execution Time: " + timeDifference);
	
	currentDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("copySaAggQueryDataToNewTables() Start Time: " + currentDateTime);
	
	// in case of Geneva to Istanbul upgarde we need to move the groups from the old Geneva tables first
	copySaAggQueryDataToNewTables();
	
	endDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("copySaAggQueryDataToNewTables() End Time: " + endDateTime);
	
	timeDifference = GlideDateTime.subtract(currentDateTime, endDateTime).getDurationValue();
	gs.log("copySaAggQueryDataToNewTables() Execution Time: " + timeDifference);
	
	currentDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("createVirtualAlertGroup() Start Time: " + currentDateTime);
	
	// create virtual Alerts 
	var analyticsProcessor = new SNC.ServiceAnalyticsProcessor();
	var count = analyticsProcessor.createVirtualAlertGroup();
	gs.log("Created " + count + " virtual alerts");
	
	endDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("createVirtualAlertGroup() End Time: " + endDateTime);
	
	timeDifference = GlideDateTime.subtract(currentDateTime, endDateTime).getDurationValue();
	gs.log("createVirtualAlertGroup() Execution Time: " + timeDifference);
	
	//Delete all records from sa_agg_group_alert_staging
	currentDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("deleteFromSaAggGroupAlertStaging() Start Time: " + currentDateTime);
	
	deleteFromSaAggGroupAlertStaging();
	
	endDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("deleteFromSaAggGroupAlertStaging() End Time: " + endDateTime);
	
	timeDifference = GlideDateTime.subtract(currentDateTime, endDateTime).getDurationValue();
	gs.log("deleteFromSaAggGroupAlertStaging() Execution Time: " + timeDifference);
	
	// update Alert's one parent
	currentDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("updateOneParent() Start Time: " + currentDateTime);
	
	var alertManager = new SNC.AlertManager();
	alertManager.updateOneParent();
	
	endDateTime = new GlideDateTime(gs.nowNoTZ());
	gs.log("updateOneParent() End Time: " + endDateTime);
	
	timeDifference = GlideDateTime.subtract(currentDateTime, endDateTime).getDurationValue();
	gs.log("updateOneParent() Execution Time: " + timeDifference);
	
 }

	function deleteFromSaAggGroupAlertStaging() {
		var td = GlideTableDescriptor.get("sa_agg_group_alert_staging");
		if (td.isValid()) {
			var grStaging = new GlideRecord("sa_agg_group_alert_staging");
			grStaging.query();
			grStaging.deleteMultiple();	
		}
	}

	function copySaAggQueryDataToNewTables(){
	
		// check there is old table
		var td = GlideTableDescriptor.get("sa_agg_query");
		if (td.isValid()) {
		   
			var groupCount = 0;
			var newGroupCount = 0;
			var newAlertCount = 0;
			
			var grAgg = new GlideAggregate("sa_agg_query");
			grAgg.setWorkflow(false);
			grAgg.groupBy("group_id");
			grAgg.groupBy("window_start");
			grAgg.query();
			
			while (grAgg.next())
			{
				var grQuery = new GlideRecord("sa_agg_query");
				grQuery.addQuery("group_id", grAgg.getValue("group_id"));
				grQuery.addQuery("window_start", grAgg.getValue("window_start"));
				grQuery.orderBy("sys_created_on");
				grQuery.query();
			
				if (grQuery.hasNext())
				{
					var grGroup = new GlideRecord("em_agg_group");
					grGroup.initialize();
					grGroup.setValue("source", 1);		
					var groupSysid = grGroup.insert();
					var groupSystemTimeUpdated = false;
					
					while (grQuery.next())
					{
						if (!groupSystemTimeUpdated)
						{
								// copy the created and updated time
								grGroup.get(groupSysid);
								grGroup.setSystem(true);
								grGroup.setValue("sys_created_on", grQuery.getValue("sys_created_on"));
								grGroup.setValue("sys_updated_on", grQuery.getValue("sys_updated_on"));
								grGroup.update();
								
								groupSystemTimeUpdated = true;
						}
						
						var grGroupAlert = new GlideRecord("em_agg_group_alert");
						grGroupAlert.setWorkflow(false);
						grGroupAlert.initialize();
						grGroupAlert.setValue("alert_id", grQuery.getValue("alert_id"));
						grGroupAlert.setValue("group_id", groupSysid);
						grGroupAlert.setValue("system_generated", "true");
						grGroupAlert.setValue("active", "true");
						var groupAlertSysId = grGroupAlert.insert();
						
						// copy the created and updated time
						grGroupAlert.get(groupAlertSysId);
						grGroupAlert.setSystem(true);
						grGroupAlert.setValue("sys_created_on", grQuery.getValue("sys_created_on"));
						grGroupAlert.setValue("sys_updated_on", grQuery.getValue("sys_updated_on"));
						grGroupAlert.update();
						
						newAlertCount++;					
					}
					newGroupCount++;
				}
				groupCount++;
			}
			
			// Check if we copied all the rows over from sa_agg_query to em_agg_group_alert
			var alertCount = getRecordCount("sa_agg_query");
			
			gs.log("Records moved from sa_agg_query. AlertCount: " + alertCount + " Inserted: " + newAlertCount + " GroupCount:" + groupCount + " Inserted: " + newGroupCount);
			
			if (alertCount != newAlertCount || groupCount != newGroupCount)
			{
				gs.log(" Failed to insert data to new tables AlertCount: " + alertCount + " Inserted: " + newAlertCount + " GroupCount:" + groupCount + " Inserted: " + newGroupCount);
			}
			else
			{
				gs.log("Deleting data from sa_agg_query");
				grAgg.deleteMultiple();
				gs.log("Deleted data from sa_agg_query " + grAgg.count());
				
			}
		}
	}
	
	function getRecordCount(tableName){
		var ga = new GlideAggregate(tableName);
		ga.addAggregate("count", "sys_id");
		ga.setGroup(false);
		ga.setOrder(false);
		ga.query();
		
		var count = 0;
		
		if (ga.next()) {
			var countString = ga.getAggregate("count", "sys_id");
			if (countString != null && countString != "")  {
				count = parseInt(countString);
			}
		}
		
		return count;
	}
