var app = angular.module("sn.chg_model_ui.landing");
app.constant("ChgModelConstants", {
	"CHG_MODELS" : "/api/sn_chg_model_ui/landing/chgmodels",
	"USER_PREFERENCE_PINNED" : "sn_chg_model_ui.landing_page.pinned_change_models",
	"KEYS" : {
		"TABKEY"          : 9,
		"ENTER"           : 13,
		"ESCAPE"          : 27
	}
});
app.service("chgModelService", [ "$window", "$http", "$q", "modelUtil", "userPreferences", "ChgModelConstants",
function($window, $http, $q, modelUtil, userPreferences, ChgModelConstants) {
	var chgModelService = this;
	chgModelService.changeModels = {};

	chgModelService.initialHit = function(filter, orderby, limit, textSearch) {
		var offset = -1;
		chgModelService.changeModels = {};
		return chgModelService.getChangeModels(filter, orderby, offset, limit, textSearch);
	};

	chgModelService.getChangeModels = function(filter, orderBy, offset, limit, textSearch) {
		var deferred = $q.defer();
		textSearch = encodeURIComponent((!textSearch) ? "" : textSearch.trim());
		var url = ChgModelConstants.CHG_MODELS + "?sysparm_ck=" + $window.g_ck + "&offset=" + offset + "&chg_model_limit=" + limit + "&filter=" + filter + "&orderby=" + orderBy + "&text_search=" + textSearch;
		$http.get(url).then(function(response) {
			updateDataModel(response.data.result, filter);
			deferred.resolve(response.data.result);
		}, function(response) {
			modelUtil.failNicely(response);
			deferred.reject(response);
		});
		return deferred.promise;
	};

	chgModelService.setScheduleLimit = function(newLimit, filter) {
		chgModelService.changeModels[filter].limit = parseInt(newLimit);
		if (!chgModelService.changeModels[filter].limit || isNaN(chgModelService.changeModels[filter].limit) || chgModelService.changeModels[filter].limit > chgModelService.changeModels[filter].maxLimit)
			chgModelService.changeModels[filter].limit = chgModelService.changeModels[filter].maxLimit;
	};

	chgModelService.showSplashMsg = function(filter) {
		if (!chgModelService.changeModels.hasOwnProperty("__struct"))
			return false;
		return chgModelService.changeModels.__struct[filter].sysIds.length === 0;
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

	chgModelService.togglePinned = function(sysId) {
		togglePinned(chgModelService.changeModels.__struct['pinned'].sysIds, sysId);

		if (typeof $window.NOW.chg_model_landing.pinned_change_models !== 'string')
			$window.NOW.chg_model_landing.pinned_change_models = '';

		var newUserPrefPinnedChgModels = togglePinned($window.NOW.chg_model_landing.pinned_change_models.split(','), sysId).join(',');
		if (newUserPrefPinnedChgModels !== $window.NOW.chg_model_landing.pinned_change_models) {
			$window.NOW.chg_model_landing.pinned_change_models = newUserPrefPinnedChgModels;
			userPreferences.setPreference(ChgModelConstants.USER_PREFERENCE_PINNED, $window.NOW.chg_model_landing.pinned_change_models);
		}
	};

	function updateDataModel(result, filter) {
		var limit = 0;
		if (!chgModelService.changeModels.chg_model) {
			chgModelService.changeModels = result;
			limit = chgModelService.changeModels.__struct[filter].sysIds.length;
		} else {
			chgModelService.changeModels.__struct[filter].__more = result.__more;
			result.chg_model.forEach(function(chgModel) {
				var chgModelId = chgModel.sys_id.value;
				chgModelService.changeModels.chg_model[chgModelId] = chgModel;
				if (chgModelService.changeModels.__struct[filter].sysIds.indexOf(chgModelId) === -1)
					chgModelService.changeModels.__struct[filter].sysIds.push(chgModelId);
				if (filter !== 'all' && chgModelService.changeModels.__struct['all'].sysIds.indexOf(chgModelId) === -1)
					chgModelService.changeModels.__struct['all'].sysIds.push(chgModelId);
			});
		}
		chgModelService.changeModels.__struct[filter].offset = chgModelService.changeModels.__struct[filter].offset + chgModelService.changeModels.__struct[filter].limit;
	}

	chgModelService.hasMoreChangeModels = function(filter) {
		return chgModelService.changeModels.__struct[filter].__more;
	};

	chgModelService.hasReachedLimit = function(filter) {
		return chgModelService.changeModels.__struct[filter].sysIds.length >= chgModelService.changeModels.__struct[filter].maxLimit;
	};

	function compareBy(a, b, field, prop) {
		if (!field || !prop || !a[field] || !a[field][prop] || !b[field] || !b[field][prop])
			return 0;

		if (a[field][prop] < b[field][prop])
			return -1;

		if (a[field][prop] > b[field][prop])
			return 1;

		return 0;
	}

	function compareByName(a, b) {
		return compareBy(a, b, "name", "display_value");
	}

	function compareByDescription(a, b) {
		return compareBy(a, b, "description", "display_value");
	}

	function sort(filter, sortBy) {
		var arrToSort = [];
		chgModelService.changeModels.__struct[filter].sysIds.forEach(function(key) {
			arrToSort.push(chgModelService.changeModels.chg_model[key]);
		});

		if (sortBy === "name")
			arrToSort.sort(compareByName);
		else
			arrToSort.sort(compareByDescription);

		var sysIds = [];
		arrToSort.forEach(function(obj) {
			sysIds.push(obj.sys_id.value);
		});
		return sysIds;
	}

	chgModelService.sortArray = function(sortBy) {
		chgModelService.changeModels.__struct["pinned"].sysIds = sort("pinned", sortBy);
		chgModelService.changeModels.__struct["change_models"].sysIds = sort("change_models", sortBy);
		chgModelService.changeModels.__struct["preapproved"].sysIds = sort("preapproved", sortBy);
		chgModelService.changeModels.__struct["all"].sysIds = sort("all", sortBy);
	};
}]);
