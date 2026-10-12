(function executeRule(current, previous /*null when async*/) {

    if(!current.tour && !gs && !sn_tourbuilder)
		return;

	var tour = {};
	tour.tourId = current.tour.sys_id.toString();
	tour.tourName = current.tour.name.toString();
	tour.startPage = current.tour.context.toString();
	tour.userRoles = gs.getSession().getRoles();
   
	var api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
	api.send( tour, { operationType: current.operation() , eventType:'tour_details' } );


})(current, previous);
