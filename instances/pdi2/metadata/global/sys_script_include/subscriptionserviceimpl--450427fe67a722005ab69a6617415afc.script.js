var SubscriptionServiceImpl = Class.create();
SubscriptionServiceImpl.prototype = {
	initialize: function(activitySubContext) {
		this.activitySubContext = activitySubContext;
		this.activityDAO = activitySubContext.getActivityDAO();
		this.subscriptionDAO =  activitySubContext.getSubscriptionDAO();
		this.ADVANCED_A_LEVEL_ACTIVITY_TYPE="65c47eca531332003760ddeeff7b125c";
		this.SUB_OBJ_TOPIC = '17bd03c467103200ace49a6617415aed';
		this.BADGE_AWARDED_TYPE = "4dc9bef93b32320037556b4ee3efc4e3";
		this.USER_MENTIONED_VERB = "mentioned";
		this.SUBSCRIBER_ID;
	},

	subscribe: function(subObjTypeId,subObjId){
		if(this.activitySubContext.isCommunityPluginActive == true && subObjTypeId == this.SUB_OBJ_TOPIC && !sn_communities.CommunityConstants.ENABLE_TOPICS){
			return {"status":400,"message": "Object passed is not a subscribable object"};
		}
		var subscriberId;
		if(this.SUBSCRIBER_ID)
			subscriberId = this.subscriptionDAO.getLiveProfileId(this.SUBSCRIBER_ID);
		else
			subscriberId = this.subscriptionDAO.getLiveProfileId();
		if(!subObjTypeId || !subObjId || !subscriberId)
			return {"status":400,
					"message":"Make sure sub_obj_type, sub_obj_id and subscriber_id are valid",
					"subObjTypeId":subObjTypeId,
					"subObjId": subObjId,
					"subscriberId":subscriberId};
		try{
			var subObjInfo = this.subscriptionDAO.getSubscribableObjectInfo(subObjTypeId);
			if(!subObjInfo)
				return {"status":400,"message": "Object passed is not a subscribable object"};
			var subObjTableName = subObjInfo.table_name;
			var subscription  = this.isSubscribed(subObjId, subscriberId).subscriptionId;
			if(subscription)
				return {"status":400,"message": "User already subscribed to the given subscribable object"};

			//Create default stream if user doesn't have one
			var stream = this.subscriptionDAO.getUserStream(subscriberId);
			var streamId;
			if(!stream)
				streamId = this.subscriptionDAO.createUserStream(subscriberId);
			else
				streamId = stream.streamId;
			//subscribe
			this.subscriptionDAO.createSubscription(subObjTableName, subObjId, subObjTypeId, subscriberId, streamId);

		}catch(err){
			return {"status":500,"message":err.message};
		}

		return {"status":201,"message":"User is subscribed to the subscribable object"};
	},

	unsubscribe: function(subObjId, subscriber){
		var subscriberId = subscriber || this.subscriptionDAO.getLiveProfileId();
		if(!subObjId || !subscriberId)
			return {"status":400,"message":"Make sure sub_obj_id and subscriber_id are valid"};

		try{
			var retStatus = this.subscriptionDAO.deleteSubscription(subscriberId,subObjId);
			if(retStatus === 0)
				return {"status":200,"message":"User is unsubscribed to the subscribable object"};
			else
				return {"status":400,"message":"There is no subscription for this user for the given object"};
		}catch(err){
			return {"status":500,"message":err};
		}
	},
	/**
	*   This method allows to unsubscribe users
	*   from a give subscribable object
	*	Please use this method with caution as it deletes multiple
	*   subscription records
	**/
	unSubscribeUsers: function(sub_obj_id, users){
		var result;
		try{
			result = this.subscriptionDAO.unSubscribeUsers(sub_obj_id, users);
			if(result && result.unsubscribed_count && result.unsubscribed_count > 0){
				result.status = "202";
				result.message = "success";
			}else{
				result.status = "204";
				result.message = "No records found!";
			}
		}catch(err){
			result.status = "404";
			result.message = err.message;
		}
		result.users = users;
		return result;
	},

	subscribeUser: function(subObjTypeId, subObjId, subscribeUserId) {
		this.SUBSCRIBER_ID = subscribeUserId;
		return this.subscribe(subObjTypeId,subObjId);
	},

	subscribeUsers: function (subObjTypeId, subObjId, subscribeUserIds) {
		if (!subObjTypeId || !subObjId || !subscribeUserIds)
			return {
				"status": 400,
				"message": "Make sure subObjTypeId, subObjId, subscribeUserIds are valid",
				"subObjTypeId": subObjTypeId,
				"subObjId": subObjId,
				"subscribeUserIds": subscribeUserIds
			};
		try {
			var subObjInfo = this.subscriptionDAO.getSubscribableObjectInfo(subObjTypeId);
			if (!subObjInfo)
				return {
					"status": 400,
					"message": "Object passed is not a subscribable object"
				};
			var subObjTableName = subObjInfo.table_name;

			this.subscriptionDAO.subscribeUsers(subObjTableName, subObjId, subObjTypeId, subscribeUserIds);

		} catch (err) {
			return {
				"status": 500,
				"message": err.message
			};
		}

		return {
			"status": 201,
			"message": "Users are subscribed to the subscribable object"
		};
	},
	isSubscribed: function(objectId, subscriberId)
	{
		subscriberId = subscriberId || this.subscriptionDAO.getLiveProfileId();
		if(!objectId || !subscriberId)
			return {"status":400,"message":"make sure subscribable object and subsriber ids are valid",
					"objectId":objectId,
					"subscriberId":subscriberId};
		try{
			var retStatus = this.subscriptionDAO.isSubscribed(objectId, subscriberId);

			if(retStatus.subscriptionId)
				return {"status":201,"subscriptionId": retStatus.subscriptionId,"createdDate":retStatus.creationDate};
			else
				return {"status":201,"subscriptionId": null};
		}catch(err){
			return {"status":500,"message":err.message};
		}
	},

	getSubscriptionStatusForSubObjects: function(subObjectIds, subObjectType){
		try{
			if(gs.nil(subObjectIds)){
				return [];
			}
			var resultsData = this.activitySubContext.getSubscriptionDAO().getSubscriptionStatusForSubObjects(subObjectIds, subObjectType);
			return resultsData;
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},

	getLiveProfileId: function(userId){
		return this.subscriptionDAO.getLiveProfileId(userId);
	},
	createUserStream: function(profileId, streamName, fanoutToStream){
		try{
			var result = this.subscriptionDAO.createUserStream(profileId, streamName, fanoutToStream);
			if(result && !result.status){
				return {"streamId": result + '', "status": 201,"message": streamName + " stream is created", "fanout": fanoutToStream};
			}else if(result && result.status)
				return result;
			else{
				return {"status": 400,"message": "stream is not created"};
			}
		}catch(err){
			return {"status": 500,"message": err.message};
		}
	},
	getUserStream: function(profileId, streamName){
		var stream = this.subscriptionDAO.getUserStream(profileId, streamName);
		if(!stream){
			return {"status":400,"message":"Stream not found!",
					"profileId":profileId,"streamName":streamName};
		}
		return stream;
	},
	updateUserStream: function(profileId, streamName, fanoutToStream){
		try{
			var result = this.subscriptionDAO.updateUserStream(profileId, streamName, fanoutToStream);
			if(result && result.status)
				return result;
			if(result){
				result.status = 201;
				return result;
			}
		}catch(err){
			return {"status": 500,"message": err.message};
		}
	},
	isNotificationDisabled: function(activityType){
		if(activityType){
			var module = activityType.module;
			if(module){
				return module.disable_notifications;
			}
		}
		return false;
	},
	getSubscribers: function(current,activityType){
		//Check objects based on global preferences first
		//anything disabled at the global level will not be included in the list
		
		var topicTable = '';
		var topicsEnabled = false;
		if(this.activitySubContext.isCommunityPluginActive == true){
			topicTable = sn_communities.CommunityConstants.TOPIC_TABLE;
			topicsEnabled = sn_communities.CommunityConstants.ENABLE_TOPICS;
		}
		var objList = this.getSubObjList(current, topicTable, topicsEnabled);
		var subscribers;
		var i;
		var preferences;
		var authorSubscribed;
		var isFeedback;
		var authorProfileId;
		var authorUserId;
		try{
		if(this.activitySubContext.isCommunityPluginActive == true){
			isFeedback = new sn_communities.CommunityFeedback().getFeedbackTypeId(current.activity_type_id.verb);
			authorProfileId = current.object_id.content.profile;
		}
		if(objList && objList.additionalField1Id){
			//Check preference for least subscription first
			subscribers = this._getObjSubscribers(current.additional_field1,
												  current.additional_field1_name, current.actor_id, current.activity_type_id,
												  authorProfileId, isFeedback);
		}
		var objSubscribers;
		if(current.target_name == 'live_profile'
		   && activityType && activityType.fanout_to_target == true || activityType.sys_id==this.ADVANCED_A_LEVEL_ACTIVITY_TYPE && (!topicTable || (topicsEnabled || current.addl_sub_obj2_name != topicTable))){
			var targetProfile = this.subscriptionDAO.getLiveProfileRec(current.target_id);
			if(targetProfile)
				if(subscribers && subscribers.slice(-1)!=',')
					subscribers += "," +targetProfile.document;
				else if(subscribers)
					subscribers += targetProfile.document;
				else
					subscribers=targetProfile.document;
		}
		if(objList && objList.targetId){
			objSubscribers = this._getObjSubscribers(current.target_id,
													 current.target_name, current.actor_id, current.activity_type_id, 
													 authorProfileId, isFeedback);
			if(objSubscribers){
				if(subscribers)
					subscribers += "," + objSubscribers;
				else
					subscribers = objSubscribers;
			}
		}
		if(objList && objList.objectId){
			objSubscribers = this._getObjSubscribers(current.object_id,
													 current.object_name, current.actor_id, current.activity_type_id, 
													 authorProfileId, isFeedback);
			if(isFeedback && authorProfileId){
				authorSubscribed = this.isSubscribed(current.object_id, authorProfileId);
				if(authorSubscribed.subscriptionId)
					authorUserId = this._getAuthorBasedOnPreferences(current.object_name, authorProfileId, current.object_name);
				if(authorUserId)
					objSubscribers += "," + authorUserId;
			}
			if(objSubscribers){
				if(subscribers)
					subscribers += "," + objSubscribers;
				else
					subscribers = objSubscribers;
			}
		}
		if(objList && objList.additionalSubObj2Id){//Mostly specific object subscribers. later add an order field on ActivityType
			objSubscribers = this._getObjSubscribers(current.addl_sub_obj2,
													 current.addl_sub_obj2_name, current.actor_id, current.activity_type_id,
													 authorProfileId, isFeedback);
			if(isFeedback && authorProfileId){
				authorSubscribed = this.isSubscribed(current.addl_sub_obj2, authorProfileId);
				if(authorSubscribed.subscriptionId)
					authorUserId = this._getAuthorBasedOnPreferences(current.addl_sub_obj2_name, authorProfileId, current.object_name);
				if(authorUserId)
					objSubscribers += "," + authorUserId;
			}
			if(objSubscribers){
				if(subscribers)
					subscribers += "," + objSubscribers;
				else
					subscribers = objSubscribers;
			}
		}
		if(objList && objList.additionalSubObj3Id){//Mostly specific object subscribers. later add an order field on ActivityType
			objSubscribers = this._getObjSubscribers(current.addl_sub_obj3,
													 current.addl_sub_obj3_name, current.actor_id, current.activity_type_id, 
													 authorProfileId, isFeedback);
			if(objSubscribers){
				if(subscribers)
					subscribers += "," + objSubscribers;
				else
					subscribers = objSubscribers;
			}
		}
		if(objList && objList.actorId){
			objSubscribers = this._getObjSubscribers(current.actor_id,
													 current.actor_name, current.actor_id, current.activity_type_id);
			if(objSubscribers){
				if(subscribers)
					subscribers += "," + objSubscribers;
				else
					subscribers = objSubscribers;
			}
		}
		if(subscribers && subscribers.lastIndexOf(",") == (subscribers.length -1))
			subscribers = subscribers.substring(0,subscribers.length -1);//trim extra ',' from the end
		return subscribers;
		}catch(err){
			gs.info('ACTSUB:error:' + err.message);
		}
		
	},

	filterSubscribersByGlobalPreferences: function(userIds) {
		if(!userIds || userIds.length == 0)
			return;
		return this.subscriptionDAO.filterUsersByGlobalPreferences(userIds);
	},

	filterSubscribersByPreferences: function(subObjectName, activityTypeId, users){
		if (!subObjectName || !activityTypeId || !users)
			return [];

		var subscribers = [];
		users = this.filterSubscribersByGlobalPreferences(users);
		var subObjTypeId = this.subscriptionDAO.getSubObjByTableName(subObjectName);
		for(i=0 ; subObjTypeId && i < users.length; i++){
			try{
				if(this._getPreferences(users[i], subObjTypeId, activityTypeId))
					subscribers.push(users[i]);
			}catch(err){
				gs.info('ACTSUB:error:' + err.message);
			}
		}
		return subscribers;
	},

	_getObjSubscribers: function(subObjectId, subObjectName, actorId, activityTypeId, author, isFeedback){
		var subscribers='';
		var subObjectSubscribers = this.subscriptionDAO.getSubscribers(subObjectId, actorId, true, author, isFeedback);//checkNotifPreference=true
		var preferences;
		if(subObjectSubscribers){
			var subObjTypeId = this.subscriptionDAO.getSubObjByTableName(subObjectName);
			for(i=0 ; subObjTypeId && i<subObjectSubscribers.subProfIds.length;i++){
				try{
					if(this._getPreferences(subObjectSubscribers.subProfIds[i], subObjTypeId, activityTypeId))
						subscribers += subObjectSubscribers.subSysIds[i];
						if(i < subObjectSubscribers.subSysIds.length-1)
							subscribers += ',';
				}catch(err){
					gs.info('ACTSUB:error:' + err.message);
				}
			}
		}
		return subscribers;
	},
	_getAuthorBasedOnPreferences: function(subObjectName, authorLiveProfileId, objectName){
		var authorActivityType = this.activityDAO.getActivityType(objectName, "my_content_feedback");
		var subObjTypeId = this.subscriptionDAO.getSubObjByTableName(subObjectName);
		try{
			if(this._getPreferences(authorLiveProfileId, subObjTypeId, authorActivityType.sys_id)){
				return authorLiveProfileId.document;
			}
		}catch(err){
			gs.info('ACTSUB:error:' + err.message);
		}
	},
	_getPreferences: function(subObjectSubscriber, subObjTypeId, activityTypeId){
		var preference = this.subscriptionDAO.getPreferences(subObjectSubscriber, subObjTypeId, activityTypeId);
		try{
			if(preference.activities && preference.activities.length > 0
				&& (parseInt(preference.activities[0].pref_code.user_default) & 1))
				return true;
		}catch(err){
			gs.info('ACTSUB:error:' + err.message);
		}
		return false;
	},
	getSubObjList: function(current, topicTable, topicsEnabled){
		var prefMap = this.subscriptionDAO.getSubObjGlblPref(current);
		var objList = {};
		//Check for E-Mail global preference and add objects accordingly
		if(prefMap[current.actor_name] & 1 == 1){
			objList.actorId = current.actor_id + '';
		}
		if(prefMap[current.object_name] & 1 == 1){
			objList.objectId = current.object_id + '';
		}
		if(prefMap[current.target_name] & 1 == 1){
			objList.targetId = current.target_id + '';
		}
		if(current.additional_field1 && (prefMap[current.additional_field1_name] & 1 == 1) && (!topicTable || (topicsEnabled || current.additional_field1_name != topicTable))){
			objList.additionalField1Id = current.additional_field1 + '';
		}
		if(current.addl_sub_obj2 && (prefMap[current.addl_sub_obj2_name] & 1 == 1) && (!topicTable || (topicsEnabled || current.addl_sub_obj2_name != topicTable))){
			objList.additionalSubObj2Id = current.addl_sub_obj2 + '';
		}
		if(current.addl_sub_obj3 && (prefMap[current.addl_sub_obj3_name] & 1 == 1)){
			objList.additionalSubObj3Id = current.addl_sub_obj3 + '';
		}
		return objList;
	},
	getAllSubObjList: function(current, topicTable, topicsEnabled){
		var objList = '';
		if(current.activity_type_id.sys_id == this.BADGE_AWARDED_TYPE)
			objList =  current.object_id + ',' + current.target_id;
		else if(current.activity_type_id.verb != this.USER_MENTIONED_VERB)
			objList = current.actor_id + ',' + current.object_id + ',' + current.target_id;
		if(current.additional_field1 && (!topicTable || (topicsEnabled || current.additional_field1_name != topicTable)))
			objList += ',' + current.additional_field1;
		if(current.addl_sub_obj2 && (!topicTable || (topicsEnabled || current.addl_sub_obj2_name != topicTable)))
			objList += ',' + current.addl_sub_obj2;
		if(current.addl_sub_obj3)
			objList += ',' + current.addl_sub_obj3;
		return objList;
	},
	
	getAllSubscribers: function(current, activityType){
		var topicTable = '',
			topicsEnabled = false;
		var subObjs;
		
		if(this.activitySubContext.isCommunityPluginActive == true){
			topicTable = sn_communities.CommunityConstants.TOPIC_TABLE;
			topicsEnabled = sn_communities.CommunityConstants.ENABLE_TOPICS;
		}
		
		subObjs = this.getAllSubObjList(current, topicTable, topicsEnabled);
		
		var subscribers = this.subscriptionDAO.getSubscribers(subObjs);
		if(current.target_name == 'live_profile'
		   && activityType && activityType.fanout_to_target == true){
			var targetProfile = this.subscriptionDAO.getLiveProfileRec(current.target_id);
			if(targetProfile && subscribers && subscribers.subSysIds)
				subscribers.subSysIds.push(targetProfile.document);
			else if(targetProfile)
				subscribers.subSysIds = [targetProfile.document];
		}
		if(subscribers && subscribers.subSysIds){
			if(activityType.sys_id==this.ADVANCED_A_LEVEL_ACTIVITY_TYPE && (!topicTable || (topicsEnabled || current.addl_sub_obj2_name != topicTable))){
				var targetProfile = this.subscriptionDAO.getLiveProfileRec(current.target_id);
				var targetsys_id=''+targetProfile.document;
				var index = subscribers.subSysIds.indexOf(targetsys_id);
				if (index > -1)
					subscribers.subSysIds.splice(index, 1);
			}
			return new global.ArrayUtil().unique(subscribers.subSysIds).join(',');
		}
	},

	getActSubCounts: function(liveProfileId, onlyActCount, onlySubsCount){
		try{
			var resultsData = this.activitySubContext.getSubscriptionDAO().getActSubCounts(liveProfileId, onlyActCount, onlySubsCount);
			resultsData.status = '200';
			return resultsData;
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},
	getSubscriptionsBySubscriber: function(profile, subObjType, getList, orderBy, firstRow, lastRow, searchString){
		try{
			var resultsData = this.activitySubContext.getSubscriptionDAO().getSubscriptionsBySubscriber(profile, subObjType, getList, orderBy, firstRow, lastRow, searchString);
			resultsData.status = '200';
			return resultsData;
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},
	getSubscribersBySubscription: function(subObjId, subObjType, orderBy, firstRow, lastRow, searchString, fetchCount){
		try{
			var resultsData = this.activitySubContext.getSubscriptionDAO().getSubscribersBySubscription(subObjId, subObjType, orderBy,
																										firstRow, lastRow, searchString, fetchCount);
			resultsData.status = '200';
			return resultsData;
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},
	getFollowingsByFollower: function(profile, subObjType, orderBy, firstRow, lastRow, searchString){
		try{
			var resultsData = this.activitySubContext.getSubscriptionDAO().getFollowingsByFollower(profile, subObjType, orderBy, firstRow, lastRow, searchString);
			resultsData.status = '200';
			return resultsData;
		}catch(err){
			return {"status":"400","error":err.message};
		}

	},
	getSubscriptions: function(profile){
		return this.subscriptionDAO.getSubscriptions(profile);
	},

	getAllSubObjSubscribers: function(subObjId,actorId) {
		try{
			return this.subscriptionDAO.getSubscribers(subObjId,actorId, false).subSysIds;
		}catch(err){
		}
		return [];
	},

	getSubObjSubscribers: function(subObjId,actorId){
		try{
			var subscribers = this.subscriptionDAO.getSubscribers(subObjId,actorId, true).subSysIds;
			return {"status":'200',"subscribers": subscribers};
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},

	getSubscribableObjects: function(setupPref, module){
		try{
			var subObjects = this.subscriptionDAO.getSubscribableObjects(setupPref, module);
			return {"status":'200',"subObjects": subObjects};
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},
	getPreferences: function(profileId, subObject, activityTypeId){
		try{
			var preferences = this.subscriptionDAO.getPreferences(profileId, subObject, activityTypeId);
			return {status:'200',preferences: preferences};
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},
	updatePreferences: function(prefData){
		try{
			var result = this.subscriptionDAO.updatePreferences(prefData);
			if(result && result.length > 0)
				return {"status":'201',"message": 'Preferences updated successfully!', "result": result};
			return {"status":"200","message": 'Nothing to update!', "result": result};
		}catch(err){
			return {"status":"400","error":err.message};
		}
	},
	
	canFetchPreferences: function(profileId) {
		return this.subscriptionDAO.canFetchPreferences(profileId);
	},

    hasAccessToSubObjectStream: function(operation, subObjectStream) {
        var userId = subObjectStream.subscriber_id.document;
        if (gs.hasRole('actsub_admin'))
            return true;
        if (pm.isActive('com.sn_communities') && gs.hasRole('sn_communities.community_user')) {
            if (operation == ActivityConstants.READ && gs.getUserID() != userId)
                return false;
            if (operation == ActivityConstants.READ && subObjectStream.sub_obj_type == 'b4e6c9bc530132006242d7b08cc5879c') //do not check for meta subscriptions
                return true; //cannot assert security for non-community objects
            return new sn_communities.CommunityActivityService().hasAccessToSubscription(subObjectStream);
        }
        if (gs.hasRole('actsub_user')) {
            if (operation == ActivityConstants.CREATE)
                return true;
            return gs.getUserID() == userId;
        }
        return false;
    },

    COMMUNITY_MODULE_SYS_ID: 'abcb07e91473a700964f3805bcf69ffa',

    hasCommunityTypeAccessToSubObjectStream: function(subObjectStream) {
        if (!pm.isActive('com.sn_communities'))
            return false;
        if (!subObjectStream || !subObjectStream.sub_obj_type)
            return false;
        var moduleId = subObjectStream.sub_obj_type.module + '';
        if (!moduleId)
            return false;
        return moduleId == this.COMMUNITY_MODULE_SYS_ID;
    },

	type: 'SubscriptionServiceImpl'
};
