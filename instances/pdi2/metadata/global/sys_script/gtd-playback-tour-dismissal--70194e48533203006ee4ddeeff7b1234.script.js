(function executeRule(current, previous /*null when async*/) {


	if( !current.tour && sn_tourbuilder )
		return;

	var gr = new GlideRecord('sys_embedded_tour_step'),
	tour = {}, i = 0;
	tour.tourId = current.tour.sys_id.toString();
	tour.tourName = current.tour.name.toString();
	tour.lastStep = current.last_step.toString();
	tour.startPage = current.tour.context.toString();
	
	gr.addQuery('guide.sys_id', tour.tourId);
	gr.orderBy('order');
	gr.query();

	//fetch the end page for specific tour.
	//Iterating through all the records due to multiple notations for step order.
	while( gr.next() ){
		if( i == tour.lastStep ){
			tour.endPage = gr.window.toString();
			break;
		}
		i++;
	}

	var api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
	api.send( tour, { operationType: current.operation(), eventType: 'tour_dismissal'} );

	tour = {};
	tour.tourId = current.tour.sys_id.toString();
	tour.tourName = current.tour.name.toString();
	tour.isAutolaunched = current.autolaunch.toString();
	tour.snCreated = current.tour.sn_created.toString();
	tour.tourEvent = 'dismissed';

	var gtHelper = new GuidedTourDesignerHelper();
	tour.experience = gtHelper.getExpNameofTour(current.tour.sys_id.toString());

	api.send(tour, {eventType: 'tour_executed'});

})(current, previous);
