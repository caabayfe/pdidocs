var dic = new GlideRecord("sys_dictionary");
dic.addQuery("name", "STARTSWITH", "sys_flow_log");
dic.addQuery("element", "context");
dic.query();

while (dic.next()) {
	gs.info("reference_cascade_rule of " + dic.getValue("name") + " before change is " + dic.getValue("reference_cascade_rule"));
	dic.setValue("reference_cascade_rule", "none");
	dic.setWorkflow(false);
	dic.update();
	gs.info("reference_cascade_rule of " + dic.getValue("name") + " after change is " + dic.getValue("reference_cascade_rule"));
}
