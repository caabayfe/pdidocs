var SamLifeCycleUtils = Class.create();
SamLifeCycleUtils.prototype = {
	initialize: function() {},

	getSAMSMVersionLifeCycles: function(softwareModelSysId, fullVersion, startDate, endDate) {
		var response = {
			items: {},
		};

		var modelGr = this.getSMrecord(softwareModelSysId, response);
		if (gs.nil(modelGr)) {
			return response;
		}

		// if start date defined get one record < start date to achor the time line for APM
		var jsonReply = {};

		var bestFitVersion = this.tryToFindBestFit(modelGr, fullVersion);

		if (!gs.nil(startDate)) {
			this.getPrevLifeCycleRecord(jsonReply, modelGr, bestFitVersion,
				startDate, endDate);
		}

		this.getAllLifeCycles(jsonReply, modelGr, bestFitVersion, null, null,
			null, startDate, endDate);

		// if full version and no exact match found then return an empty set
		if (this.isEmpty(jsonReply)) {
			return {
				items: {},
			};
		}
		response.items = jsonReply;
		return response;
	},

	getValidFullVersions: function(softwareModelSysId, lifecycleType, sourceType) {
		var response = {
			items: [],
		};
		var modelGr = this.getSMrecord(softwareModelSysId, response);
		if (gs.nil(modelGr)) {
			return response;
		}

		var grResultSet = new GlideRecord('sam_sw_product_lifecycle');
		this.checkOptionalParam(modelGr, grResultSet, null, null, lifecycleType, sourceType);
		grResultSet.orderBy('norm_full_version');
		grResultSet.query();
		var fullVersions = {};
		while (grResultSet.next()) {
			if (gs.nil(grResultSet.getValue('norm_full_version'))) {
				fullVersions.EMPTY = true;
			} else {
				fullVersions[grResultSet.norm_full_version] = true;
			}
		}
		response.items = Object.keys(fullVersions).toString();
		return response;
	},

	getPrevLifeCycleRecord: function(jsonReply, modelGr, fullVersion, startDate) {
		var grResultSet = new GlideRecord('sam_sw_product_lifecycle');
		this.checkProductAndEdition(modelGr, grResultSet);
		if (gs.nil(fullVersion)) {
			grResultSet.addNullQuery('norm_full_version');
		} else if (fullVersion !== 'ALL') {
			grResultSet.addQuery('norm_full_version', fullVersion);
		}
		grResultSet.addQuery('start_date', '<', startDate);
		grResultSet.orderByDesc('start_date');
		grResultSet.setLimit(1);
		grResultSet.query();
		if (grResultSet.next()) {
			var versionN = gs.nil(grResultSet.norm_full_version)
				? 'EMPTY' : '' + grResultSet.getValue('norm_full_version');
			var lt = grResultSet.lifecycle_type;
			var src = grResultSet.source;
			var lph = grResultSet.lifecycle_phase;
			jsonReply[versionN] = {};
			jsonReply[versionN][lt] = {};
			jsonReply[versionN][lt][src] = {};
			jsonReply[versionN][lt][src][lph] = [];
			jsonReply[versionN][lt][src][lph].push(this.createJSONresponse(grResultSet));
		}
	},

	getSAMLifeCycles: function(softwareModelSysId, fullVersion, lifecyclePhase,
		lifecycleType, source) {
		var response = {
			items: {},
		};
		var modelGr = this.getSMrecord(softwareModelSysId, response);
		if (gs.nil(modelGr)) {
			return response;
		}
		var jsonReply = {};

		var bestFitVersion = this.tryToFindBestFit(modelGr, fullVersion);

		this.getAllLifeCycles(jsonReply, modelGr, bestFitVersion, lifecyclePhase,
			lifecycleType, source);

		response.items = jsonReply;
		return response;
	},

	getAllLifeCycles: function(jsonReply, modelGr, fullVersion, lifecyclePhase, lifecycleType,
		source, startDate, endDate) {
		var lifecycleGr = new GlideRecord('sam_sw_product_lifecycle');
		this.checkOptionalParam(modelGr, lifecycleGr, null, lifecyclePhase, lifecycleType, source);
		if (gs.nil(fullVersion)) {
			lifecycleGr.addNullQuery('norm_full_version');
		} else if (fullVersion !== 'ALL') {
			lifecycleGr.addQuery('norm_full_version', fullVersion);
		}
		lifecycleGr.orderBy('norm_full_version');
		lifecycleGr.orderBy('lifecycle_type');
		lifecycleGr.orderBy('source');
		lifecycleGr.orderBy('lifecycle_phase');
		if (!gs.nil(startDate) && !gs.nil(endDate)) {
			lifecycleGr.addQuery('start_date', '>=', startDate);
			lifecycleGr.addQuery('start_date', '<', endDate);
		}
		lifecycleGr.orderBy('start_date');
		lifecycleGr.query();

		while (lifecycleGr.next()) {
			var nfv = gs.nil(lifecycleGr.norm_full_version)
				? 'EMPTY' : '' + lifecycleGr.getValue('norm_full_version');
			var lt = lifecycleGr.getValue('lifecycle_type');
			var src = lifecycleGr.getValue('source');
			var lph = lifecycleGr.getValue('lifecycle_phase');

			if (gs.nil(jsonReply[nfv])) {
				jsonReply[nfv] = {};
			}

			if (gs.nil(jsonReply[nfv][lt])) {
				jsonReply[nfv][lt] = {};
			}

			if (gs.nil(jsonReply[nfv][lt][src])) {
				jsonReply[nfv][lt][src] = {};
			}

			if (gs.nil(jsonReply[nfv][lt][src][lph])) {
				jsonReply[nfv][lt][src][lph] = [];
			}
			jsonReply[nfv][lt][src][lph].push(this.createJSONresponse(lifecycleGr));
		}
	},

	tryToFindBestFit: function(modelGr, orgVersion, lifecyclePhase, lifecycleType, source) {
		if (gs.nil(orgVersion) || (orgVersion === 'ALL')) { return orgVersion; }

		var lifecycleGr = new GlideRecord('sam_sw_product_lifecycle');
		this.checkProductAndEdition(modelGr, lifecycleGr);
		lifecycleGr.addQuery('norm_full_version', orgVersion);
		lifecycleGr.query();
		if (lifecycleGr.next()) {
			return orgVersion;
		}

		var versionA = this.getListOfFullVersions(modelGr, lifecyclePhase, lifecycleType, source);
		if (versionA.length > 0) {
			return this.findBestFit(orgVersion, versionA);
		}

		return null;
	},

	getListOfFullVersions: function(modelGr, lifecyclePhase, lifecycleType, source, startDate, endDate) {
		var fullVersions = {};
		var grVersionList = new GlideRecord('sam_sw_product_lifecycle');
		this.checkOptionalParam(modelGr, grVersionList, null, lifecyclePhase, lifecycleType, source);
		if (!gs.nil(startDate)) {
			grVersionList.addQuery('start_date', '>=', startDate);
		}
		if (!gs.nil(endDate)) {
			grVersionList.addQuery('start_date', '<', endDate);
		}
		grVersionList.addNotNullQuery('norm_full_verison');
		grVersionList.query();
		while (grVersionList.next()) {
			fullVersions[grVersionList.getValue('norm_full_version')] = true;
		}
		// get rid of the duplicates
		return Object.keys(fullVersions);
	},

	getMinimumVersionLifecycle: function(softwareModelSysId, listOfPhases) {
		var response = {
			items: {},
		};

		var modelGr = this.getSMrecord(softwareModelSysId, response);
		if (gs.nil(modelGr)) {
			return response;
		}

		// let's try the internal source first
		var source = this.getFirstFirstMatch(modelGr, listOfPhases, 'internal');
		if (!gs.nil(source)) {
			response.items = source;
			return response;
		}

		var choiceGr = new GlideRecord('sys_choice');
		choiceGr.addQuery('name', 'sam_sw_product_lifecycle');
		choiceGr.addQuery('element', 'source');
		choiceGr.addQuery('value', 'DOES NOT CONTAIN', 'internal');
		choiceGr.addNotNullQuery('sequence');
		choiceGr.orderBy('sequence');
		choiceGr.query();
		while (choiceGr.next()) {
			var preferedSource = choiceGr.getValue('value');
			source = this.getFirstFirstMatch(modelGr, listOfPhases, preferedSource);
			if (!gs.nil(source)) {
				response.items = source;
				return response;
			}
		}

		// if we do not get match look at the sys choices with a null sequence
		choiceGr = new GlideRecord('sys_choice');
		choiceGr.addQuery('name', 'sam_sw_product_lifecycle');
		choiceGr.addQuery('element', 'source');
		choiceGr.addNullQuery('sequence');
		choiceGr.query();
		while (choiceGr.next()) {
			var preferedNullSource = choiceGr.getValue('value');
			source = this.getFirstFirstMatch(modelGr, listOfPhases, preferedNullSource);
			if (!gs.nil(source)) {
				response.items = source;
				break;
			}
		}

		return response;
	},

	getFirstFirstMatch: function(modelGr, listOfPhases, dataSource) {
		var reply;
		var grResultSet = new GlideRecord('sam_sw_product_lifecycle');
		this.checkProductAndEdition(modelGr, grResultSet);
		grResultSet.addQuery('lifecycle_phase', listOfPhases);
		grResultSet.addQuery('source', dataSource);
		grResultSet.orderBy('start_date');
		grResultSet.query();
		if (grResultSet.next()) {
			reply = this.createJSONresponse(grResultSet);
			reply.full_version = '' + grResultSet.norm_full_version;
		}
		return reply;
	},

	getDefaultRisk: function(table, lifecyclePhase) {
		if (GlidePluginManager.isActive('com.snc.samp.core') && table === 'sam_sw_product_lifecycle') {
			switch (lifecyclePhase) {
			case 'pre_release':
				return 'low';
			case 'availability':
				return 'moderate';
			case 'end_of_life':
				return 'very_high';
			case 'end_of_support':
				return 'high';
			case 'end_of_extended_support':
				return 'very_high';
			default:
				return 'moderate';
			}
		} else {
			return 'moderate';
		}
	},

	findBestFit: function(orgFullVersion, fullVersions) {
		var bestFitIndex = -1;
		var bestFitLen = 0;

		for (var i = 0; i < fullVersions.length; i++) {
			var currFullVersion = '' + fullVersions[i];
			if (currFullVersion.length > orgFullVersion.length) {
				continue;
			}
			// do not allow 1 to be a best fit for 11
			// 11 can be a bestfit for 11.1
			if (parseInt(currFullVersion, 10) < parseInt(orgFullVersion, 10)) { continue; }

			var curLen = this.getMatchLen(orgFullVersion, currFullVersion);
			if (curLen > bestFitLen) {
				bestFitLen = curLen;
				bestFitIndex = i;
			}
		}
		if (bestFitIndex === -1) {
			return null; // there was no match
		}
		return fullVersions[bestFitIndex];
	},

	getMatchLen: function(sourceA, versionSA) {
		return sourceA.startsWith(versionSA) ? versionSA.length : 0;
	},

	checkOptionalParam: function(modelGr, grResultSet, fullVersion, lifecyclePhase, lifecycleType, source) {
		this.checkProductAndEdition(modelGr, grResultSet);
		// process optional parameters
		if (!gs.nil(lifecyclePhase)) {
			grResultSet.addQuery('lifecycle_phase', lifecyclePhase);
		}

		if (!gs.nil(lifecycleType)) {
			grResultSet.addQuery('lifecycle_type', lifecycleType);
		}

		if (!gs.nil(source)) {
			grResultSet.addQuery('source', source);
		}
		if (!gs.nil(fullVersion)) {
			grResultSet.addQuery('norm_full_version', fullVersion).addOrCondition('norm_full_version', null);
		}
	},

	checkProductAndEdition: function(modelGr, grResultSet) {
		if (GlidePluginManager.isActive('com.snc.sams')) {
			grResultSet.addQuery('norm_product', modelGr.product);
		} else {
			grResultSet.addQuery('publisher', modelGr.manufacturer);
			grResultSet.addQuery('product_name', modelGr.name);
		}
		if (!gs.nil(modelGr.edition)) {
			grResultSet.addQuery('norm_edition', modelGr.edition);
		}
		grResultSet.addQuery('norm_version', 'STARTSWITH', modelGr.version);
		grResultSet.addQuery('active', true);
	},

	createJSONresponse: function(grResultSet) {
		var jsonData = {};
		jsonData.edition = '' + grResultSet.norm_edition;
		jsonData.start_date = '' + grResultSet.start_date;
		jsonData.risk = '' + grResultSet.risk;
		jsonData.description = '' + grResultSet.description;
		return jsonData;
	},

	getSMrecord: function(sysID, response) {
		var modelGr = new GlideRecord('cmdb_software_product_model');
		modelGr.addQuery('sys_id', sysID);
		modelGr.query();
		if (modelGr.next()) {
			return modelGr;
		}
		response.error = 'Sofware model sys_id not found';
		return null;
	},

	isEmpty: function(obj) {
		return Object.keys(obj).length === 0;
	},
	type: 'SamLifeCycleUtils',
};

