var gr = new GlideRecord("em_unique_nodes");
gr.addNotNullQuery("type");
gr.query();
if (gr.next()) { //if found records with type -> do not clear the table
	gs.log("Fix script 'Clear UniqueNodes table on upgrade to K' already ran. Existing...");
} else {
	//otherwise - delete all the records
	gs.log("Fix script 'Clear UniqueNodes table on upgrade to K' is running and deleting em_unique_nodes records");
	var md = new GlideMultipleDelete("em_unique_nodes");
	md.execute();
}
