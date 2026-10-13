var RemoveManualServiceMenue = Class.create();
RemoveManualServiceMenue.prototype = {
	initialize: function() {
	},
	execute:function(){
		gs.log("Run 'EM - remove manual service menu for customers with no manual service");
		var gr= new GlideRecord("cmdb_ci_service_manual");
		gr.setLimit(1);
		gr.query();
		//no manual services  disable manual service menue
		if(!gr.next()){
			gs.log('no manual services- remove the menue item ');
			var grMenue=new GlideRecord("sys_app_module");
			grMenue.addQuery("name","cmdb_ci_service_manual");
			grMenue.query();
			while(grMenue.next()){
				gs.log('removing manual service menue item ');
				grMenue.active="false";
				grMenue.update();
			}
		}
	},
	
	type: 'RemoveManualServiceMenue'
};
