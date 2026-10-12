var actSubCtx = ActivitySubscriptionContext.getContext();
var activityService = actSubCtx.getService(ActivityConstants.ACTIVITY_SERVICE);
activityService.deleteInvalidRecords();