SamLifeCycleUtils.queryVersionAndEdition = function(currentGr, modelGr, dotWalkField) {
	var version = modelGr.getDisplayValue('version');
	var edition = modelGr.getDisplayValue('edition');
	var normVersion = 'norm_version';
	var normFullVersion = 'norm_full_version';
	var normEdition = 'norm_edition';

	if (dotWalkField) {
		normVersion = dotWalkField + '.' + normVersion;
		normFullVersion = dotWalkField + '.' + normFullVersion;
		normEdition = dotWalkField + '.' + normEdition;
	}

	switch (modelGr.getValue('version_operator')) {
	case 'starts_with':
		currentGr.addQuery(normVersion, 'STARTSWITH', version)
			.addOrCondition(normFullVersion, 'STARTSWITH', version); break;
	case 'is':
		currentGr.addQuery(normVersion, version)
			.addOrCondition(normFullVersion, version); break;
	default: break;
	}

	switch (modelGr.getValue('edition_operator')) {
	case 'starts_with':
		currentGr.addQuery(normEdition, 'STARTSWITH', edition); break;
	case 'is':
		currentGr.addQuery(normEdition, edition); break;
	default: break;
	}

	return currentGr;
};

SamLifeCycleUtils.deactivateContentInactiveLifecycles = function() {
	var lifecycleGr = new GlideRecord('sam_sw_product_lifecycle');
	lifecycleGr.addActiveQuery();
	lifecycleGr.addNotNullQuery('content_version');
	lifecycleGr.addQuery('content_active', 'false');
	lifecycleGr.setValue('active', false);
	lifecycleGr.setWorkflow(false);
	lifecycleGr.updateMultiple();
};
