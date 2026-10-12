var app = angular.module("sn.chg_soc.landing");
app.constant("SOC", {
	"CHG_DEFINITIONS" : "/api/sn_chg_soc/soc/chgdefinitions",
	"USER_PREFERENCE_PINNED" : "com.snc.soc.landing_page.pinned_schedules",
	"KEYS" : {
		"TABKEY"          : 9,
		"ENTER"           : 13,
		"ESCAPE"          : 27
	}
});
app.service("ScheduleService", [ "$window", "$http", "$q", "modelUtil", "userPreferences", "SOC",
function($window, $http, $q, modelUtil, userPreferences, SOC) {
	var scheduleService = this;
	scheduleService.schedules = {};

	scheduleService.initialHit = function(filter, orderby, limit, textSearch) {
		var offset = -1;
		scheduleService.schedules = {};
		return scheduleService.getSchedules(filter, orderby, offset, limit, textSearch);
	};

	scheduleService.getSchedules = function(filter, orderBy, offset, limit, textSearch) {
		var deferred = $q.defer();
		textSearch = (!textSearch) ? "" : textSearch.trim();
		var url = SOC.CHG_DEFINITIONS + "?sysparm_ck=" + $window.g_ck + "&offset=" + offset + "&schedule_limit=" + limit + "&filter=" + filter + "&orderby=" + orderBy + "&text_search=" + textSearch;
		$http.get(url).then(function(response) {
			updateDataModel(response.data.result, filter);
			deferred.resolve(response.data.result);
		}, function(response) {
			modelUtil.failNicely(response);
			deferred.reject(response);
		});
		return deferred.promise;
	};

	scheduleService.setScheduleLimit = function(newLimit, filter) {
		scheduleService.schedules[filter].limit = parseInt(newLimit);
		if (!scheduleService.schedules[filter].limit || isNaN(scheduleService.schedules[filter].limit) || scheduleService.schedules[filter].limit > scheduleService.schedules[filter].maxLimit)
			scheduleService.schedules[filter].limit = scheduleService.schedules[filter].maxLimit;
	};

	scheduleService.showSplashMsg = function(filter) {
		if (!scheduleService.schedules.hasOwnProperty("__struct"))
			return false;
		return scheduleService.schedules.__struct[filter].sysIds.length === 0;
	};

	// modifies the array, does not copy
	function togglePinned(pinnedArray, sysId) {
		if (!pinnedArray || !Array.isArray(pinnedArray) || !sysId)
			return pinnedArray;

		// remove empty strings WITHOUT a copy of array i.e. do NOT pinnedArray.filter(pinnedSysId => pinnedSysId);
		var len = pinnedArray.length;
		for(var i = 0; i < len; i++ )
			pinnedArray[i] && pinnedArray.push(pinnedArray[i]);

		pinnedArray.splice(0 , len);

		var index = pinnedArray.indexOf(sysId);
		if (index !== -1)
			pinnedArray.splice(index, 1);
		else
			pinnedArray.push(sysId);

		return pinnedArray;
	}

	scheduleService.togglePinned = function(sysId) {
		togglePinned(scheduleService.schedules.__struct['pinned'].sysIds, sysId);

		if (typeof $window.NOW.soc_schedules.pinned_schedules !== 'string')
			$window.NOW.soc_schedules.pinned_schedules = '';

		var newUserPrefPinnedSchedules = togglePinned($window.NOW.soc_schedules.pinned_schedules.split(','), sysId).join(',');
		if (newUserPrefPinnedSchedules !== $window.NOW.soc_schedules.pinned_schedules) {
			$window.NOW.soc_schedules.pinned_schedules = newUserPrefPinnedSchedules;
			userPreferences.setPreference(SOC.USER_PREFERENCE_PINNED, $window.NOW.soc_schedules.pinned_schedules);
		}
	};

	function updateDataModel(result, filter) {
		var limit = 0;
		if (!scheduleService.schedules.chg_soc_definition) {
			scheduleService.schedules = result;
			limit = scheduleService.schedules.__struct[filter].sysIds.length;
		}
		else {
			scheduleService.schedules.__struct[filter].__more = result.__more;
			result.chg_soc_definition.forEach(function(chgDef) {
				var chgDefId = chgDef.sys_id.value;
				scheduleService.schedules.chg_soc_definition[chgDefId] = chgDef;
				if (scheduleService.schedules.__struct[filter].sysIds.indexOf(chgDefId) === -1)
					scheduleService.schedules.__struct[filter].sysIds.push(chgDefId);
			});
		}
		scheduleService.schedules.__struct[filter].offset = scheduleService.schedules.__struct[filter].offset + scheduleService.schedules.__struct[filter].limit;
	}

	scheduleService.hasMoreSchedules = function(filter) {
		return scheduleService.schedules.__struct[filter].__more;
	};

	scheduleService.hasReachedLimit = function(filter) {
		return scheduleService.schedules.__struct[filter].sysIds.length >= scheduleService.schedules.__struct[filter].maxLimit;
	};

	function compareByName(a, b) {
		if (a.name.display_value < b.name.display_value)
			return -1;
		if (a.name.display_value > b.name.display_value)
			return 1;
		return 0;
	}

	function sort(filter, sortBy) {
		var arrToSort = [];
		scheduleService.schedules.__struct[filter].sysIds.forEach(function(key) {
			arrToSort.push(scheduleService.schedules.chg_soc_definition[key]);
		});

		if (sortBy === "name")
			arrToSort.sort(compareByName);
		else
			arrToSort.sort(function(a, b) {
				if (a.owner.display_value < b.owner.display_value)
					return -1;
				if (a.owner.display_value > b.owner.display_value)
					return 1;
				return compareByName(a, b);
			});
		var sysIds = [];
		arrToSort.forEach(function(obj) {
			sysIds.push(obj.sys_id.value);
		});
		return sysIds;
	}

	scheduleService.sortArray = function(sortBy) {
		scheduleService.schedules.__struct["all"].sysIds = sort("all", sortBy);
		scheduleService.schedules.__struct["own_belong"].sysIds = sort("own_belong", sortBy);
		scheduleService.schedules.__struct["pinned"].sysIds = sort("pinned", sortBy);
	};
}]);
