var ATFCustomUIHelper = Class.create();
ATFCustomUIHelper.prototype = {
    initialize: function() {
    },
	
	isCustomUIStepConfig: function(stepConfigId) {
	    var CUSTOM_UI_CATEGORY_SYS_ID = '581a597353d21300ac15ddeeff7b12a6';
		if (!stepConfigId)
			return false;
		
		var gr = new GlideRecord('sys_atf_step_config');
		gr.addQuery('sys_id', stepConfigId);
		gr.addQuery('category', CUSTOM_UI_CATEGORY_SYS_ID);
		gr.query();
		return gr.next();
	},

	getMethodForCustomUIStepConfig: function(stepConfigId) {
		if (stepConfigId == 'e5dd168473330300c79260bdfaf6a794' || stepConfigId == 'b4758c7453370300c792ddeeff7b128d')
			return 'setValue';
		else if (stepConfigId == 'def25c4b73730300c79260bdfaf6a700')
			return 'click';
		else
			return '';
	},

	// To be used with the "Retrieve Components" UI action on existing Custom UI steps
	shouldShowRetrieveButton: function(stepGR) {
		if (!stepGR || !stepGR.isValidRecord())
			return false;

		var ASSERT_TEXT_ON_PAGE_SYS_ID = '475e0de3d732130089fca2285e610361';

		if(!((new GlideImpersonate()).isImpersonating()) && sn_atf.AutomatedTestingFramework.isRunnerEnabled()
			&& GlideMobileExtensions.getDeviceType() == 'doctype' && stepGR.test.active && stepGR.active
			&& this.isCustomUIStepConfig(stepGR.step_config.sys_id) && stepGR.getValue("step_config") !== ASSERT_TEXT_ON_PAGE_SYS_ID) 
			return true;

		return false;
	},

	getComponentDescriptionFromCache: function(componentHash, mugshotCacheJSON) {
		var components = "";
		try {
			components = JSON.parse(mugshotCacheJSON);
		} catch (e) {
			return "";
		}

		var mugshot = this._getMugshot(components[componentHash]);
		return mugshot["sn_atf_mugshot_short_description"];
	},
	
	getComponentLabelPathFromCache: function(componentHash, mugshotCacheJSON) {
		var components = "";
		try {
			components = JSON.parse(mugshotCacheJSON);
		} catch (e) {
			return "";
		}

		var mugshot = this._getMugshot(components[componentHash]);
		if (mugshot &&  mugshot.label_path) {
			var labelPathLength = mugshot.label_path.length;
			if (labelPathLength === 1)
				return mugshot.label_path.join();
			else if (labelPathLength === 2)
				return gs.getMessage("ATF_CUSTOM_UI:{0} > {1}", [mugshot.label_path[0], mugshot.label_path[1]]);
			else {
				// Returns the last 3 elements of the labelPath array
				return gs.getMessage("ATF_CUSTOM_UI:{0} > {1} > {2}", [mugshot.label_path[labelPathLength-3], mugshot.label_path[labelPathLength-2], mugshot.label_path[labelPathLength-1]]);
			}
		}

		return null;
	},

	getQueryStringMugshotDescription: function(queryString, mugshotsJSON) {
		var mugshotMap = {};
		try {
			mugshotMap = JSON.parse(mugshotsJSON);
		} catch (e) {}

		var queryParts = queryString.split('^');
		var conditions = "";
		var description;
		for (var i = 0; i < queryParts.length; i++) {
			if (queryParts[i] === "EQ")
				continue;

			// the query parts are structured as "<hash>=<hashValue>", so split on the "=" to extract the hash and hashValues
			var queryPart = queryParts[i];
			var hash = queryPart.slice(0, queryPart.indexOf('='));
			var hashValue = queryPart.slice(queryPart.indexOf('=') + 1);
			var mugshot = this._getMugshot(mugshotMap[hash]);
			description = mugshot["sn_atf_mugshot_short_description"];
			var descriptionLine = gs.getMessage("'{0}' = {1}", [description, this._getComponentDisplayValue(mugshot, hashValue)]);
			conditions += descriptionLine + '\n';
		}
		return conditions;
	},
	
	getQueryStringMugshotDescriptionWithLabelPath: function(queryString, mugshotsJSON) {
		var mugshotMap = {};
		var labelPathString = '';
		try {
			mugshotMap = JSON.parse(mugshotsJSON);
		} catch (e) {}

		var queryParts = queryString.split('^');
		var conditions = "";
		var description;
		for (var i = 0; i < queryParts.length; i++) {
			if (queryParts[i] === "EQ")
				continue;

			// the query parts are structured as "<hash>=<hashValue>", so split on the "=" to extract the hash and hashValues
			var queryPart = queryParts[i];
			var hash = queryPart.slice(0, queryPart.indexOf('='));
			var hashValue = queryPart.slice(queryPart.indexOf('=') + 1);
			var mugshot = this._getMugshot(mugshotMap[hash]);
			var labelPathArray = mugshot.label_path;
			if (!labelPathArray)
				return null;
			
			var labelPathLength = labelPathArray.length;
			if (labelPathLength === 1)
				labelPathString = labelPathArray.join();
			else if (labelPathLength === 2)
				labelPathString = gs.getMessage("ATF_CUSTOM_UI:{0} > {1}", [labelPathArray[0], labelPathArray[1]]);
			else
				labelPathString = gs.getMessage("ATF_CUSTOM_UI:{0} > {1} > {2}", [labelPathArray[labelPathLength-3], labelPathArray[labelPathLength-2], labelPathArray[labelPathLength-1]]);
				
			description = mugshot["sn_atf_mugshot_short_description"];
			var descriptionLine = gs.getMessage("ATF_CUSTOM_UI:'{0}' = '{1}', Page area = '{2}'", [description, this._getComponentDisplayValue(mugshot, hashValue), labelPathString]);
			
			conditions += descriptionLine + '\n';
		}
		return conditions;
	},

	_getMugshot: function(mugshotJSON) {
		if (!mugshotJSON || typeof mugshotJSON !== "string")
			return {sn_atf_mugshot_short_description:""};

	  	try {
			return JSON.parse(mugshotJSON);
		} catch (e) {
			return {sn_atf_mugshot_short_description:""};
		}
	},

	_getComponentDisplayValue: function(mugshot, value) {
		var dataTypeParamsJSON = mugshot["sn-atf-data-type-params"];
		if (!dataTypeParamsJSON)
			return value;

		var dataTypeParams;
		try {
			dataTypeParams = JSON.parse(dataTypeParamsJSON);
		} catch (e) {
			return value;
		}

		if (!dataTypeParams || !dataTypeParams["reference"])
			return value;

		var gr = new GlideRecord(dataTypeParams["reference"]);
		if (!gr.get(value))
			return value;

		return gr.getDisplayValue();
	},

    type: 'ATFCustomUIHelper'
};
