try{
	var actSubCtx = ActivitySubscriptionContext.getContext();
	var pullService = actSubCtx.getService( ActivityConstants.ACTIVITY_STREAM_PULL_SERVICE);
	if(!pullService.populateActivitiesForSubscriber(current, event.parm1))
		gs.error('ACTSUB-ERROR: Error while updating stream through event');
}
catch(e){
	gs.error('ACTSUB-ERROR: Error while updating stream through event ' + e.message);
}
