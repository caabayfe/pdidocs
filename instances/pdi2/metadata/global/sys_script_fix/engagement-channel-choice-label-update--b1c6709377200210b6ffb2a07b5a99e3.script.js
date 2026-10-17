var gr = new GlideRecord("sys_choice");
gr.addEncodedQuery("name=catalog_channel_analytics^element=engagement_channel^value=workspace^language=en");
gr.setWorkflow(false);
gr.setRunEngines(false);
gr.query();
while (gr.next()) {
	gr.setValue("label", "Service workspace portal");
	gr.update();
}
