var gr = new GlideRecord("sys_dictionary");
gr.addEncodedQuery("name=help_guidance^ORname=help_content^element=version");
gr.query();
while(gr.next()) {
	gr.setValue("default_value" , "javascript:new SNHelpUtil().getCurrentVersion()");
	gr.update();
}
