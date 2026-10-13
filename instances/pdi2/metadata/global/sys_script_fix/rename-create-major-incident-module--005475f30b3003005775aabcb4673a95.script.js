if(!GlidePluginManager.isZboot()) {
	var gr = new GlideRecord('sys_app_module');
	if(gr.get('2d653328c3122200b6dcdfdc64d3ae41'))
		GlideUpdateManager2().load('com.snc.best_practice.incident.jakarta', 'update.mim');
}
