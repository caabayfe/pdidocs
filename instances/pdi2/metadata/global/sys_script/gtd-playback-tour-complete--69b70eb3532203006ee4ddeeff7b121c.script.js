(function executeRule(current, previous /*null when async*/) {

    if(!current.tour && !sn_tourbuilder)
		return;

	var ga = new GlideAggregate('sys_embedded_tour_step'),
	tour= {};
	tour.tourId = current.tour.sys_id.toString();
	tour.startPage = current.tour.context.toString();
    tour.tourName = current.tour.name.toString();
    
	ga.addAggregate('COUNT','guide');
	ga.addAggregate('count(distinct','window');
	ga.addQuery('guide.sys_id', tour.tourId);
	ga.query();

	if( ga.hasNext() ){
	   ga.next();
	   tour.stepCount = ga.getAggregate('count','guide');
	   tour.pageCount = ga.getAggregate('count(distinct','window');
	}

	var api = new sn_tourbuilder.GTPlatformAnalyticsAPI();
	api.send(tour, {operationType: current.operation(), eventType: 'tour_complete'});

	tour = {};
	tour.tourId = current.tour.sys_id.toString();
	tour.tourName = current.tour.name.toString();
	tour.isAutolaunched = current.autolaunch.toString();
	tour.snCreated = current.tour.sn_created.toString();
	tour.tourEvent = 'completed';

	var gtHelper = new GuidedTourDesignerHelper();
	tour.experience = gtHelper.getExpNameofTour(tour.tourId);

	api.send(tour, {eventType: 'tour_executed'});


})(current, previous);
