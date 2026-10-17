var ActivityStreamPullServiceImpl = Class.create();
ActivityStreamPullServiceImpl.prototype = {
    initialize: function(actSubContext) {
		this.activitySubContext = (actSubContext == null)?new ActivitySubscriptionContext():actSubContext;
		this.subscriptionDAO = this.activitySubContext.getSubscriptionDAO();
		this.activityDAO = this.activitySubContext.getActivityDAO();
		this.VERB_MENTIONED = "mentioned";
		this.pullEnabled = gs.getProperty('com.snc.actsub.activity.stream.inactive.disabled') == "true";
		this.DEFAULT_PULL_DAYS = 30;
		this.disableAfter = gs.getProperty('com.snc.actsub.activity.stream.inactive.duration', this.DEFAULT_PULL_DAYS);
		this.DEFAULT_ACTIVITY_COUNT_TO_RETURN = 10;
    },

	/*
	* This function fetches records from 'activities' table based on subsctiptions and updates the stream table
	* @parameter - subscriptions: user subscriptions based on which activities will be fetched
	* @parameter - streamGr: Glide record of stream that has to be updated with latest activities
	* @parameter - reqParameters: parameters from api request: userId, streamId, countToReturn, enableAggregation
	* @return - void
	*/
	updateStreamWithLatestActivities: function(reqParameters){
		try{
			//reqParameters - countToReturn, liveProfileId, streamId, enableAggregation
			if(!reqParameters.liveProfileId || !reqParameters.streamId)
				return false;
			var liveProfileId = reqParameters.liveProfileId;
			var liveProfileRecord = this.subscriptionDAO.getLiveProfileRec(liveProfileId);
			var streamId = reqParameters.streamId;
			var streamGr = this.activityDAO.getStreamRecord(streamId);
			if(!streamGr || !streamGr.next() || !liveProfileRecord)
				return false;
			var userId = liveProfileRecord.document + '';
			var subscriptionsList = this.subscriptionDAO.getSubscriptionsForStream(streamId);
			var subscriptions = subscriptionsList.join(',');
			if(!subscriptions)
				return true;
			var isAggregationEnabled = (reqParameters.enableAggregation)?reqParameters.enableAggregation:false;
			var countToReturn = (reqParameters.countToReturn)?reqParameters.countToReturn:this.DEFAULT_ACTIVITY_COUNT_TO_RETURN;
			//Get the latest activity and created time populated in the given stream
			var lastActivityGr = this.activityDAO.getLatestActivityForStream(streamId);
			var lastActivityTime = '';
			if(lastActivityGr.next()) {
				lastActivityTime = lastActivityGr.getValue('sys_created_on');
			}
			var multiplier = 2, currentRow = 0, counter = 0;
			var totalActivitiesToFetch = countToReturn * multiplier;
			var window ={};
			window.from = currentRow;
			window.to = totalActivitiesToFetch;
			var currentTime = new GlideDateTime();
			//get activities only till (n-1) second to handle concurrent activities pushed when pull is in progress
			currentTime.addSeconds(-1);
			var flagUpdateTime = this.activityDAO.updateFanoutToStream(streamId, true);
			if(!flagUpdateTime){
				gs.error('ACTSUB-ERROR: Error while setting fanout to stream flag : ' + streamId);
				return false;
			}
			var commActivityService = null;
			if (this.activitySubContext.isCommunityPluginActive == true)
				commActivityService = new sn_communities.CommunityActivityService(liveProfileId, true);
			while(counter < totalActivitiesToFetch){
				var activities = this.activityDAO.getActivitiesForInterval(subscriptions, liveProfileId, lastActivityTime, currentTime, window);
				var activities_query = activities.getEncodedQuery();
				var activityCount = activities.getRowCount();
				var aggregatedActivities = [];
				while(counter < totalActivitiesToFetch && currentRow < activityCount && activities.next()){
					currentRow++;
					this.validateAndPopulateToStream(activities, streamGr, userId);
					//if enableAggregation is true, pull more activities considering secondary content of same primary content as duplicate
					var duplicate = false;
					if(commActivityService != null && isAggregationEnabled){
						var aggAct = commActivityService.getContentInfo(activities);
						if (aggAct){
							primaryContent = aggAct.root + "";
							if(primaryContent && aggregatedActivities.indexOf(primaryContent) > -1)
								duplicate = true;
							else
								aggregatedActivities.push(primaryContent);

						}
					}
					if(!duplicate)
						counter++;
				}
				if(currentRow >= activityCount || activityCount == 0){
					break;
				}
				var remaining = parseInt(totalActivitiesToFetch - counter);
				var probabilityRatio = ((window.to - window.from)/(counter));
				window.from = currentRow;
				window.to = currentRow + this.getInterprettedOffset(remaining, probabilityRatio);
			}
			if(activityCount > totalActivitiesToFetch){
				var streamLimit = gs.getProperty(ActivityConstants.USER_STREAM_LIMIT, this.activityDAO.USER_STREAM_LIMIT);
				this.populateActivitiesForStreamAsync(currentRow, streamLimit, activities_query, streamGr);
			}
			this.updateNthSecondActivities(subscriptions, streamGr, liveProfileId, currentTime, flagUpdateTime);
			return true;
		}
		catch(er){
			this.activityDAO.updateFanoutToStream(streamGr.getValue('sys_id'), false);
			gs.error('ACTSUB-ERROR: Error while updating stream with lastest activities: ' + er.message);
			return false;
		}
	},
	
	updateNthSecondActivities: function(subscriptions, streamGr, liveProfileId, fromTime, toTime){
		if(!subscriptions || !streamGr || !liveProfileId)
			return;
		var activities = this.activityDAO.getActivitiesForInterval(subscriptions, liveProfileId, fromTime, toTime);
		if(!activities || !streamGr.user_id)
			return;
		var userId = streamGr.user_id.document + '';
		while(activities.next()){
			this.validateAndPopulateToStream(activities, streamGr, userId);
		}
	},
	
	populateActivitiesForSubscriber: function(streamGr, eventParam){
		if(!streamGr || !eventParam)
			return false;
		try{
			var obj = JSON.parse(eventParam);
			var window = {};
			window.from = obj.from;
			window.to = obj.to;
			var activities = this.activityDAO.getActivitiesFromEncodedQuery(obj.query, window);
			var streamId = streamGr.getUniqueValue();
			var userId = streamGr.user_id.document + '';
			while(activities.next()){
				this.validateAndPopulateToStream(activities, streamGr, userId);
			}
		}
		catch(er){
			gs.error('ACTSUB-ERROR: Error while populating activities asynchronously: ' + er.message);
			return false;
		}
	},
	
	populateActivitiesForStreamAsync: function(from, to, activities_query, streamGr){
		//creating a json string to pass to event
		//json constains 'from' and 'to' indices to choose window and activities_query
		if(!streamGr)
			return;
		var parser = new JSON();
		var activityDetails = {};
		activityDetails.from = from;
		activityDetails.to = to;
		activityDetails.query = activities_query;
		var jsonEventParameter = parser.encode(activityDetails);
		gs.eventQueue('sn_actsub.activities_fanout_to_stream', streamGr, jsonEventParameter);
	},
	
	validateAndPopulateToStream: function(activities, streamGr, userId){
		if(!activities || !streamGr || !userId || !activities.activity_type_id)
			return;
		if(!activities.activity_type_id.active || !activities.activity_type_id.fanout_to_stream)
			return;
		var commUser = null, commActivityServiceBase = null;
		if (this.activitySubContext.isCommunityPluginActive == true) {
			commUser = new sn_communities.CommunityUserBase();
			commActivityServiceBase = new sn_communities.CommunityActivityServiceBase();
		}
		if(commActivityServiceBase != null && !commActivityServiceBase.hasAccessToActivity(activities, 'read', userId, commUser))
			return;
		if(commActivityServiceBase == null && !activities.canRead())
			return;
		var objectIds = this.getSubscribableObjectIdsForActivity(activities);
		if(this.canPopulateToStream(activities, streamGr.user_id + '', streamGr, objectIds)){
				this.activityDAO.populateActivityStream(activities, userId);
		}
	},
	
	getSubscribableObjectIdsForActivity: function(activities){
		var objectIds = [];
		if(!activities)
			return objectIds;
		if(activities.object_id)
			objectIds.push(activities.object_id);
		if(activities.target_id)
			objectIds.push(activities.target_id);
		if(activities.additional_field1)
			objectIds.push(activities.additional_field1);
		if(activities.addl_sub_obj2)
			objectIds.push(activities.addl_sub_obj2);
		if(activities.addl_sub_obj3)
			objectIds.push(activities.addl_sub_obj3);
		if(activities.actor_id)
			objectIds.push(activities.actor_id);
		return objectIds;
	},
	
	canPopulateToStream: function(activities, liveProfileId, streamGr, objectIds){
		if(!activities || !streamGr || !liveProfileId || ! objectIds)
			return false;
		var followingUsers = this.subscriptionDAO.getFollowedUsersByProfile(liveProfileId);
		var activity_json = {}, followees = [];
		var hasSubscribedBeforeActivity = this.subscriptionDAO.hasSubscribedBeforeActivityDate(streamGr.getValue('sys_id'), objectIds, activities.getValue('sys_created_on'));
		if(activities.getValue('target_id') == liveProfileId){
			if(activities.activity_type_id && activities.activity_type_id.fanout_to_target + '' == 'true')
				return true;//populate gamification activities
		}
		else if(activities.verb == this.VERB_MENTIONED){
			var mentionedUsers = activities.additional_field1 ? activities.additional_field1 + '' : '';
			var mentionedFollowingUser = false;
			var mentionedThisUser = false;
			if(mentionedUsers && mentionedUsers.indexOf(liveProfileId) > -1){
				mentionedThisUser = true;
			}
			if(activities.actor_id == liveProfileId || mentionedThisUser)
				return true;
			var mentionedUsersList = mentionedUsers.split(',');
			for(var i=0;i<mentionedUsersList.length;i++){
				var id = mentionedUsersList[i];
				var index = followingUsers.indexOf(id);
				if(index > -1){
					mentionedFollowingUser = true;
					followees.push(id);
				}
			}
			if(mentionedFollowingUser && hasSubscribedBeforeActivity){
				activity_json = {
					"message": activities.activity_type_id.activity_nl_string.message+'',
					"actor": activities.getElement('actor_id').getRefRecord().getDisplayValue(),
					"object": activities.getElement('object_id').getRefRecord().getDisplayValue(),
					"target": activities.getElement('target_id').getRefRecord().getDisplayValue(),
					"followees": followees
				};
				this.activityDAO.populateActivityStream(activities, streamGr.user_id.document + '', activity_json);
			}
			return false;
		}
		else if(followingUsers && followingUsers.indexOf(activities.getValue('actor_id')) > -1){
			if(hasSubscribedBeforeActivity)
				return true;//populate stream for following users
		}
		else if(hasSubscribedBeforeActivity){
			return true;
		}
		return false;
	},
	
	updateInactiveStreams: function(){
		try{
			var pullStreamTypes = gs.getProperty('com.snc.actsub.activity.stream.inactive.streams');
			if(this.pullEnabled){
				var currentDate = new GlideDateTime();
				var duration = -1*this.disableAfter;
				currentDate.addDaysUTC(duration);
				this.activityDAO.resetFanoutForInactiveStreams(pullStreamTypes, currentDate);
			}
			else{
				var streamGr = this.activityDAO.getInactiveStreams(pullStreamTypes);
				if(streamGr){
					while(streamGr.next()){
						var reqParameters = {
							"liveProfileId":streamGr.getValue('user_id'),
							"streamId":streamGr.getValue('sys_id')
						};
						if(!this.updateStreamWithLatestActivities(reqParameters)){
							gs.error('ACTSUB-ERROR: Updating activities failed for stream ' + streamGr.sys_id);
						}
						else{
							this.activityDAO.updateFanoutToStream(streamGr.getValue('sys_id'), true);
						}
					}
				}
			}
		}
		catch(er){
			gs.error('ACTSUB-ERROR: Error while updating activity fanout flag: ' + er.message);
		}
	},
	
	getInterprettedOffset: function(requiredCount, probabilityRatio) {
		var multiplier = 5;
		var offset = requiredCount * multiplier;
		if (probabilityRatio && probabilityRatio > multiplier)
			offset = requiredCount * probabilityRatio;
		if (offset > multiplier * 100)
			offset = multiplier * 100;
		return offset;
	},

    hasAccessToUserStream: function(userStream) {
        var userId = userStream.user_id.document;
        if (gs.hasRole('actsub_admin'))
            return true;
        if (pm.isActive('com.sn_communities') && gs.hasRole('sn_communities.community_user') || gs.hasRole('actsub_user'))
            return gs.getUserID() == userId; //allows current user to access only their record
        return false;
    },

    type: 'ActivityStreamPullServiceImpl'
};
