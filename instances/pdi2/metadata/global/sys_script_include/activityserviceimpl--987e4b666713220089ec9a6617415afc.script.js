var ActivityServiceImpl = Class.create();
ActivityServiceImpl.prototype = {
    initialize: function(activitySubContext) {
		this.activitySubContext = activitySubContext;
		this.activityDAO = activitySubContext.getActivityDAO();
		this.subscriptionDAO =  activitySubContext.getSubscriptionDAO();
		this.ACTIVITY_RATE_COUNT_LIMIT = 100;
		this.ACTIVITY_RATE_TIME_LIMIT = 36000;
    },

	getRelatedActivity: function(activityGr){
		return new global.ActivityDAO().getRelatedActivity(activityGr);
	},
	
	getActivitiesData: function(reqObj) {
		if(!reqObj) return {"status": 400, "message": gs.getMessage("Make sure to pass proper request parameters")};
		
		//If contextId is passed, get the activities based on context
		if(reqObj.contextId) {
			var activityContextService = this.activitySubContext.getService(ActivityConstants.ACTIVITY_CONTEXT_SERVICE);
			return activityContextService.getActivities(reqObj);
		}
		else { //If contextId is not passed, get the activities from activities or activity stream tables
			return this.getActivities(reqObj.profileId, reqObj.activity_count, reqObj.stream, reqObj.stFrom, reqObj.last, reqObj.before, reqObj.actor, reqObj.enableAggregation, reqObj.isFirstLoad);
		}
	},
	
    	getActivities: function(profileId, activity_count, stream, stFrom, last, before, actor, enableAggregation, isFirstLoad){
			var user = profileId || this.subscriptionDAO.getLiveProfileId();
			if(!user || !stream)
			return {"status":400,
			    "message":"Make sure a valid stream and user are passed",
			    "user":user,
			    "stream":stream};
			var results;
			var fanoutEnabled = this.activityDAO.isFanoutEnabled(stream);
			if(!fanoutEnabled || fanoutEnabled == 0){
				var reqParameters = {
					"countToReturn":activity_count,
					"liveProfileId":user,
					"streamId":stream,
					"enableAggregation":enableAggregation
				};
				if(!this.gatherActivities(reqParameters))//update stream table with latest activities
					gs.info('Unable to sync activities for the stream ' + stream);
				before = new GlideDateTime();
			}
			this.activityDAO.updateLastAccessTime(stream);
			results = this.activityDAO.getActivities(activity_count, stream, stFrom, last, before, actor, enableAggregation, isFirstLoad);
			return {"status":200,"data":results};
		},
	
	gatherActivities: function(reqParameters){
		if(!reqParameters.liveProfileId || !reqParameters.streamId)
			return false;
		var pullService = new ActivityStreamPullService(this.activitySubContext);
		if(!pullService.updateStreamWithLatestActivities(reqParameters))
			return false;
		return true;
	},
	
	initializeActivity: function(){
		var gr=this.activityDAO.initializeActivity();
		return gr;
	},
	createActivity: function(source, verb, isUndoActivity,activityGr, valueMap, module) {
		if(!source)
			return {"status":400,
					"message":"Make sure a valid source is passed",
					"source":source};
		if(this.isRateLimitReached() === true){
			return {"status":400,
					"message":"Create Activity Rate Limit is reached. Please try after sometime",
					"source":source};
		}
		if(this.activitySubContext.isPluginEnabled())
			this.activityDAO.createActivity(source, verb, isUndoActivity,activityGr, valueMap, module);
	},

	populateActivityStream: function(activity,subscribers,activityJSON, additionalAttributes){	
		if(!activity || !subscribers)
			return {"status":400,
					"message":"Make sure activity and subscribers are valid",
					"activity":activity,
					"subscribers":subscribers};

		this.activityDAO.populateActivityStream(activity,subscribers,activityJSON, additionalAttributes);
	},

	flushStreamCacheForSubscribers : function(subscribers) {
		if(!subscribers)
			return {"status":400,
					"message":"Make sure subscribers are valid",
					"subscribers":subscribers};
		this.activityDAO.flushStreamCacheForSubscribers(subscribers);
	},

	isActivityValid: function(content, profile_id, verb, isUndoActivity){
		if(this.activitySubContext.isCommunityPluginActive == true)
			return new sn_communities.CommunityActivityService().isActivityValid(content, profile_id, verb, isUndoActivity);
	},
	getFeedbackedMembers: function(content,verb){
		if(this.activitySubContext.isCommunityPluginActive == true)
			return new sn_communities.CommunityActivityService().getFeedbackedMembers(content,verb);
	},
	initiateFanout: function(current){
			this.activityDAO.initiateFanout(current);
	},
	isRateLimitReached: function(){
		var rateLimitCount = parseInt(gs.getProperty('com.snc.actsub.activity.rate.count.limit',this.ACTIVITY_RATE_COUNT_LIMIT));
		var rateLimitTime = parseInt(gs.getProperty('com.snc.actsub.activity.rate.time.limit',this.ACTIVITY_RATE_TIME_LIMIT));
		var lastNthActivityCrDate = this.activityDAO._getRecentNthActivityCrDt(rateLimitCount);
		if(lastNthActivityCrDate){
			var diffSeconds = Math.abs(parseInt(gs.dateDiff(gs.nowDateTime(), lastNthActivityCrDate, true)));
			if(diffSeconds <= rateLimitTime)
				return true;
		}
		return false;
	},

	getActivityInfo: function(activityId) {
		if(!activityId)
			return null;
		return this.activityDAO.getActivityInfo(activityId);
	},
	
	filterByFanoutFlag: function(subscribersList){
		return this.activityDAO.filterByFanoutFlag(subscribersList);
	},

	deleteInvalidRecords: function(){
		this.activityDAO.deleteInvalidRecords();
	},

	hasAccessToActivity: function(activity, operation) {
	    var hasRole = false;
	    if (operation === ActivityConstants.READ || operation === ActivityConstants.CREATE) {
	        hasRole = gs.hasRole('actsub_user') || gs.hasRole('actsub_admin')
	    } else {
	        hasRole = gs.hasRole('actsub_admin');
	    }
		if(hasRole) {
			return hasRole;
		}
		//Any user who has signed up and accepted the community Terms & Conditions
		if (pm.isActive('com.sn_communities') && gs.hasRole('sn_communities.community_user')) {
			return new sn_communities.CommunityActivityService().hasAccessToActivity(activity, operation);
		}
		return false;
	},

    hasAccessToActivityStream: function(operation, activityStream) {
		var activity = activityStream.activity_id;
		var userId = activityStream.stream_id.user_id.document;
        if (gs.hasRole('actsub_admin'))
            return true;
        if (pm.isActive('com.sn_communities') && gs.hasRole('sn_communities.community_user'))
            return new sn_communities.CommunityActivityService().hasAccessToActivity(activity, operation);
        if (gs.hasRole('actsub_user')){
			if(operation == ActivityConstants.CREATE)
				return true;
			return gs.getUserID() == userId;
		}
        return false;
    },
	type: 'ActivityServiceImpl'
};
