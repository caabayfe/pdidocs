(function executeRule(current, previous /*null when async*/) {

	if(!current.tour || !gs || !sn_tourbuilder)
		return;

	var tour = {};
	var payload_id = gs.generateGUID();
	tour.payloadId = payload_id;
	tour.application = current.application.name.toString();
	tour.reason = current.reason.toString();
	tour.matchedRoles = current.matched_roles.toString();
	tour.tourId = current.tour.sys_id.toString();

	var gr = new GlideRecord('sys_embedded_tour_step');
	gr.addEncodedQuery('guide.sys_id='+tour.tourId);
	gr.orderBy('order');
	gr.chooseWindow(tour.lastStep, parseInt(tour.lastStep)+1);
	gr.query();
	if(gr.next()){
		tour.endPage = gr.window.toString();
	}

	//STRY10051612 : LU&A : Reduce custom key metrics to 5
	var api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
	api.send( tour, { operationType: current.operation() , eventType: 'tour_' + current.last_status.toString() + '_part1' } );

	tour = {};
	tour.payloadId = payload_id;
	tour.lastStep = current.last_step.toString();
	tour.startPage = current.tour.context.toString();
	tour.endPage = "";

	api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
	api.send( tour, { operationType: current.operation() , eventType: 'tour_' + current.last_status.toString() + '_part2' } );

	tour = {};
	tour.tourId = current.tour.sys_id.toString();
	tour.tourName = current.tour.name.toString();
	tour.isAutolaunched = current.autolaunch.toString();
	tour.snCreated = current.tour.sn_created.toString();
	tour.tourEvent = current.last_status.toString();

	var gtHelper = new GuidedTourDesignerHelper();
	tour.experience = gtHelper.getExpNameofTour(tour.tourId);

	api.send(tour, {eventType: 'tour_executed'});


})(current, previous);
