(function showPADashboardsolution_name9fdc1deedb16f200c42c5434ce9619eb() {


	var urlConfig = {
	  dashboardId:"aef982f3db8d87002ccf74b5ae9619a0",
	  tabId: "bcea1820dbd90700ee9e7bedae96193a"
	};
	var breakdownSourceId = "6cc8e0e53bb232001e68455353efc43c";
	var dashboarURL =  new global.MLSolutionHelper().getDashboardWithBreakdownUrl(urlConfig,breakdownSourceId,current);
  action.setRedirectURL(dashboarURL);
	
	var grTD = new GlideRecord('ml_trainer_definition'); grTD.addEncodedQuery('name=classification_trainer^sys_id=' + current.sys_id); 	grTD.query(); 
	if(grTD.hasNext()){
		g_form.setDisplay("Prediction Results", false);
	}
	g_form.setDisplay("Prediction Results", false);
	
})();
