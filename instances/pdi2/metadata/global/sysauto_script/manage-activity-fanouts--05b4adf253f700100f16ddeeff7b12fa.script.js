var actSubCtx = ActivitySubscriptionContext.getContext();
var pullService = actSubCtx.getService( ActivityConstants.ACTIVITY_STREAM_PULL_SERVICE);
pullService.updateInactiveStreams();
