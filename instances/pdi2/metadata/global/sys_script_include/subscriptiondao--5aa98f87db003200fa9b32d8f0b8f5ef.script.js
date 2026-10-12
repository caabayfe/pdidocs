var SubscriptionDAO = Class.create();
SubscriptionDAO.prototype = {
	initialize: function(activitySubContext) {
		this.activitySubContext = activitySubContext;
		this.Results =  [];
		this.SUBSCRIPTIONS_TABLE = "sn_actsub_subobject_stream";
		this.SUB_OBJ_TABLE = "sn_actsub_subscribable_object";
		this.SUB_OBJ_NOTIF_PREF = "sn_actsub_atype_notif_pref";
		this.ACTIVITY_USER_STREAM = "sn_actsub_user_stream";
		this.ACTIVITY_TYPE_PREF = 'sn_actsub_atype_notif_pref';
		this.SUB_NOTIF_PREF = 'sn_actsub_subscription_notif_pref';
		this.SUB_META_OBJ_SYS_ID = 'b4e6c9bc530132006242d7b08cc5879c';
		this.DEFAULT_STREAM = 'Default';
		this.SUB_OBJ_KB = '722d67c367003200d358bb2d07415a9c';
		this.SUB_OBJ_KA = '7d8f537453003200fa9bd7b08cc5872c';
		this.SUB_OBJ_LIVE_PROFILE = '46f9d003db723200624273c8f0b8f54c';
		this.SUB_OBJ_FORUM = '6cbd03c467103200ace49a6617415ac4';
		this.SUB_OBJ_TOPIC = '17bd03c467103200ace49a6617415aed';
		this.SUB_OBJ_IDEA = '62d8370577407300d82ea3334a1061e2';
		this.COMMUNITY_MODULE='abcb07e91473a700964f3805bcf69ffa'
		this.MAX_PAGE_SIZE = 15;
		this.GLOBAL_NOTIF_PREF_ENABLE_VAL = 2;
		if(this.activitySubContext.isCommunityPluginActive == true){
			this.enableACL = {};
			this.enableACL[sn_communities.CommunityConstants.QUESTION_CONTENT_TYPE_ID] = gs.getProperty('sn_communities.search.discussion.enable_acl') === 'true' ? true : false;
			this.enableACL[sn_communities.CommunityConstants.BLOG_CONTENT_TYPE_ID] = gs.getProperty('sn_communities.search.blog.enable_acl') === 'true' ? true : false;
			this.enableACL[sn_communities.CommunityConstants.DOCUMENT_CONTENT_TYPE_ID] = gs.getProperty('sn_communities.search.document.enable_acl') === 'true' ? true : false;
			this.enableACL[sn_communities.CommunityConstants.EVENT_CONTENT_TYPE_ID] = gs.getProperty('sn_communities.search.event.enable_acl') === 'true' ? true : false;
			this.enableACL[sn_communities.CommunityConstants.VIDEO_CONTENT_TYPE_ID] = gs.getProperty('sn_communities.search.video.enable_acl') === 'true' ? true : false;
			this.SYS_ATTACHMENT = "sys_attachment";
			this.IMAGE_URL = "/sys_attachment.do?sys_id=";
			this.IIX_EXTN = ".iix";
		}
		this.NOTIF_OBJ_TABLE = "sn_actsub_notif_object";
	},
	
	createSubscription: function(subObjName, subObjId, subObjTypeId, subscriberId, streamId){
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.initialize();
		gr.sub_obj_name = '' + subObjName;
		gr.sub_obj_id = '' + subObjId;
		gr.sub_obj_type = '' + subObjTypeId;
		gr.subscriber_id = '' + subscriberId;
		if(streamId)
			gr.stream_id = '' + streamId;
		else{
			streamId = this._getDefaultStreamId(subscriberId);
			gr.stream_id = '' + streamId;
		}
		gr.insert();
		return gr.sys_id + '';
	},

	deleteSubscription: function(subscriberId, subObjId){
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('sub_obj_id',subObjId);
		gr.addQuery('subscriber_id',subscriberId);
		gr.query();
		if(gr.next()){
			if(this.activitySubContext.isCommunityPluginActive == true && gr.sub_obj_type == this.SUB_OBJ_TOPIC && !sn_communities.CommunityConstants.ENABLE_TOPICS){
				return 1;
			}
			gr.deleteRecord();
			return 0;
		}
	},
	/**
	*   This method allows to unsubscribe users
	*   from a give subscribable object
	*	Please use this method with caution as it deletes multiple
	*   subscription records
	**/
	unSubscribeUsers: function(sub_obj_id, users){
		var result = {};
		if(sub_obj_id){
			var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
			gr.addQuery('sub_obj_id', sub_obj_id);
			if(users) {
				var liveProfileIDs = this.getLiveProfileIDs(users);
				gr.addQuery('subscriber_id', "IN", liveProfileIDs);
			}
			gr.deleteMultiple();
			result.unsubscribed_count = gr.getRowCount();
		}
		return result;
	},

	/**
	 *   This method allows a set of users to subscribe
	 *   from a give subscribable object
	 *
	 **/
	subscribeUsers: function (subObjTableName, subObjId, subObjTypeId, subscribersIds) {
		var result = [],
			len = 0;
		try {
			var users = this.getLiveProfileIDs(subscribersIds);
			if (subObjId && users) {
				users = users.split(',');
				users = this.filterOutSubscribedUsers(subObjId,users);
				len = users.length - 1;
				while (len >= 0) {
					result.push(this.createSubscription(subObjTableName, subObjId, subObjTypeId, users[len]));
					len--;
				}
			}
		} catch (exception) {
			gs.info('An errors occured while creating subscriptions in SubscriptionDAO.subscribeUsers ' + exception);
			return result;
		}
		return result;
	},

	isSubscribed: function(objectId, subscriberId)
	{
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('sub_obj_id',objectId);
		gr.addQuery('subscriber_id',subscriberId);
		gr.query();
		var retStatus = {};
		if(gr.next()){
			retStatus.subscriptionId = gr.sys_id + '';
			retStatus.creationDate = gr.sys_created_on + '';
		}
		return retStatus;
	},

	/**
	*   This method takes in comma seperated value subObjectIds and a subObjectType
	*   returns subcription status for those subscribable objects.
	*   Returns a boolean array with each flag saying whether
	*   corresponding subobect in the subObjectIds is subcribed
	**/
	getSubscriptionStatusForSubObjects: function(subObjectIds, subObjectType){
		var subscriberId = this.getLiveProfileId();
		var subscriptionStatusListOfSubObjectIds = [];
		if(gs.nil(subscriberId) || gs.nil(subObjectIds)){
			return subscriptionStatusListOfSubObjectIds;
		}
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('sub_obj_id','IN', subObjectIds);
		gr.addQuery('subscriber_id',subscriberId);
		if(subObjectType)
			gr.addQuery('sub_obj_type',subObjectType);
		gr.query();
		var subscriptionStatusMap = {};
		while(gr.next()){
			subscriptionStatusMap[gr.sub_obj_id+''] = true;
		}
		var subObjectIdList = subObjectIds.split(",");
		subObjectIdList.forEach(function(subObjectId){
			if(gs.nil(subObjectId+'')){
				subscriptionStatusListOfSubObjectIds.push(false);
				return;
			}
			var isSubscribed = false;
			if(subscriptionStatusMap[subObjectId + '']){
				isSubscribed = true;
			}
			subscriptionStatusListOfSubObjectIds.push(isSubscribed);
		});
		return subscriptionStatusListOfSubObjectIds;
	},

	filterOutSubscribedUsers: function(objectId, users)
	{
		var subscribers = [];
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('sub_obj_id',objectId);
		gr.addQuery('subscriber_id','IN',users);
		gr.query();
		while(gr.next()){
			subscribers.push(gr.getValue('subscriber_id'));
		}
		return new ArrayUtil().diff(users,subscribers);
	},

	getUserStream: function(profileId, streamName, skipCreation){
		var userStream = new GlideRecord(this.ACTIVITY_USER_STREAM);
		streamName = streamName || this.DEFAULT_STREAM;
		userStream.addQuery('name',streamName);
		userStream.addQuery('user_id',profileId);
		userStream.query();

		if(userStream.next())
			return {"streamId":userStream.sys_id + '',"name":userStream.name + '',
					"fanout_to_stream":userStream.fanout_to_stream == true,"is_user_stream":userStream.is_user_stream + ''};
		if(skipCreation)
			return;
		else{
			var streamId = this.createUserStream(profileId);//Create default stream if not present
			return {"streamId":streamId + '',"name":this.DEFAULT_STREAM,
					"fanout_to_stream": true, "is_user_stream": false};
		}

	},
	_getUsersWithFanoutDisabled: function(profileIDs, streamName){
		var profileList;
		if(profileIDs && profileIDs.length > 0){
			profileList = new global.ArrayUtil().unique(profileIDs).join(',');
		}
		var userStream = new GlideRecord(this.ACTIVITY_USER_STREAM);
		streamName = streamName || this.DEFAULT_STREAM;
		userStream.addQuery('name',streamName);
		userStream.addQuery('user_id', 'IN', profileList);
		userStream.addQuery('fanout_to_stream', false);		
		userStream.query();

		var users = [];
		while(userStream.next()){
			users.push(userStream.user_id + '');
		}
		return users;
	},
	_getDefaultStreamId: function(profileId){
		var defaultStream = this.getUserStream(profileId, this.DEFAULT_STREAM);
		if(defaultStream)
			return defaultStream.streamId;
	},
	createUserStream: function(profileId, streamName, fanoutToStream){
		var result = this.getUserStream(profileId, streamName, true);
		if(result)
			return {"status": 400, "message": "stream already exists"};
		var userStream = new GlideRecord(this.ACTIVITY_USER_STREAM);
		userStream.initialize();
		userStream.name = streamName || this.DEFAULT_STREAM;
		userStream.user_id = profileId;
		if(fanoutToStream == false)
			userStream.fanout_to_stream = false;
		else
			userStream.fanout_to_stream = true;
		userStream.setValue('last_accessed_on', new GlideDateTime());
		userStream.insert();
		return userStream.sys_id;
	},
	updateUserStream: function(profileId, streamName, fanoutToStream){
		var userStream = new GlideRecord(this.ACTIVITY_USER_STREAM);
		streamName = streamName || this.DEFAULT_STREAM;
		userStream.addQuery('name',streamName);
		userStream.addQuery('user_id',profileId);
		userStream.query();
		if(!userStream.hasNext()){
			userStream.user_id = profileId;
			userStream.name = streamName;
		}
		else
			userStream.next();
		if(!userStream.canWrite() || !userStream.canCreate()){
			return {"status": 400, "result":"User doesn't have access to update stream"};
		}
		userStream.fanout_to_stream = fanoutToStream || false;
		userStream.setValue('last_accessed_on', new GlideDateTime());
		userStream.update();//if record doesn't exist, it will insert a new record
		return {"streamId":userStream.sys_id + '',"name":userStream.name + '',
				"fanout_to_stream":userStream.fanout_to_stream + '',"is_user_stream":userStream.is_user_stream + '',
				"result:": "user stream is updated."};

	},
	getSubscribableObjectNames: function(){
		var sub_objs = new GlideRecordSecure(this.SUB_OBJ_TABLE);
		sub_objs.query();
		while(sub_objs.next()){
			this.Results.push(sub_objs.name.toString());
		}
		return this.Results.join(',');
	},

	getSubscribableObjectInfo: function(subObjTypeId){
		var sub_obj = new GlideRecordSecure(this.SUB_OBJ_TABLE);
		if(subObjTypeId)
			sub_obj.addQuery('sys_id',subObjTypeId);
		sub_obj.query();

		if(sub_obj.next())
			return {"name":sub_obj.name,"table_name":sub_obj.table_name,"sys_id":sub_obj.sys_id};
		else return null;
	},
	getSubObjByTableName: function(tableName){
		var sub_obj = new GlideRecord(this.SUB_OBJ_TABLE);
		if(tableName)
			sub_obj.addQuery('table_name',tableName);
		sub_obj.query();

		if(sub_obj.next())
			return sub_obj.sys_id;
	},
	getSubscribableObjects: function(setupPref, module){
		var subObjects = [], temp = [];
		var gr = new GlideRecordSecure(this.SUB_OBJ_TABLE);
		if(parseInt(setupPref) == 1)
			gr.addSystemEncodedQuery("sys_id=6cbd03c467103200ace49a6617415ac4^ORsys_id=17bd03c467103200ace49a6617415aed");
		if(this.activitySubContext.isCommunityPluginActive == true && !sn_communities.CommunityConstants.ENABLE_TOPICS)
			gr.addQuery('sys_id', '!=', this.SUB_OBJ_TOPIC);
		gr.addQuery('module', module);
		gr.orderBy('order');
		gr.query();

		while(gr.next()){
			if(gr.table_name == 'sn_actsub_subscribable_object')
				continue;
			var obj = {};
			obj.name = gr.getDisplayValue('name');
			obj.order = gr.getValue('order');
			obj.sys_id = gr.getUniqueValue();
			obj.table_name = gr.getValue('table_name');
			obj.framework = 'actsub';
			subObjects.push(obj);
		}

		//get the legacy Notifications objects
		var ng = new GlideRecord(this.NOTIF_OBJ_TABLE);
		ng.addActiveQuery();
		ng.addQuery('module', module);
		ng.orderBy('order');
		ng.query();
		while (ng.next()) {
			if (ng.canRead()) {
				var obj = {};
				obj.name = ng.getDisplayValue('name');
				obj.order = ng.getValue('order');
				obj.sys_id = ng.getUniqueValue();
				obj.table_name = ng.getValue('table_name');
				obj.noti_category = ng.getValue('notification_category');
				obj.framework = 'legacy';
				temp.push(obj);
			}
		}

		if (temp.length > 0) {
			if (!subObjects.length)
				subObjects = temp;
			else {
				// add into subObjects array in sorted manner
				var start_from = 0;
				temp.forEach(function(obj) {
					for (var i = start_from; i < subObjects.length; i++ ) {
						if (subObjects[i].order > obj.order) {
							subObjects.splice(i, 0, obj);
							start_from = i + 1;
							break;
						}
					} 
				});	
			}
		}
		
		return subObjects;
	},
	getSubscribersCount: function(subObjId, objType){
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery("sub_obj_type", objType);
		gr.addQuery("sub_obj_id", subObjId);
		gr.query();
		return gr.getRowCount();
	},

	getSubscribers: function(objectIds, actor, checkNotifPreference, author, isFeedback){
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('sub_obj_id','IN',objectIds);
		if(actor)
			gr.addQuery('subscriber_id','!=',actor);
		if(author && isFeedback)
			gr.addQuery('subscriber_id','!=',author);
		gr.query();
		var subscribersProfIds = [];
		var subscribersSysIds = [];
		var sysIdToliveProfileMap = {};
		var liveProfileToSysIdMap = {};		
		while(gr.next()){
			var subscriber = this.getLiveProfileRec(gr.subscriber_id);
			if(!gs.nil(subscriber) && !gs.nil(gr.subscriber_id)){
                sysIdToliveProfileMap[subscriber.document + ''] = gr.subscriber_id + '';
                liveProfileToSysIdMap[gr.subscriber_id + ''] = subscriber.document + '';
                subscribersSysIds.push(subscriber.document + '');
                subscribersProfIds.push(gr.subscriber_id + '');
			}
		}
		if(checkNotifPreference){
			this.filterSubscribersByGlobalPreferences(sysIdToliveProfileMap, subscribersProfIds, liveProfileToSysIdMap, subscribersSysIds);
		}
		return {subProfIds:subscribersProfIds, subSysIds: subscribersSysIds};
	},

	filterSubscribersByGlobalPreferences: function(sysIdToliveProfileMap, subscribersProfIds, liveProfileToSysIdMap, subscribersSysIds) {
		try{
			//filter by global preference				
			var usersList;
			if(subscribersSysIds && subscribersSysIds.length > 0){
				usersList = new global.ArrayUtil().unique(subscribersSysIds).join(',');
			}
			//Filter based on global notification preference
			gr = new GlideRecord('sys_user');
			gr.addQuery('sys_id', 'IN', usersList);
			//Get the negative list which should be smaller.
			gr.addQuery('notification', '<>' , this.GLOBAL_NOTIF_PREF_ENABLE_VAL);
			gr.query();
			while(gr.next()){
				var index = subscribersSysIds.indexOf(gr.sys_id + '');
				if(index > -1)
					subscribersSysIds.splice(index, 1);
				var profileId = sysIdToliveProfileMap[gr.sys_id + ''];
				index = subscribersProfIds.indexOf(profileId);
				if(index > -1)	
					subscribersProfIds.splice(index, 1);
			}
		}catch(err){
			gs.error('ACTSUB-ERROR: Unable to filter by global preference');
		}
		//Filter by fanout preference
		try{
			var disabledFanoutArray = this._getUsersWithFanoutDisabled(subscribersProfIds, 'Notification');
			if(disabledFanoutArray && disabledFanoutArray.length > 0){
				for(var idx in  disabledFanoutArray){
					var i = subscribersProfIds.indexOf(disabledFanoutArray[idx]);
					if(i > -1)	
						subscribersProfIds.splice(i, 1);
					var sysID = liveProfileToSysIdMap[disabledFanoutArray[idx]];
					i = subscribersSysIds.indexOf(sysID);
					if(i > -1)
						subscribersSysIds.splice(i, 1);
				}
			}
		}catch(err){
			gs.error('ACTSUB-ERROR: Unable to filter by fanout preference');
		}
		return {subProfIds:subscribersProfIds, subSysIds: subscribersSysIds};
	},

	filterUsersByGlobalPreferences: function(userIds) {
		if(!userIds || userIds.length == 0)
			return;
		var _users = [].concat(userIds);
		var gr = new GlideRecord("live_profile");
		gr.addQuery('document', 'IN', _users.join());
		gr.addQuery('type', 'user');
		gr.query();
		
		var subscribersProfIds = [];
		var subscribersSysIds = [];
		var sysIdToliveProfileMap = {};
		var liveProfileToSysIdMap = {};		
		while(gr.next()){
			sysIdToliveProfileMap[gr.document + ''] = gr.sys_id + '';
			liveProfileToSysIdMap[gr.sys_id + ''] = gr.document + '';
			subscribersSysIds.push(gr.document + '');
			subscribersProfIds.push(gr.sys_id + '');
			var idx = _users.indexOf(gr.document+'');
			if(idx > -1)
				_users.splice(idx, 1);
		}
		if(_users.length > 0) {
			for(var i=0; i< _users.length; i++)
				subscribersSysIds.push(_users[i]);
		}
		var usersObject = this.filterSubscribersByGlobalPreferences(sysIdToliveProfileMap, subscribersProfIds, liveProfileToSysIdMap, subscribersSysIds);
		if(usersObject && usersObject.subSysIds)
			return usersObject.subSysIds;
	},

	getSubscribersBySubscription: function(subObjId, subObjType, orderBy, firstRow, lastRow,
											searchString, fetchCount, dontFetchSubscriberInfo){
		if(!subObjId)
			return;
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		var retObj = {};
		var sessionUserProfileId = this.getLiveProfileId();
		gr.addQuery('sub_obj_id',subObjId);
		if(subObjType)
			gr.addQuery('sub_obj_type', subObjType);
		if(orderBy && orderBy == 'recent')
			gr.orderByDesc('sys_created_on');
		else if(orderBy == 'subscriber')
			gr.orderBy('subscriber_id');
		try{
			firstRow = parseInt(firstRow);
			lastRow = parseInt(lastRow);
			firstRow = isNaN(firstRow) ? 0 : firstRow;
			lastRow = isNaN(lastRow) ? this.MAX_PAGE_SIZE : lastRow;
			//default to max page size
			if((lastRow-firstRow) > this.MAX_PAGE_SIZE)//Always set the page size less than or equal to MAX_PAGE_SIZE
				lastRow = firstRow + this.MAX_PAGE_SIZE;
		}catch(err){
			//default to first 15 records
			firstRow = 0;
			lastRow = this.MAX_PAGE_SIZE;
		}
		var pageSize = -1;
		if(firstRow > -1 && lastRow > -1 && lastRow >= firstRow){
			pageSize = lastRow - firstRow;
			gr.chooseWindow(firstRow, lastRow + 1);//fetch one extra row to detect hasMoreRecords without exposing ACL-denied row count
		}

		searchString = searchString ? searchString.toString() : "";
		if(searchString){
			var comm_profile_gr = new GlideRecord(sn_communities.CommunityConstants.SN_COMMUNITIES_PROFILE);
			comm_profile_gr.addQuery('name','CONTAINS',searchString);
			comm_profile_gr.query();
			
			var liveprofileIds=[];
			while(comm_profile_gr.next()){
				liveprofileIds.push(comm_profile_gr.getValue('live_profile'));
			}
			if(liveprofileIds.length > 0){
				gr.addQuery('subscriber_id','IN',liveprofileIds);
			}
			else{
				retObj.searchString = searchString;
				retObj.hasMoreRecords = false;
				retObj.recordCount = 0;
				if(fetchCount && fetchCount == "subscriptions"){
					retObj.subscriptionsCount = 0;
				}
				retObj.subscribers = [];
				return retObj;
			}
		}
		
		gr.query();
		
		retObj.searchString = searchString;
		if(fetchCount && fetchCount == "subscriptions"){// && fetchSubscriptionsCount == true){
			retObj.subscriptionsCount = this.getSubscriptionsCount(subObjId, subObjType);
		}
		var result = [];
		while(gr.next()){
		    if(!gr.canRead())
				continue;
			if(pageSize > -1 && result.length >= pageSize){
				retObj.hasMoreRecords = true;
				break;
			}
			var subscription = {};
			subscription.subscriber_id = '' + gr.subscriber_id;
			subscription.subscriber_sys_user_id = '' + gr.subscriber_id.document;
			subscription.subscriber_name = '' + gr.subscriber_id.getDisplayValue();
			subscription.title = '' + gr.subscriber_id.document.title;

			if(!dontFetchSubscriberInfo) {
				var isSubscribed;
				if(gs.isLoggedIn())//get this information only for loggedin users
					isSubscribed = this.isSubscribed(subscription.subscriber_id, sessionUserProfileId);
				if(isSubscribed && isSubscribed.subscriptionId){
					subscription.sessionUserSubscribed = true;
				}else
					subscription.sessionUserSubscribed = false;
				var image = this.getImageURL(subscription.subscriber_id);
				subscription.image = {};
				subscription.image.userImage = image.iix;
				subscription.image.userID = '' + gr.subscriber_id.document;
				subscription.image.userName = '' + gr.subscriber_id.name;
				subscription.image.isLoaded = true;
				subscription.image.initials = this._getUserInitials(gr.subscriber_id.name);
				if(this.activitySubContext.isCommunityPluginActive == true && gr.sub_obj_type != this.SUB_OBJ_KB && gr.sub_obj_type != this.SUB_OBJ_KA){
					var profileImpl = new sn_communities.Community_Factory().getWrapperType(sn_communities.CommunityConstants.PROFILE);
					var profileDetails = profileImpl.getUserProfile(subscription.subscriber_id);
					var commProfileName = (profileDetails && profileDetails.display_name && profileDetails.display_name.value) ? profileDetails.display_name.value : "";
					if(profileDetails && profileDetails.title)
						subscription.title = profileDetails.title;
					if(profileDetails && profileDetails.company)
						subscription.company = profileDetails.company;
					if(profileDetails && profileDetails.photo)
						subscription.image.userImage = profileDetails.photo.value;
					if(commProfileName) {
						subscription.subscriber_name = commProfileName;
						subscription.image.userName = commProfileName;
						subscription.image.initials = this._getUserInitials(commProfileName);
					}
				}
			}
			result.push(subscription);
		}
		retObj.subscribers = result;
		retObj.recordCount = result.length;
		return retObj;
	},
	getSubObjGlblPref: function(current){
		var gr = new GlideRecord(this.SUB_OBJ_NOTIF_PREF);
		gr.addQuery('activity_type',current.activity_type_id);
		gr.addQuery('is_global', true);
		gr.query();
		var map = {};
		while(gr.next()){
			map[gr.subscribable_object.table_name] = gr.getValue('preference_code');
		}
		return map;
	},
	getSubscriptions: function(profile){
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('subscriber_id',profile);
		gr.query();
		var result = [];
		while(gr.next()){
			if(!gr.canRead())
				continue;
			if(this.activitySubContext.isCommunityPluginActive == true
			   && gr.sub_obj_id.content && !gr.sub_obj_id.content.active)
				continue;
			result.push(gr.sub_obj_id.toString());
		}
		return result.join(',');
	},
	getSubscriptionsCount: function(profile, subObjType){
		var gr = new GlideRecordSecure(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('subscriber_id',profile);
		if(subObjType)
			gr.addQuery('sub_obj_type', subObjType);
		gr.query();
		return gr.getRowCount();
	},
	getLiveProfileId: function(userId){
		userId = userId || gs.getUserID();
		var profile_id = new GlideappLiveProfile().getID(userId);
		return profile_id;
	},
	getLiveProfileIDs: function(userIds){
		if(userIds){
			var liveProfileIds;
			var live_profile = new GlideRecord("live_profile");
			live_profile.addQuery("document", "IN", userIds);
			live_profile.query();
			while(live_profile.next()){
				if(liveProfileIds)
					liveProfileIds += live_profile.getUniqueValue() + '';
				else
					liveProfileIds = live_profile.getUniqueValue() + '';
				if(live_profile.hasNext())
					liveProfileIds += ',';
			}
			return liveProfileIds;
		}
	},
	getLiveProfileRec: function(profileId){
		var live_profile = new GlideRecord("live_profile");
		live_profile.addQuery("sys_id", profileId);
		live_profile.query();
		if(live_profile.next() && ((live_profile.type=='user' && live_profile.document.active)||(live_profile.type!='user')))
			return live_profile;
	},

	getActSubCounts: function(liveProfileId, onlyActCount, onlySubsCount){
		if(!liveProfileId)
			liveProfileId = this.getLiveProfileId(gs.getUserID());//Get session user profile Id.
		var streamId = this.activitySubContext.getActivityDAO().getStreamID(this.DEFAULT_STREAM, liveProfileId);
		var	result = {};
		if(streamId && !onlySubsCount){
			var	activityCount = this.activitySubContext.getActivityDAO().getActivitiesCountByUserInStream(streamId, liveProfileId, true);
			result.activityStreamCount = activityCount;
		}

		if (!onlyActCount) {
			var ga = new GlideAggregate(this.SUBSCRIPTIONS_TABLE);
			ga.addQuery('subscriber_id',liveProfileId);
			ga.addQuery('sub_obj_type', '<>', this.SUB_META_OBJ_SYS_ID);
			ga.addAggregate('COUNT');
			ga.query();
			var subscriptionsCount = 0;
			if(ga.next())
				subscriptionsCount = ga.getAggregate('COUNT');

			result.subscriber = liveProfileId;
			result.subscriptionsCount = subscriptionsCount;
		}
		return result;
	},
	getSubscribedForum : function(forumList){
		var subscribedforums = [];
		if(forumList != null && forumList){
			var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
			var sessionUserProfileId = this.getLiveProfileId();
			gr.addQuery('sub_obj_id','IN',forumList.join());
			gr.addQuery('subscriber_id',sessionUserProfileId);
			gr.query();
			while(gr.next()){
				subscribedforums.push(gr.sub_obj_id.toString());
			}
		}
		return subscribedforums;

	},
	getSubscriptionsBySubscriber: function(profile, subObjType, getList, orderBy, firstRow, lastRow, searchString){
		var userLiveProfile;
		var sessionUserProfileId = this.getLiveProfileId();//get current session user profile ID
		if(getList == "true")
			userLiveProfile = this.getLiveProfileId();
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		if(getList == "true")
			gr.addQuery('subscriber_id',userLiveProfile);
		else
			gr.addQuery('subscriber_id',profile);
		gr.addQuery('sub_obj_type','!=', this.SUB_META_OBJ_SYS_ID);
		if(subObjType)
			gr.addQuery('sub_obj_type',subObjType);
		try{
			firstRow = parseInt(firstRow);
			lastRow = parseInt(lastRow);
			firstRow = isNaN(firstRow) ? 0 : firstRow;
			lastRow = isNaN(lastRow) ? this.MAX_PAGE_SIZE : lastRow;
			if((lastRow-firstRow) > this.MAX_PAGE_SIZE)//Always set the page size less than or equal to MAX_PAGE_SIZE
				lastRow = firstRow + this.MAX_PAGE_SIZE;
		}catch(err){
			firstRow = 0;
			lastRow = this.MAX_PAGE_SIZE;
		}
		var pageSize = lastRow - firstRow;
		gr.chooseWindow(firstRow, lastRow + 1);//fetch one extra row to detect hasMoreRecords without exposing ACL-denied row count
		if(orderBy == 'recent')
			gr.orderByDesc('sys_created_on');
		gr.query();
		var hasMoreRecords = false;
		var subscriptionsCount = 0;
		var result = [];
		var resultIds = [];
		var subscriber;
		searchString = searchString ? searchString.toString() : "";
		var accessibleForums = {};
		while(gr.next()){
			if(!gr.canRead())
				continue;
			if(subscriptionsCount >= pageSize){
				hasMoreRecords = true;
				break;
			}
			subscriptionsCount++;
			var subscription = {}, profileDetails, profileImpl;
			subscription.sub_obj_type = '' + gr.sub_obj_type.getDisplayValue();
			subscription.sub_obj_id = '' + gr.sub_obj_id;
			subscription.sub_obj_display_value = gr.sub_obj_id.getDisplayValue();

			if(this.activitySubContext.isCommunityPluginActive == true && gr.sub_obj_type == this.SUB_OBJ_LIVE_PROFILE && gr.sub_obj_type != this.SUB_OBJ_KB && gr.sub_obj_type != this.SUB_OBJ_KA){
				var image = this.getImageURL(subscription.sub_obj_id);
				subscription.image = {};
				subscription.image.userImage = image.iix;
				subscription.image.userID = gr.sub_obj_id.document;
				subscription.image.userName = gr.sub_obj_id.name + '';
				subscription.image.isLoaded = true;
				subscription.image.initials = this._getUserInitials(gr.sub_obj_id.name);
				profileImpl = new sn_communities.Community_Factory().getWrapperType(sn_communities.CommunityConstants.PROFILE);
				profileDetails = profileImpl.getUserProfile(subscription.sub_obj_id);
				if(profileDetails && profileDetails.display_name && profileDetails.display_name.value)
					subscription.image.userName = profileDetails.display_name.value;
				if(profileDetails && profileDetails.title)
					subscription.title = profileDetails.title;
				if(profileDetails && profileDetails.company)
					subscription.company = profileDetails.company;
				if(profileDetails && profileDetails.photo)
					subscription.image.userImage = profileDetails.photo.value;
			}
			//Implement search on document_id field
			if(searchString && searchString.length > 0
			   && subObjType == this.SUB_OBJ_LIVE_PROFILE){
				var profileName = subscription.image.userName;
				if(profileName && profileName.toLowerCase().indexOf(searchString.toLowerCase()) == -1)
					continue;
			}
			if(getList == "true")
				resultIds.push(gr.sub_obj_id.toString());
			else {
				if(this.activitySubContext.isCommunityPluginActive == true
				   && gr.sub_obj_id.content && !gr.sub_obj_id.content.active)
					continue;
				subscriber = gr.subscriber_id.getDisplayValue();
				var hasAccess = true;
				var forumId, contentTypeId, evalAcl = true;
				if(this.activitySubContext.isCommunityPluginActive == true && gr.sub_obj_type.module== this.COMMUNITY_MODULE){ 
					profileImpl = new sn_communities.Community_Factory().getWrapperType(sn_communities.CommunityConstants.PROFILE);
					profileDetails = profileImpl.getUserProfile(gr.subscriber_id + '');
					if(profileDetails && profileDetails.display_name && profileDetails.display_name.value) {
						subscriber = profileDetails.display_name.value;
					}
					if(gr.sub_obj_id.content){
						forumId = gr.sub_obj_id.content.forum_id;
						contentTypeId = gr.sub_obj_id.content.content_type;
					}
					if(contentTypeId && this.enableACL[contentTypeId] == false
					   && accessibleForums[forumId] && accessibleForums[forumId][contentTypeId]){
						hasAccess = accessibleForums[forumId][contentTypeId];
						evalAcl = false;
					}
					if(evalAcl == true)
						hasAccess = new sn_communities.CommunityActivityService().hasAccessToSubscription(gr);
					if(forumId && contentTypeId){
						if(!accessibleForums[forumId])
							accessibleForums[forumId] = {};
					}
					if(!hasAccess){
						if(forumId && contentTypeId && this.enableACL[contentTypeId] == false)
							accessibleForums[forumId][contentTypeId] = false;
						continue;
					}
					if(forumId && contentTypeId && this.enableACL[contentTypeId] == false)
						accessibleForums[forumId][contentTypeId] = true;
				}
				var gdt = new GlideDateTime(gr.sys_created_on + '');
				subscription.sys_created_on = gdt.getNumericValue();
				if(sessionUserProfileId && sessionUserProfileId != profile){
					//viewing others profile and subscriptions, so store the session's users status of subscription
					// with respect to other users subscriptions.
					var retStatus = this.isSubscribed(subscription.sub_obj_id, sessionUserProfileId);
					if(retStatus && retStatus.subscriptionId)
						subscription.sessionUserSubscribed = true;
					else
						subscription.sessionUserSubscribed = false;
				}else{
					subscription.sessionUserSubscribed = true;
				}
				if(this.activitySubContext.isCommunityPluginActive == true){
					if(gr.sub_obj_type == this.SUB_OBJ_FORUM){
						subscription.parent = '' + gr.sub_obj_id.parent;
						subscription.description = '' + gr.sub_obj_id.description;
					}
				}
				//Additional information for question objects
				if(this.activitySubContext.isCommunityPluginActive == true
				   && gr.sub_obj_id.content){
					subscription.content_details = new sn_communities.CommSubscriptionDAO().getContentObject(gr);
					if(subscription.content_details)
						result.push(subscription);
				}
				else
					result.push(subscription);
			}
		}
		if(getList == "true") {
			resultIds = resultIds.join(',');
			return {"subscriptions":resultIds};
		}
		else{
			return {"subscriber":subscriber,"subscriber_id":profile,"subscriptions":result, "hasMoreRecords":hasMoreRecords, "subscriptionsCount": subscriptionsCount,
					"firstRow": firstRow, "lastRow": lastRow};
		}
	},
	/**
	 A more effecient method specifically designed to capture user subscriptions to show-up on the community follow page
	 and does some optimization in fetching the profile details and doesn't pollute the getSubscriptionsBySubscriber method
	**/
	getFollowingsByFollower: function(profile, subObjType, orderBy, firstRow, lastRow, searchString){
		var userLiveProfile;
		var sessionUserProfileId = this.getLiveProfileId();//get current session user profile ID
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('subscriber_id',profile);
		gr.addQuery('sub_obj_type','!=', this.SUB_META_OBJ_SYS_ID);
		if(subObjType)
			gr.addQuery('sub_obj_type',subObjType);
		else
			gr.addQuery('sub_obj_type',this.SUB_OBJ_LIVE_PROFILE);
		gr.query();
		var subscriber;
		//Get the followers count
		var followersCount = this.getSubscribersCount(profile, this.SUB_OBJ_LIVE_PROFILE);
		var subscriptions = [], followingIDs = [];
		searchString = searchString ? searchString.toString() : "";
		while(gr.next()){
		    if(!gr.canRead())
				continue;
			var subscription = {};
			subscriber = gr.subscriber_id.getDisplayValue();
			subscription.sub_obj_type = '' + gr.sub_obj_type.getDisplayValue();
			subscription.sub_obj_id = '' + gr.sub_obj_id;
			subscription.sub_obj_display_value = gr.sub_obj_id.getDisplayValue();
			var gdt = new GlideDateTime(gr.sys_created_on + '');
			subscription.sys_created_on = gdt.getNumericValue();

			//fetch the initial data from live profile, in case the community profile is not available.
			//later outside the while, these values are overridden from community profile.
			var image = this.getImageURL(subscription.sub_obj_id);
			subscription.image = {};
			subscription.image.userImage = image.iix;
			subscription.image.userID = gr.sub_obj_id.document;
			subscription.image.userName = gr.sub_obj_id.name + '';
			subscription.image.isLoaded = true;
			subscription.image.initials = this._getUserInitials(gr.sub_obj_id.name);
			if(sessionUserProfileId && sessionUserProfileId != profile){
				//viewing others profile and subscriptions, so store the session's users status of subscription
				// with respect to other users subscriptions.
				var retStatus = this.isSubscribed(subscription.sub_obj_id, sessionUserProfileId);
				if(retStatus && retStatus.subscriptionId)
					subscription.sessionUserSubscribed = true;
				else
					subscription.sessionUserSubscribed = false;
			}else{
				subscription.sessionUserSubscribed = true;
			}

			followingIDs.push(subscription.sub_obj_id);
			subscriptions.push(subscription);
		}
		var subscriptionsCount = subscriptions.length;
		var resultArray = [];
		if(this.activitySubContext.isCommunityPluginActive == true
		   && followingIDs && followingIDs.length > 0 && gr.sub_obj_type != this.SUB_OBJ_KB && gr.sub_obj_type != this.SUB_OBJ_KA){

			var profileImpl = new sn_communities.Community_Factory().getWrapperType(sn_communities.CommunityConstants.PROFILE);
			var profileDetails = profileImpl.getUserInfo(followingIDs, ['photo','display_name','title','company']);
			if(profileDetails){
				for(var index=0;index<subscriptions.length;index++){
					var subObj = subscriptions[index];
					var communityProfile = profileDetails[subObj.sub_obj_id];
					//Implement search on document_id field
					if(communityProfile){
						var profileName = communityProfile.name ? communityProfile.name : subObj.image.userName;
						//If the name doesn't match the search string remove the subscription from the result.
						if(profileName && searchString && searchString.length > 0
						   && profileName.toLowerCase().indexOf(searchString.toLowerCase()) == -1){
							continue;
						}
						//override the live profile details from community profile details.
						if(communityProfile.name) {
							subObj.image.userName = communityProfile.name;
							subObj.sub_obj_display_value = communityProfile.name;
							subscriber = communityProfile.name;
						}
							
						if(communityProfile.title){
							subObj.title = {};
							subObj.title.value = communityProfile.title;
						}
						if(communityProfile.company){
							subObj.company = {};
							subObj.company.value = communityProfile.company;
						}
						if(communityProfile.userImage)
							subObj.image.userImage = communityProfile.userImage;
						if(communityProfile.initials)
							subObj.image.initials = communityProfile.initials;
					}
					resultArray.push(subObj);
				}
			}
		}
		//implement sorting and searching on the resulting array
		//because document_id field cannot be sorted by GR
		var hasMoreRecords = false;
		if(resultArray.length > 0){
			try{
				firstRow = parseInt(firstRow);
				lastRow = parseInt(lastRow);
			}catch(err){
				//default to first 15 records
				firstRow = 0;
				lastRow = 15;
			}
			if(resultArray.length > lastRow)
				hasMoreRecords = true;

			if(orderBy && orderBy == 'recent'){
				resultArray.sort(this._compareSubscriptionsByRecent);
			}else if(orderBy && orderBy == 'subscription'){
				resultArray.sort(this._compareSubscriptionsByName);
			}
			if(firstRow > -1 && lastRow > -1 && lastRow >= firstRow){
				resultArray = resultArray.slice(firstRow, lastRow);
			}
		}
		return {"subscriber":subscriber,"subscriber_id":profile,"subscriptions":resultArray, "hasMoreRecords":hasMoreRecords, "subscriptionsCount": subscriptionsCount, "followersCount": followersCount};
	},
	_compareSubscriptionsByName: function(subscriptionA, subscriptionB){
		if(subscriptionA.image.userName && subscriptionB.image.userName){
			return subscriptionA.image.userName.localeCompare(subscriptionB.image.userName);
		}
	},
	_compareSubscriptionsByRecent: function (subscriptionA, subscriptionB){
		if(subscriptionA.sys_created_on && subscriptionB.sys_created_on){
			return subscriptionB.sys_created_on - subscriptionA.sys_created_on;
		}
	}	,
	_getUserInitials: function (name){
		if (!name)
			return "--";

		var initials = name.split(" ").map(function(word) {
			return word.toUpperCase();
		}).filter(function(word) {
			return word.match(/^[A-Z]/);
		}).map(function(word) {
			return word.substring(0,1);
		}).join("");

		return (initials.length > 3)? initials.substr(0, 3): initials;
	},
	getImageURL: function(forum_id){
		var gr = new GlideRecord(this.SYS_ATTACHMENT);
		gr.addQuery("table_sys_id",forum_id);
		gr.query();
		var image = {};
		if(gr.next()){
			image.url = '' + this.IMAGE_URL + gr.sys_id;
			image.iix = '' + gr.sys_id + this.IIX_EXTN;
		}
		return image;
	},
	getPreferences: function(profileId, subObject, activityTypeId){
		var preferences = {};
		var liveProfile = this.getLiveProfileRec(profileId);
		preferences.user = {
			"profile_id": liveProfile.sys_id + '',
		};

		if (!this.canFetchPreferences(liveProfile.document + ''))
			throw {
				message: "Security Error: User fetching preferences are different from preference record user!"
			};
		
		var gr = new GlideRecord(this.ACTIVITY_TYPE_PREF);
		if(activityTypeId)
			gr.addQuery('activity_type', activityTypeId);
		gr.addQuery('subscribable_object', subObject);
		gr.addQuery('is_global', true);
		gr.orderBy('activity_type.label');
		gr.query();
		preferences.activities = [];
		//Get user default preference code, if not present use global
		var prefMap;


		while(gr.next()){
			if(!preferences.sub_object.sys_id){
				//Executes only first time to set the subscribable object details.
				preferences.sub_object = {};
				preferences.sub_object.sys_id = gr.subscribable_object.sys_id + '';
				preferences.sub_object.name = gr.subscribable_object.name + '';
				//Get the map of activity_type and default preference codes for the user
				prefMap = this._getDefaultUserPrefCodes(profileId, gr.subscribable_object.sys_id);
			}
			var	prefCode;
			if(prefMap[gr.activity_type])
				prefCode = prefMap[gr.activity_type].preference_code;
			else
				prefCode = gr.preference_code;
			try{
				prefCode = parseInt(prefCode);
			}catch(err){
				prefCode = 0;
			}
			preferences.activities.push({activity_type_id:'' + gr.activity_type,
										 short_description:'' + gr.activity_type.short_description,
										 label: '' + gr.activity_type.label,
										 pref_code: {
											 user_default: prefCode
										 }
										});
		}
		return preferences;
	},
	_getDefaultUserPrefCodes: function(profileId, subObjId){
		var userSubscription = this.isSubscribed(subObjId, profileId);
		var prefMap = {};
		if(userSubscription && userSubscription.subscriptionId){
			prefMap.subscriptionId = userSubscription.subscriptionId + '';
			var gr = new GlideRecord(this.SUB_NOTIF_PREF);
			gr.addQuery('subscription', userSubscription.subscriptionId);
			gr.query();
			while(gr.next()){
				var key = gr.notification_preference.activity_type + '';
				var value = gr.notification_preference.preference_code + '';
				prefMap[key] = {"preference_code" : value,
								'sys_id': gr.sys_id + ''};
			}
		}else{
			//first time setup, create subscription at default level
			prefMap.subscriptionId = this.createSubscription('sn_actsub_subscribable_object', subObjId, this.SUB_META_OBJ_SYS_ID, profileId);
		}
		return prefMap;
	},
	updatePreferences: function(prefData){
		var result;
		if(prefData.user.profile_id && prefData.sub_object.sys_id){
			var profileRec = this.getLiveProfileRec(prefData.user.profile_id);
			if(profileRec.document != gs.getUserID()){//Don't allow other users to update preferences through API.
				throw {message:"Security Error: User updating preferences is different from preference record user!"};
			}
			var prefMap = this._getDefaultUserPrefCodes(prefData.user.profile_id, prefData.sub_object.sys_id);

			var activities = [];
			activities = prefData.sub_object.activities;

			if(activities){
				result = [];
				for(var i=0; i < activities.length;i++){
					if(prefMap[activities[i].activity_type_id] && (prefMap[activities[i].activity_type_id].preference_code == activities[i].preferences['default']))
						continue;//Its same, no need to update/insert

					//Get a unique tuple if present
					var gr = new GlideRecord(this.ACTIVITY_TYPE_PREF);
					gr.addQuery('subscribable_object', prefData.sub_object.sys_id);
					gr.addQuery('activity_type', activities[i].activity_type_id);
					gr.addQuery('is_global', false);
					gr.addQuery('preference_code', activities[i].preferences['default']);
					gr.query();
					var notification_preference;
					if(gr.next())
						notification_preference = gr.sys_id;
					else{
						//insert the tuple
						gr.initialize();
						gr.subscribable_object = prefData.sub_object.sys_id;
						gr.activity_type = activities[i].activity_type_id;
						gr.is_global = false;
						gr.preference_code = activities[i].preferences['default'];
						gr.insert();
						notification_preference = gr.sys_id;
					}
					var subPrefRec = new GlideRecord(this.SUB_NOTIF_PREF);
					if(prefMap[activities[i].activity_type_id]){
						//Update existing record
						subPrefRec.addQuery('subscription', prefMap.subscriptionId);
						subPrefRec.addQuery('sys_id', prefMap[activities[i].activity_type_id].sys_id);
						subPrefRec.query();
						if(subPrefRec.next()){
							subPrefRec.notification_preference = notification_preference + '';
							subPrefRec.update();
						}
					}else{
						//insert a new record for the user
						subPrefRec.initialize();
						subPrefRec.subscription = prefMap.subscriptionId;
						subPrefRec.notification_preference = notification_preference;
						subPrefRec.insert();
					}
					result.push({"activity_id": activities[i].activity_type_id + ''});
				}
			}
		}
		return result;
	},
	
	canFetchPreferences: function(profileId){
		var hasRole = gs.hasRole('actsub_admin');
		if (hasRole == false && pm.isActive('com.sn_communities')) {
			return (gs.hasRole('snc_internal') || gs.hasRole('snc_external')) &&
				gs.getUserID() == profileId;
		}
		return hasRole || (gs.getUserID() == profileId);
	},
	
	/*
	*Evaluates whether given activity is done after the user subscription.
	*Avoids fetching activities that happened before subscription
	@parameter - streamId: sys id of a activity stream
	@parameter - objectIds: list of subscribable object ids
	@parameter - activityTime: created time of the activity
	@return - true/false 
	*/
	hasSubscribedBeforeActivityDate: function(streamId, objectIds, activityTime){
		if(!streamId)
			return false;
		var objs = objectIds.join(',');
		var subscriptionGr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		subscriptionGr.addQuery('sub_obj_id','IN',objs);
		subscriptionGr.addQuery('sys_created_on', '<', activityTime);
		subscriptionGr.addQuery('stream_id',streamId);
		subscriptionGr.orderBy('sys_created_on');
		subscriptionGr.setLimit(1);
		subscriptionGr.query();
		return subscriptionGr.hasNext();
	},
	
	/*
	* Get the users followed by the given profileId
	@parameter - profileId: live profile id of the user
	@return - list of userids and profile ids of users followed by the user
	*/
	getFollowedUsersByProfile: function(profileId){
		var subscriptionGr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		subscriptionGr.addQuery('subscriber_id', profileId);
		subscriptionGr.addQuery('sub_obj_name', 'live_profile');
		subscriptionGr.query();
		var followingUsers = [];
		while(subscriptionGr.next()){
			followingUsers.push(subscriptionGr.sub_obj_id + '');
		}
		return followingUsers;
	},
	
	getSubscriptionsForStream: function(streamId){
		if(!streamId)
			return '';
		var gr = new GlideRecord(this.SUBSCRIPTIONS_TABLE);
		gr.addQuery('stream_id', streamId);
		gr.query();
		var result = [];
		while(gr.next()){
			if(this.activitySubContext.isCommunityPluginActive == true
				&& gr.sub_obj_id.content && !gr.sub_obj_id.content.active)
				continue;
			result.push(gr.sub_obj_id.toString());
		}
		return result;
	},
	
	type: 'SubscriptionDAO'
};
