gs.log("Run 'EM - disable RCA on BS related menus");
var EM_rca_configs = "3ad92c527f030200257d3f35bdfa916a";
var EM_rca_configs_compare = "a113f7b07f230200257d3f35bdfa9189";

var EM_rca_menus = [EM_rca_configs, EM_rca_configs_compare];
if (gs.getProperty('sa_analytics.rca_enabled','false') == 'false') {
	var sysAppGr = new GlideRecord("sys_app_module");
	sysAppGr.addQuery("sys_id", "IN", EM_rca_menus);
	sysAppGr.addActiveQuery();
	sysAppGr.query();
	while (sysAppGr.next()) {
		sysAppGr.setValue("active", false);
		sysAppGr.update();
		gs.log("Disabling '" + sysAppGr.sys_name + "' menu item since RCA on business services feature is disabled");
	}
}
gs.log("Finish Run 'EM - disable RCA on BS related menus");
