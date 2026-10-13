gs.info("Begin running fix script Change aggregation enabled description");
var gr = new GlideRecord("sys_properties");
gr.addQuery("name", "sa_analytics.aggregation_enabled");
gr.query();

if(gr.next()){
	if(gr.getValue("sys_updated_by") !== "admin"){
		gs.info("Skipping update of property sa_analytics.aggregation_enabled since it was changed by the customer");
	}
	else{
		gs.info("Attempting to change the description of property sa_analytics.aggregation_enabled");
		gr.setValue("description", "Enable alert aggregation for Automated, CMDB, Network traffic and Text based groups");
		if(gr.update()){
			gs.info("successfully changed the description of the property sa_analytics.aggregation_enabled to Enable alert aggregation for Automated, CMDB, Network traffic and Text based groups ");
		}
		else{
			gs.error("An error occurred when updating the description of the property sa_analytics.aggregation_enabled");
		}
	}
}
else{
	gs.info("The property sa_analytics.aggregation_enabled does not exist in the table sys_properties");
}
gs.info("Finished running the fix script Change aggregation enabled description");
