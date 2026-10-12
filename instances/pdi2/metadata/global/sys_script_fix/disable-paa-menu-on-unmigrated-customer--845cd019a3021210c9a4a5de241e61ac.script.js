var unifiedAnalytics = gs.getProperty("com.glide.par.unified_analytics.enabled");
if (unifiedAnalytics == null || unifiedAnalytics == 'false') {
   //disable all non-uxa menus
	var gr = new GlideRecord("sys_app_module");
	gr.addQuery("application.title","Platform Analytics Administration");
	gr.addQuery("sys_package.name","!=", "User Experience Analytics");
	gr.query();
    gr.active = false;
    gr.updateMultiple();


    //enable UXA menu
	var gr2 = new GlideRecord("sys_app_module");
	gr2.addQuery("sys_package.name","User Experience Analytics");
	gr2.addQuery("application.title","Platform Analytics Administration");
	gr2.query();
	gr2.active = true;
    gr2.updateMultiple();

}
