function ActsubRestService($http, $q) {
	//CONSTANTS
	var ActsubConst = {};
	ActsubConst.PREF_MAPPING_FIELD = 'source_table';
	ActsubConst.NOTI_MAPPING_FIELD = 'table_name';
	
	//Private members
	var actSubApiBaseUrl = '/api/now/v1/actsub/',
		legacyApiBaseUrl = '/api/now/v1/notification/',
		data;

	//Public members
	return {
		init: init,
		getPreferences: getPreferences,
		savePreferences: savePreferences,
		toggleAllNotifications: toggleAllNotifications,
		getUserNotificationState: getUserNotificationState
	};
	
	//init
	function init (dataObj) {
		data = dataObj;
	}

	function _httpService(url, method, payLoad){
		return $http({
			method: method,
			url: url,
			data: payLoad
		});
	}

	function getPreferences (subObj) {
		if (!subObj)
			return;
		var resourceUrl = actSubApiBaseUrl + 'preferences/' + data.liveProfileId + '?subObject=' + subObj.sys_id;
		if (subObj.framework == 'legacy')
			resourceUrl = legacyApiBaseUrl + 'preference?category=' + subObj.noti_category + '&sysparm_limit=100&sysparm_offset=0';
		return _httpService(resourceUrl, 'GET')
			.then(function (resp) {
			return _transformPerfResponse(resp.data, subObj);
		});
	}

	function _transformPerfResponse (resp, subObj) {
		var retObj = {},
			populateChannels = true;
		retObj.activities = [];
		data.user_channels = data.user_channels || {};
		if (subObj.framework == 'legacy') {
			resp.result.preferences.forEach(function (pref) {
				if (subObj[ActsubConst.NOTI_MAPPING_FIELD] != pref.notification[ActsubConst.PREF_MAPPING_FIELD])
					return;
				var act = {};
				act.activity_type_id = pref.notification.sys_id;
				act.label = pref.name;
				act.pref_code = {};
				act.pref_meta = {};
				if (pref.records.length) {
					act.pref_meta.table = pref.records[0].table;
					act.pref_meta.sys_id = pref.records[0].sys_id;
				}
				pref.records.forEach(function (pRec) {
					if (pRec.channel.name.toLowerCase() == 'primary email') {
						if (!pRec.channel.active)
							return;
						act.pref_code.email = pRec.active;
						if (populateChannels)
							data.user_channels.email = pRec.channel.sys_id;
					}
					else {//sms, push etc possible
						act.pref_code[pRec.channel.name] = pRec.active;
						if (populateChannels)
							data.user_channels[pRec.channel.name] = pRec.channel.sys_id;
					}
				});
				populateChannels = false;
				retObj.activities.push(act);
			});
		}
		else {
			resp.result.preferences.activities.forEach(function (activity) {
				var act = {};
				act.activity_type_id = activity.activity_type_id;
				act.label = activity.label;
				act.pref_code = {};
				if (activity.pref_code.user_default == 1)
					act.pref_code.email = true;
				else
					act.pref_code.email = false;
				retObj.activities.push(act);
			});
			retObj.user = resp.result.preferences.user;
			retObj.sub_object = resp.result.preferences.sub_object;
		}
		
		return retObj;
	}
	
	function savePreferences (acts, sub) {
		if (sub.framework == 'legacy')
			return _saveNotiPref(acts);
		else
			return _saveActPref(acts, sub);
			
	}

	function _saveNotiPref (acts) {
		var resourceUrl = legacyApiBaseUrl + 'preference',
				payLoad, promises = [];
		 acts.forEach(function (act) {
			 payLoad = {};
			 payLoad.preference = {};
			 payLoad.preference.notification_id = act.activity_type_id;
			 payLoad.preference.channel_id = data.user_channels.email;
			 payLoad.preference.active = act.pref_code.email;
			 payLoad.preference.table = act.pref_meta.table;
			 payLoad.preference.sys_id = act.pref_meta.sys_id;
			 promises.push(_httpService(resourceUrl, 'POST', payLoad).then(function (res) {
				 if (!act.pref_meta.sys_id)
					 act.pref_meta.sys_id = res.data.result.records[0].sys_id;
			 }));	
		 });
		return $q.all(promises);
	}
	
	function _saveActPref(acts, subObj) {
		var resourceUrl = actSubApiBaseUrl + 'preferences',
				payLoad = {};
		payLoad.user = subObj.genPreferences.user;
		payLoad.sub_object = {};
		payLoad.sub_object.sys_id = subObj.sys_id;
		payLoad.sub_object.activities = [];
		acts.forEach(function (act) {
			var obj = {};
			obj.activity_type_id = act.activity_type_id;
			obj.preferences = {
				"default" : act.pref_code.email ? 1 : 0
			};
			payLoad.sub_object.activities.push(obj);
		});

		return _httpService(resourceUrl, 'POST', payLoad).then(function (resp) {
			return resp.data;
		});	
	}
	
	function toggleAllNotifications (value, onlyActsub) {
		var promises = [],
				resourceUrl, payLoad;
		/* As per PM, no need to disable Notifications at Profile level.
		if (!onlyActsub) {
			//Legacy Notifications
			payLoad = {"enable_notifications": value};
			resourceUrl = legacyApiBaseUrl + 'preference/all';
			promises.push(_httpService(resourceUrl, 'POST', payLoad));
		}
		*/
		if (data.liveProfileId) {
			//Actsub Notifications
			payLoad = {"stream_name": "Notification", "fanout": value};
			resourceUrl = actSubApiBaseUrl + 'userstream/'+ data.liveProfileId;
			promises.push(_httpService(resourceUrl, 'PUT', payLoad));
		}
		
		return $q.all(promises);
	}
	
	function getUserNotificationState () {
		data.user_channels = data.user_channels || {};
		//get User level state
		return _httpService(legacyApiBaseUrl + 'preference/channel', 'GET').then(function (resp) {
			resp = resp.data;
			data.enable_notifications = resp.result ? resp.result.enable_notifications : true;
			if (resp.result && resp.result.channels && resp.result.channels.length) {
				resp.result.channels.forEach(function (ch) {
					if (ch.name.toLowerCase() == 'primary email')
						data.user_channels.email = ch.sys_id;
					else
						data.user_channels[ch.name] = ch.sys_id;
				});
			}
		//then adjust fan_out state according to user preference.
			if (data.fanout_to_stream != data.enable_notifications)
				toggleAllNotifications(!data.fanout_to_stream, true);
		});
	}
	
	
}//End
