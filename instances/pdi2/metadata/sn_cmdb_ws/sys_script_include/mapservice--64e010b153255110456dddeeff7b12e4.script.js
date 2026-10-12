var MapService = Class.create();

MapService.prototype = Object.extendsObject(MapBase, {

	initialize: function() {
		//A quick trick to enable multiple inheritance
		this.inherit([
			MapReferenceCIService,
			MapOutputFormatService
		]);
		this.errorUtil = new MapErrorUtility();
		this.configUtil = new CmdbWsConfigUtils();
		this.log = new global.GSLog("com.snc.sn_cmdb_ws.log.level", this.type);
		this.perfMetricObject = {
			smServiceTime : { start: 0, stop: 0 },
			cmdbInitialProcessingTime : { start: 0, stop: 0 },
			cmdbServiceTime: { start: 0, stop: 0 }
		};
	},
	/**
	 * Return the extended attributes of the specified CI; CMDB class level inheritance is supported.
	 */
	getCiDetails: function(args) {
		var ciSysId = args.ciSysId;
		var ciClass = args.ciClass;
		var configIdentifierId = args.configIdentifierId;
		var appId = args.appId;

		//input data validation
		var errObj = {};
		try {
			if (!ciSysId) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_001);
				return this._getErrorResponse(errObj);
			} else if (!ciClass) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_004);
				return this._getErrorResponse(errObj);
			} else if (!appId) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_018);
				return this._getErrorResponse(errObj);
			}

			var ciGr = new GlideRecordSecure(ciClass);
			// check if the given ciClass is a valid one
			if (!ciGr.isValid()) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_015);
				return this._getErrorResponse(errObj);
			}

			if (!ciGr.get(ciSysId)){
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_404_001);
				this.log.error('Ci is missing from the database. Input Sys Id: '+ciSysId+' Class: '+ciClass);
				return this._getErrorResponse(errObj);
			}

			var inputClassHierarchy = new GlideTableHierarchy(ciClass).getTables();
			var propGr = this.configUtil.getApplicationConfigTable({
				appId: args.appId,
				configId: args.configIdentifierId,
				table: this.NODE_MAP_TABLE.CI_EXTENDED_PROPS,
				conditions: [{
					name: this.COL_CMDB_CLASS_NAME,
					operator: this.IN_OP,
					value: inputClassHierarchy.join(this.COMMA_DELIMITER)
				}]
			});

			var propMap = {};
			var prop;
			while(propGr.next()) {
				prop = {};
				prop[this.COL_ATTRIBUTES] = propGr.getValue(this.COL_ATTRIBUTES);
				prop[this.COL_FOLLOW_HIERARCHY] = propGr.getValue(this.COL_FOLLOW_HIERARCHY);
				propMap[propGr.getValue(this.COL_CMDB_CLASS_NAME)] = prop;
			}

			var result = {};
			if (Object.keys(propMap).length > 0) {
				//honor the class hierarchy
				for (var hierarchyIndex in inputClassHierarchy) {
					var hierarchyClass = inputClassHierarchy[hierarchyIndex];
					prop = propMap[hierarchyClass];
					if(!prop) {
						continue;
					}
					var tmpRes = this._extractFieldValues(hierarchyClass, prop[this.COL_ATTRIBUTES], ciGr);
					// remove duplicates but capture hilites
					for (var fieldName in tmpRes) {
						if (!result.hasOwnProperty(fieldName) || Object.keys(tmpRes[fieldName].highlightedStyle).length > 0) {
							result[fieldName] = tmpRes[fieldName];
						}
					}
					if(prop[this.COL_FOLLOW_HIERARCHY] == false) {
						break;
					}
				}
			}
			// convert back to an array
			return this._getOutputResponse(Object.keys(result).map(function(key) {
				return result[key];
			}));
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},
	/**
	 * Get edge connection details for service mapping
	 */
	getSMConnectionDetails: function(edgeList, additionalProperties){
		try {
			if (!edgeList || !Array.isArray(edgeList.edges) || edgeList.edges.length === 0) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_016);
				return this._getErrorResponse(errObj);
			}

			var smUtility = new ServiceMapUtility();
			var tmpResOutput = smUtility.getSMConnectionDetails(edgeList, additionalProperties);
			return this._getOutputResponse(tmpResOutput);
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},
	/**
	 * Get related CIs of a dynamic CI group class
	 */
	getDynamicCiGroupMembers : function(args) {
		try {
			var ciSysId = args.sysId;
			var ciClass = args.cls;
			var mode  = args.mode;
			if (this._isEmpty(ciSysId)) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_001);
				return this._getErrorResponse(errObj);
			} else if (this._isEmpty(ciClass)) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_004);
				return this._getErrorResponse(errObj);
			}
			
			if(!mode){
				mode = this.OPERATIONAL_LIFE_CYCLE_STAGE_MODE.VIEW;
			}
			this.LIFE_CYCLE_STAGE_INCLUSION_LIST = this.getLifeCycleStageInclusionList(mode, args.workspaceId, args.configIdentifierId);
			var result = {};
			//Get total row counts of related CIs 
			var gr = new GlideRecordSecure(this.NODE_MAP_TABLE.SVC_CI_ASSOC);
			gr.addQuery(this.COL_SERVICE_ID, ciSysId);
			gr.addNotNullQuery(this.COL_SERVICE_ID);
			gr.addNullQuery('ci_id.life_cycle_stage').
				addOrCondition('ci_id.life_cycle_stage', this.IN_OP, this.LIFE_CYCLE_STAGE_INCLUSION_LIST);
			gr.query();
			result.rowCount = gr.getRowCount();
			result.maxCardCount = this.DYNAMIC_CI_GROUP_MEMBERS_RECORD_MAX_COUNT;

			//Fetch records upto the max record count
			var grRecord = new GlideRecordSecure(this.NODE_MAP_TABLE.SVC_CI_ASSOC);
			grRecord.addQuery(this.COL_SERVICE_ID, ciSysId);
			grRecord.addNotNullQuery(this.COL_SERVICE_ID);
			grRecord.addNullQuery('ci_id.life_cycle_stage').
				addOrCondition('ci_id.life_cycle_stage', this.IN_OP, this.LIFE_CYCLE_STAGE_INCLUSION_LIST);
			grRecord.orderBy(this.COL_NAME);
			grRecord.setLimit(this.DYNAMIC_CI_GROUP_MEMBERS_RECORD_MAX_COUNT);
			grRecord.query();
			
			var allGroupMembers = {};
			var dynamicCIGroupColumns = this.DYNAMIC_CI_GROUP_COLUMNS;
			while(grRecord.next()){
				var ciRecord = grRecord.ci_id.getRefRecord();
				var colSysId = grRecord.getValue(this.COL_CI_ID);
				var dynamicCIProps = {};
				Object.keys(dynamicCIGroupColumns).forEach(function(key) {
					var value = key.indexOf('.') !== -1 ? ciRecord.getDisplayValue(key) : ciRecord.getValue(key);
					dynamicCIProps[dynamicCIGroupColumns[key]] = value || gs.getMessage("None");
				});
				allGroupMembers[colSysId] = {
					properties : dynamicCIProps,
					sysId : colSysId,
					classDisplayName : ciRecord.getDisplayValue(this.SYS_CLASS_NAME),
					name: ciRecord.getValue(this.COL_NAME)
				};
			}
			Object.keys(allGroupMembers).map((function(key) {
				return allGroupMembers[key];
			}));
			result.groupMembers = allGroupMembers;
			return this._getOutputResponse(result);
			
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},
	/**
	 * Fetch config properties values based on workspace or get the defaults
	*/
	getConfigPropertyValues : function(args) {
		var configIdentifierId = args.configIdentifierId;
		var workspaceId = args.workspaceId;
		var properties = args.properties;
		try {
			var result = this.configUtil.getApplicationConfigProp({
				configId: configIdentifierId,
				appId: workspaceId,
				properties: properties
			});
			return this._getOutputResponse(result);
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},

	/**
	 * Create the relationships tree for the specified CI and return it, between the CIs, 
	 * endpoints are skipped and connected as an Endpoint Connection.
	 * 
	 * The default maximum number of nodes recorded during the traversal is 250 (configurable by the 
	 * unifiedmap.map_search.max_nodes CMDB-WS Config Property), and the default number of layers is 3
	 * (configurable by the unifiedmap.map_search_filter.default_levels CMDB-WS Config Property).
	 */
	getMap : function(args) {
		var ciSysId = args.ciSysId;
		var level = args.level;
		var appId = args.appId;
		var serviceMappingInput = args.serviceMappingInput;
		var perfLogging = args.perfLogging;
		var mode = args.mode;
		var configIdentifierId = args.configIdentifierId;

		if(perfLogging) {
			this.perfMetricObject.cmdbInitialProcessingTime.start = Date.now();
		}
		var result = {};
		//input data validation
		var errObj = {};
		try {
			//initial input validation
			var traversalLimit = this._sanitizeNumber(level);
			if (this._isEmpty(ciSysId)) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_001);
				return this._getErrorResponse(errObj);
			}
			if (traversalLimit <= 0) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_003);
				return this._getErrorResponse(errObj);
			}
			if(!mode){
				mode = this.OPERATIONAL_LIFE_CYCLE_STAGE_MODE.VIEW;
			}
			this.LIFE_CYCLE_STAGE_INCLUSION_LIST = this.getLifeCycleStageInclusionList(mode, appId, configIdentifierId);

			//check if Ci exist
			var tInfo = this._fetchAndValidateCis([ciSysId], 0, true);
			if (tInfo[this.VALID_SYS_IDS].length == 0) {
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_404_001);
				this.log.error('Ci is missing from the database. Input Sys Id: '+ciSysId);
				return this._getErrorResponse(errObj);
			}

			//check if Ci has valid life cycle stage
			if(this.LIFE_CYCLE_STAGE_INCLUSION_LIST && tInfo[this.CURR_NODE_INFO][ciSysId][this.COL_LIFE_CYCLE_STAGE] &&
				this.LIFE_CYCLE_STAGE_INCLUSION_LIST.indexOf(tInfo[this.CURR_NODE_INFO][ciSysId][this.COL_LIFE_CYCLE_STAGE]) === -1) {
				var messageObject = this._generateMessageObj({
					severity: this.MESSAGE_SEVERITY.INFO,
					message: gs.getMessage("Unable to display map - CI selected as home node does not meet allowable Life Cycle Stage values")
				});
				errObj = this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_017, messageObject);
				return this._getErrorResponse(errObj);
			}
	
			this.ENDPOINT_CLASSES = new GlideTableHierarchy(this.CMDB_CI_ENDPOINT).getAllExtensions();
		
			result[this.CI_NODE_INFO] = {};
			result[this.EDGES] = {};
			this._mergeData(result[this.CI_NODE_INFO], tInfo[this.CURR_NODE_INFO]);
			var mapOutput =  this._doGetMap({
				result: result, 
				traversalLimit: traversalLimit, 
				appId: appId, 
				serviceMappingInput: serviceMappingInput,
				perfLogging: perfLogging,
				configIdentifierId: configIdentifierId
			});
			if(perfLogging) {
				this.perfMetricObject.cmdbServiceTime.stop = Date.now();
				result.perfMetrics = {
					cmdb_getmap_api_time: (this.perfMetricObject.cmdbServiceTime.stop - this.perfMetricObject.cmdbServiceTime.start) + 
						(this.perfMetricObject.cmdbInitialProcessingTime.stop - this.perfMetricObject.cmdbInitialProcessingTime.start),
					sm_getmap_api_time: (this.perfMetricObject.smServiceTime.stop && this.perfMetricObject.smServiceTime.start) ? 
						(this.perfMetricObject.smServiceTime.stop - this.perfMetricObject.smServiceTime.start) : 0
				};
			}
			this._addSharedPresetInfo(mapOutput, appId, configIdentifierId);
			return mapOutput;
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
	},

	getRelatedApplicationServices: function(ciSysIds) {
		var result = {};
		if (!ciSysIds || ciSysIds.length === 0 || !Array.isArray(ciSysIds)) {
			return this._getErrorResponse(this.errorUtil._form40XErrorObject(this.errorUtil.CMDBUM_400_001));
		}
		var smUtility = new ServiceMapUtility();
		try {
			result = smUtility.getCiApplicationServicesAssociation(ciSysIds);
		} catch (e) {
			errObj = this.errorUtil._form50XErrorObject(e);
			this.log.error(e.message);
			return this._getErrorResponse(errObj);
		}
		return this._getOutputResponse(result);
	},



	_doGetMap: function(args) {
		var result = args.result;
		var traversalLimit = args.traversalLimit;
		var appId = args.appId;
		var serviceMappingInput = args.serviceMappingInput;
		var perfLogging = args.perfLogging;

		var ciSysId = Object.keys(result[this.CI_NODE_INFO])[0];
		var currClass = result[this.CI_NODE_INFO][ciSysId][this.PROPERTIES][this.SYS_CLASS_NAME][this.VALUE];
		var smUtility = new ServiceMapUtility();
		var isApplicationService = smUtility.isAnApplicationService(currClass);
		var errObj = {};
		var messages = [];
		var tmpSMRes = {};
		//ensure traversalLimit <= MAX_LEVEL
		traversalLimit = Math.min(traversalLimit, this.DEF_MAX_LEVEL);
		
		result[this.MAP_TYPE] = isApplicationService ? this.MAP_TYPE_SVC_INSTANCE : this.MAP_TYPE_DEP;
		
		if (isApplicationService) {
			if(perfLogging) {
				this.perfMetricObject.cmdbInitialProcessingTime.stop = Date.now();
				this.perfMetricObject.smServiceTime.start = Date.now();
			}

			try {
				var _this = this;
				var getIconFromClass = function(ciClass) {
					var ciIconMap = _this._getIconFromMappingTable();
					if (ciIconMap[ciClass] && ciIconMap[ciClass][_this.ICON])
						return ciIconMap[ciClass][_this.ICON];
					else
						return _this._getClassDefaultIcon(ciClass); //default icon
				};
				tmpSMRes = smUtility.getSMMap({
					ciSysId: ciSysId,
					traversalLimit: traversalLimit,
					appId: appId,
					serviceMappingInput: serviceMappingInput,
					getIconFromClass: getIconFromClass
				});
			} catch (e) {
				if(perfLogging) {
					this.perfMetricObject.smServiceTime.stop = Date.now();
				}
				this.log.error(e.message);
				//Service mapping throws custom error message
				if(e.code && e.message) {
					return this._getErrorResponse(e);
				} else {
					//case when service mapping does not throw error in the expected format.
					errObj = this.errorUtil._form50XErrorObject(e, this.errorUtil.CMDBUM_500_002);
					return this._getErrorResponse(errObj);
				}
				
			}
			
			if (perfLogging) {
				this.perfMetricObject.smServiceTime.stop = Date.now();
				this.perfMetricObject.cmdbServiceTime.start = Date.now();
			}
		
			//invoke cmdb api to get the business layer nodes
			this._getCMDBMap(	{
				ciSysId: ciSysId,
				result: result,
				traversalLimit: traversalLimit,
				isApplicationService: true,
				messages: messages,
				appId: appId,
				configIdentifierId: args.configIdentifierId
			});
		
			//merge cmdb & sm outputs
			//TODO: open it once we have integrated the SM APIs
			this._mergeCMDBSMMap(result, tmpSMRes, messages);

		} else {
			if(perfLogging) {
				this.perfMetricObject.cmdbInitialProcessingTime.stop = Date.now();
				this.perfMetricObject.cmdbServiceTime.start = Date.now();
			}
			this._getCMDBMap({
				ciSysId: ciSysId,
				result: result,
				traversalLimit: traversalLimit,
				isApplicationService: false,
				messages: messages,
				appId: appId,
				configIdentifierId: args.configIdentifierId
			});;
			
		}
		// Replace location sys ids and owner sys ids with pretty names
		this._replaceLocationAndUserNames(result[this.CI_NODE_INFO]);
		this._fixGroupEdges(result);
		this._getProfileData(currClass, result, appId, args.configIdentifierId);
		return this._getOutputResponse(result, messages);
	},

	_getCMDBMap: function(args) {
		// Limit number of nodes displayed
		var ciSysId = args.ciSysId;
		var result = args.result;
		var traversalLimit = args.traversalLimit;
		var isApplicationService = args.isApplicationService;
		var messages = args.messages;
		var appId = args.appId;
		var configIdentifierId = args.configIdentifierId;
		var edgeLimit = this.configUtil.getApplicationConfigProp({
			properties: [this.MAX_NODE_PROP],
			appId: appId,
			configId: configIdentifierId
		});
		if (gs.nil(edgeLimit) || gs.nil(edgeLimit[this.MAX_NODE_PROP])) {
			edgeLimit = this.DEF_MAX_NODE_VAL;
		} else {
			edgeLimit = parseInt(edgeLimit[this.MAX_NODE_PROP]);
		}
		var currTraversalState = {}, childSysIds = [], parentSysIds = [], transientState = {};
		var currTraversalCount = (edgeLimit - 1);
		transientState[this.EXCLUDE_REL_IDS] = [];
		transientState[this.REL_TYPE_IDS] = [];
		transientState[this.REF_CI_VISITED] = {};
		var smUtility = new ServiceMapUtility();

		var endpointDedupProp = this.configUtil.getApplicationConfigProp({
			configId: configIdentifierId,
			appId: appId,
			properties: [this.ENDPOINT_DEDUP_PROP]
		})[this.ENDPOINT_DEDUP_PROP];
		endpointDedupeFields = gs.nil(endpointDedupProp) ? null : endpointDedupProp.split(',');

		parentSysIds.push(ciSysId);
		//for application services do not traverse children
		if (!isApplicationService)
			childSysIds.push(ciSysId);

		for (var i = 1; i <= traversalLimit; i+= 1){
			if (childSysIds.length > 0 && currTraversalCount > 0) {
				currTraversalState = this._traverseCIs({
					querySysIds	: childSysIds,
					children: true,
					currEdgeLimit: currTraversalCount,
					result: result,
					transientState: transientState,
					appId: appId,
					configIdentifierId: configIdentifierId,
					endpointDedupeFields: endpointDedupeFields
				});
				childSysIds = currTraversalState[this.NEXT_CIS];
				currTraversalCount -= currTraversalState[this.CURR_EDGE_COUNT];
			}
			if (parentSysIds.length > 0 && currTraversalCount > 0) {
				currTraversalState = this._traverseCIs({
					querySysIds	: parentSysIds,
					children: false,
					currEdgeLimit: currTraversalCount,
					result: result,
					transientState: transientState,
					level: -i,
					appId: appId,
					configIdentifierId: configIdentifierId,
					endpointDedupeFields: endpointDedupeFields
				});
				parentSysIds = currTraversalState[this.NEXT_CIS];
				currTraversalCount -= currTraversalState[this.CURR_EDGE_COUNT];
			}
			if ((parentSysIds.length == 0 && childSysIds.length == 0) || (currTraversalCount <= 0))
				break;
		}
		// Replace rel type sys ids in edges with pretty names
		if (transientState[this.REL_TYPE_IDS].length > 0) {
			this._replaceRelIdsWithNames(transientState[this.REL_TYPE_IDS], result);
		}
		
		// sanitize payload - get rid of dead edges
		this._sanitizePayload(result);

		if (currTraversalCount <= 0) {
			var totalNodeCount = Object.keys(result.ciNodeInfo).length.toString();
			messages.push(this._generateMessageObj({
				severity: this.MESSAGE_SEVERITY.INFO,
				message: gs.getMessage("Maximum display limit reached. Only {0} nodes can be displayed.", totalNodeCount),
				autoDismiss: true
			}));
		}
	},

	_traverseCIs: function(args) {

		var	querySysIds	= args.querySysIds;
		var	children = args.children;
		var	currEdgeLimit = args.currEdgeLimit;
		var	result = args.result;
		var	transientState = args.transientState;
		var	level = args.level;

		var output = {};
		var arrayUtil = this.arrayUtil;
		output[this.NEXT_CIS] = [];
		output[this.CURR_EDGE_COUNT] = 0;
		// Get reference data
		var refData = this._getReferences({
			ciSysIds: querySysIds,
			result: result,
			transientState: transientState,
			appId: args.appId,
			configIdentifierId: args.configIdentifierId
		});
		if (refData[this.REF_CIS].length > 0) {
			arrayUtil.concat(output[this.NEXT_CIS], refData[this.REF_CIS]);
		}
		
		// Update edge limit and check related records if we are still within limit
		currEdgeLimit = currEdgeLimit - refData[this.REF_EDGE_COUNT];
		if (currEdgeLimit > 0) {
			var relData = this._nextHop({
				querySysIds: querySysIds,
				currEdgeLimit: currEdgeLimit,
				children: children,
				excludeRelIds: transientState[this.EXCLUDE_REL_IDS],
				level: level,
				endpointDedupeFields: args.endpointDedupeFields
			});
			// Massage this data
			this._mergeGraph(result[this.EDGES], relData[this.EDGES]);

			// Get rel ids to be excluded
			arrayUtil.concat(transientState[this.EXCLUDE_REL_IDS], relData[this.IDS]);

			// Gather rel type ids
			arrayUtil.concat(transientState[this.REL_TYPE_IDS], relData[this.REL_TYPE_IDS]);

			// Update edge count
			currEdgeLimit = currEdgeLimit - relData[this.NEXT_CIS].length();
			
			// Get next list of CIs to query
			arrayUtil.concat(output[this.NEXT_CIS], relData[this.NEXT_CIS].toArray());
		}


		//count nodes & fetch the details
		if (output[this.NEXT_CIS].length > 0 ) {
			var pThis = this;
			output[this.NEXT_CIS].forEach(function(ci){
				if (!result[pThis.CI_NODE_INFO].hasOwnProperty(ci))
					output[pThis.CURR_EDGE_COUNT] += 1;
			});
			// Merge reference data
			if (refData && refData[this.REF_CIS]) {
				var info = this._fetchAndValidateCis(refData[this.REF_CIS], level);
				if (global.JSUtil.notNil(info) && !this._isEmptyObj(info[this.CURR_NODE_INFO]))
					this._mergeData(result[this.CI_NODE_INFO], info[this.CURR_NODE_INFO]);
			}

			// Merge relationship data
			if (relData && relData[this.CURR_NODE_INFO]) {
				this._mergeData(result[this.CI_NODE_INFO], relData[this.CURR_NODE_INFO]);
			}
		}
		return output;
	},
	
	/**
	 * Get the following relationships that the supplied collection of CIs has from the cmdb_rel_ci table.
	 * @param {*} querySysIds = CI sysIds 
	 * @param {*} currEdgeLimit = Limit of number of CIs to display on the map
	 * @param {*} children = true get the children else parent Cis
	 * @param {*} excludeRelIds = transientState, list of excluded relationship id.
	 * @param {*} level = level at which next set of CIs and relationship will be fetch.
	 * @returns 
	 */
	_nextHop: function(args) {
		var querySysIds = args.querySysIds;
		var currEdgeLimit = args.currEdgeLimit;
		var children = args.children;
		var excludeRelIds = args.excludeRelIds;
		var level = args.level;
		var endpointDedupeFields= args.endpointDedupeFields

		var relData = this._getRelations(querySysIds, currEdgeLimit, excludeRelIds, children);
		relData[this.CURR_NODE_INFO] = {};
		if (relData[this.NEXT_CIS].length() > 0) {
			var tInfo = this._fetchAndValidateCis(relData[this.NEXT_CIS].toArray(), level);
			relData[this.NEXT_CIS].clear();
			var nodeInfo = tInfo[this.CURR_NODE_INFO];
			var sysIds = tInfo[this.VALID_SYS_IDS];
			if (sysIds.length > 0) {
				relData[this.NEXT_CIS].addAll(sysIds);
				// Get rel ids to be excluded
				this.arrayUtil.concat(excludeRelIds, relData[this.IDS]);
				//filter endpoints
				var epSysIds = this._getEndPoints(sysIds, nodeInfo);
				if (epSysIds.length > 0) {
					var inputObj = this._formNextInput(epSysIds, currEdgeLimit, children, excludeRelIds, nodeInfo);
					var mapEpCi = this._excludeEndPoints(inputObj, level);
					this._mapEpCiAndClean(querySysIds, relData, nodeInfo, mapEpCi, endpointDedupeFields);
				}
				relData[this.CURR_NODE_INFO] = nodeInfo;
			}
		}
		return relData;
	},
	/**
	 * Hop recursively and continue exploring until a CI is discovered or the tree's end (leaf endpoint)
	 */
	_excludeEndPoints: function(traversalState, level) {
		if (!this._isEmptyObj(traversalState) && this._hasAllProperty(
			[this.SYS_IDS, this.CURR_EDGE_LIMIT, this.CHILDREN, this.EXCLUDE_REL_IDS, this.NODE_INFO], traversalState)) {

			var sysIds = traversalState[this.SYS_IDS];
			var currEdgeLimit = traversalState[this.CURR_EDGE_LIMIT];
			var children = traversalState[this.CHILDREN];
			var excludeRelIds = traversalState[this.EXCLUDE_REL_IDS];
			var nodeInfo = traversalState[this.NODE_INFO];

			var epRelData = this._getRelations(sysIds, currEdgeLimit, excludeRelIds, children);
			if (epRelData[this.NEXT_CIS].length() > 0) {
				var tInfo = this._fetchAndValidateCis(epRelData[this.NEXT_CIS].toArray(), level);
				var _tmpTransientResult = null;
				var _sysIds = tInfo[this.VALID_SYS_IDS];
				var transientResult = {};
				transientResult[this.BACKTRACK_MAP] = {};
				transientResult[this.ORPHAN_EPS] = [];
				transientResult[this.CI_NODE_INFO] = {};
				
				this._mergeData(nodeInfo, tInfo[this.CURR_NODE_INFO]);
				// Get rel ids to be excluded
				this.arrayUtil.concat(excludeRelIds, epRelData[this.IDS]);
				//get endpoints
				var epSysIds = this._getEndPoints(_sysIds, nodeInfo);

				if (epSysIds.length > 0) {
					var inputObj = this._formNextInput(epSysIds, currEdgeLimit, children, excludeRelIds, nodeInfo);
					_tmpTransientResult = this._excludeEndPoints(inputObj, level);

					if (!this._isEmptyObj(_tmpTransientResult)) {
						transientResult = _tmpTransientResult;
					}
				}
				this._mergeData(transientResult[this.CI_NODE_INFO], nodeInfo);
				this._populateCiEpMap(sysIds, epRelData, transientResult);
				return transientResult;
			}
		}
		return null;
	},
	/**
	 * Fetch cmdb_rel_ci relationships for the given set of Cis and the next Cis to retrieve
	 * @param {*} ciSysIds: Fetch the relationship for ciSysIds
	 * @param {*} limit : max allowed limit.
	 * @param {*} excludedRelIds : List of relationship to exclude.
	 * @param {*} children :
	 * 		true:  return all relationship where provided ciSysIds are parent. 
	 * 		false: return all relationship where provided ciSysIds are child.
	 * @returns : Following result Object
	 * 	result = {
	 *  	ids: [],
	 * 		next_cis: [],
	 * 		edges: [],
	 * 		rel_type_ids: []
	 * }
	 */
	_getRelations: function(ciSysIds, limit, excludedRelIds, children) {
		
		var result = {};
		result[this.IDS] = [];
		result[this.NEXT_CIS] = (new CMDBSet());
		result[this.EDGES] = {};
		result[this.REL_TYPE_IDS] = [];

		if (!ciSysIds || ciSysIds.length == 0 || limit == null || limit <= 0)
			return result;

		var gr = new GlideRecordSecure(this.NODE_MAP_TABLE.CMDB_REL_CI);
		gr.addNotNullQuery(this.COL_PARENT);
		gr.addNotNullQuery(this.COL_CHILD);
		gr.addNotNullQuery(this.TYPE);

		(children ? gr.addQuery(this.COL_PARENT, this.IN_OP, ciSysIds) : gr.addQuery(this.COL_CHILD, this.IN_OP, ciSysIds));
		
		if (excludedRelIds && excludedRelIds.length > 0) {
			gr.addQuery(this.COL_SYS_ID, this.NOTIN_OP, excludedRelIds);
		}
		gr.addQuery(this.TYPE, this.NOTIN_OP, Object.keys(this.REL_TYPE_EXCLUSION)); //filter all the rel type declared in REL_TYPE_EXCLUSION

		gr.setLimit(limit);
		gr.query();
		
		var arrayUtil = this.arrayUtil;
		var sysId = null, parentCi = null, childCi = null, relTypeId = null, port = null;
		var edge = {};
		
		while (gr.next()) {
			sysId = gr.getUniqueValue();
			parentCi = gr.getValue(this.COL_PARENT);
			childCi = gr.getValue(this.COL_CHILD);
			relTypeId = gr.getValue(this.TYPE);
			var createdOn = new GlideDateTime(gr.getValue(this.COL_SYS_CREATED_ON));
			port = gr.getValue(this.PORT);
			var edgeObject = {
				sysId: sysId,
				parent: parentCi,
				child: childCi,
				type: relTypeId,
				port: port,
				isVirtual: false,
				createdOn: createdOn,
				endpoints: []
			};
			edge =  this._newEdge(edgeObject);

			if (arrayUtil.contains(ciSysIds, parentCi)) {
				if (!result[this.EDGES].hasOwnProperty(parentCi)) {
					result[this.EDGES][parentCi] = {};
					result[this.EDGES][parentCi][this.RELATIONS] = [];
				}
				result[this.EDGES][parentCi][this.RELATIONS].push(edge);
			} else {
				result[this.NEXT_CIS].add(parentCi);
			}


			if (arrayUtil.contains(ciSysIds, childCi) && !arrayUtil.contains(ciSysIds, parentCi)) {
				if (!result[this.EDGES].hasOwnProperty(childCi)) {
					result[this.EDGES][childCi] = {};
					result[this.EDGES][childCi][this.RELATIONS] = [];
				}
				result[this.EDGES][childCi][this.RELATIONS].push(edge);
			} else {
				result[this.NEXT_CIS].add(childCi);
			}

			// Collect cmdb_rel_ci sysIds, useful for exclusion clause in subsequent call
			result[this.IDS].push(gr.getUniqueValue());
			result[this.REL_TYPE_IDS].push(relTypeId);
		}
		return result;
	},
	/**
	 * Fill in the backtrack maps for each of the Endpoints => CIs that were discovered.
	 */
	_populateCiEpMap: function(sysIds, relData, transientResult) {
		var backtrackMap = transientResult[this.BACKTRACK_MAP];
		var orphanEPs = transientResult[this.ORPHAN_EPS];
		var nodeInfo = transientResult[this.CI_NODE_INFO];
		var newEpCiMap = {};
		// bare until ES6
		var pThis = this;
				
		//make a map of Ep => Ci
		var _createEpCiMap = function(map, ep, ci) {
			if (!pThis._hasProperty(ep, map))
				map[ep] = {};

			map[ep][ci] = {};
			map[ep][ci][pThis.EP] = [];
			map[ep][ci][pThis.EP].push(ep);
		};

		//shift of Ep => Ci to the current level Ep (aka backtracking via changing key)
		var _shuffleEpCiMap = function(map, fromEp, ciInfoMap) {
			if (!pThis._hasProperty(fromEp, map))
				map[fromEp] = {};
			for (var ci in ciInfoMap) {
				ciInfoMap[ci]['ep'].push(fromEp);
			}
			pThis._mergeData(map[fromEp], ciInfoMap);
		};

		sysIds.forEach(function(ci) {
			if (relData[pThis.EDGES][ci] 
				&& pThis._hasProperty(pThis.RELATIONS, relData[pThis.EDGES][ci])) {

				var tmpRelations = relData[pThis.EDGES][ci][pThis.RELATIONS];
				tmpRelations.forEach(function(edge) {

					var start = ci;
					var end = edge[pThis.CHILD] != ci ? edge[pThis.CHILD] : edge[pThis.PARENT];
					var startNode = nodeInfo[start];
					var endNode = nodeInfo[end];

					// User may not have permission to access one of the endpoint of the edge.
					// start/end node of edge could be missing in nodeInfo due to ACL.
					if(gs.nil(startNode) || gs.nil(endNode))
						return;

					if (startNode.isEndpoint && !endNode.isEndpoint) {
						// type Ep -> Ci
						_createEpCiMap(newEpCiMap, start, end);
					} else if (!startNode.isEndpoint && endNode.isEndpoint){
						// type Ci -> Ep
						_createEpCiMap(newEpCiMap, end, start);
					} else {
						// type Ep -> Ep
						if (pThis._hasProperty(start, backtrackMap)) {
							_shuffleEpCiMap(newEpCiMap, end, backtrackMap[start]);
							global.JSUtil.removeFromMap(backtrackMap, [start]);
						} else if (pThis._hasProperty(end, backtrackMap)) {
							_shuffleEpCiMap(newEpCiMap, start, backtrackMap[end]);
							global.JSUtil.removeFromMap(backtrackMap, [end]);
						} else {
							orphanEPs.push(end);
						}
					}
				});
			}
		});
		
		//merge newEpCiMap to backtrackMap
		for (var newEp in newEpCiMap) {
			if (!this._hasProperty(newEp, backtrackMap)) {
				backtrackMap[newEp] = {};
			}
			this._mergeData(backtrackMap[newEp], newEpCiMap[newEp]);
		}
	},
	/**
	 * This method is in charge of creating an Endpoint edge from the original 
	 * collection of Ci => Ep edges discovered, retrieving the relevant CI, and mapping it.
	 * From: Ci => Ep => Ep => Ci
	 * To: Ci => Ci
	 */
	_mapEpCiAndClean: function(sysIds, relData, nodeInfo, mapEpCi, endpointDedupeFields) {

		var epTypeId = [];
		var backTrackMap = {};
		var orphanEPs = [];
		if (!this._isEmptyObj(mapEpCi)) {
			backTrackMap = mapEpCi[this.BACKTRACK_MAP];
			orphanEPs = mapEpCi[this.ORPHAN_EPS];
		}
		// bare until ES6
		var pThis = this;
		var nameProp = this._getPropLabel(this.COL_NAME);

		var populateEndpoints = function(epArr){
			var epNames = [];
			var _len = epArr.length;
			var ep = null;
			for (var i = _len - 1; i >= 0; i -= 1) {
				ep = epArr[i];
				if (ep && pThis._hasProperty(ep, nodeInfo)) {
					epNames.push(nodeInfo[ep][nameProp]);
				}
			}
			return epNames;
		};
		var generateEdgeDedupKey = function(edge, endpointDedupeFields) {
			if(gs.nil(endpointDedupeFields) || endpointDedupeFields.length == 0) {
				endpointDedupeFields = Object.keys(edge);
			}
			var edgeDedupKey = '';
			for(var i=0; i<endpointDedupeFields.length; i++) {
				if(i>0) {
					edgeDedupKey += ':';
				}
				var fieldValue = edge[endpointDedupeFields[i]];
				edgeDedupKey += Array.isArray(fieldValue) ? fieldValue.join('-') : fieldValue;
			}
			return edgeDedupKey;
		};
		sysIds.forEach(function(fromCi) {
			if (pThis._hasProperty(fromCi, relData[pThis.EDGES]) 
				&& pThis._hasProperty(pThis.RELATIONS, relData[pThis.EDGES][fromCi])) {
				var edges = relData[pThis.EDGES][fromCi][pThis.RELATIONS];
				var edgeMap = {};
				edges.forEach(function(edge) {
					var parent = edge[pThis.PARENT];
					var child = edge[pThis.CHILD];
					var ciMap = null, tEdge = null, epArr = null, tEdgeSysId = null;
					var endpoint = ((pThis._hasProperty(parent, nodeInfo) && nodeInfo[parent].isEndpoint) ? 
									parent : (pThis._hasProperty(child, nodeInfo) && nodeInfo[child].isEndpoint) ? child : null);
					
					if (pThis._hasProperty(endpoint, backTrackMap)) {
						ciMap = backTrackMap[endpoint];
						for (var toCi in ciMap) {
							epArr = populateEndpoints(ciMap[toCi][pThis.EP]);
							tEdge = null, tEdgeSysId = null;
							if (parent == endpoint) {
								tEdgeSysId = pThis._generateEdgeSysId(toCi, fromCi, edge[pThis.ID]);
								tEdge = pThis._newEdge({
									sysId: tEdgeSysId,
									parent: toCi,
									child: fromCi,
									type: pThis.VIR_CONNECTION,
									port: edge[pThis.PORT],
									isVirtual: true,
									createdOn: null,
									endpoints: epArr
								});
							} else {
								tEdgeSysId = pThis._generateEdgeSysId(fromCi, toCi, edge[pThis.ID]);
								tEdge = pThis._newEdge({
									sysId: tEdgeSysId,
									parent: fromCi,
									child: toCi,
									type: pThis.VIR_CONNECTION,
									port: edge[pThis.PORT],
									isVirtual: true,
									createdOn: null,
									endpoints: epArr
								});
							}
							relData[pThis.NEXT_CIS].add(toCi);
							edgeMap[generateEdgeDedupKey(tEdge, endpointDedupeFields)] = tEdge;
						}
						//add the Cis for next iteration & label the connection as virtual
						epTypeId.push(edge[pThis.REL_TYPE]);
					}
					if (global.JSUtil.notNil(endpoint)){
						orphanEPs.push(endpoint);
					}
				});
				var edgesArr = [];
				Object.keys(edgeMap).forEach(function(edgeKey) {
					edgesArr.push(edgeMap[edgeKey]);
				});
				pThis.arrayUtil.concat(relData[pThis.EDGES][fromCi][pThis.RELATIONS], edgesArr);
			}
		});
		//remove Ci -> Ep cmdb_rel IDs
		relData['relTypeIds'] = relData['relTypeIds'].filter(function(typeId) {
			return !pThis.arrayUtil.contains(epTypeId, typeId);
		});
		//remove Ep from nextCis list
		relData[this.NEXT_CIS].forEach(function(nextCi) {
			if (pThis.arrayUtil.contains(orphanEPs, nextCi)) {
				relData[pThis.NEXT_CIS].remove(nextCi);
			}
		});
		//remove Eps from nodeInfo
		global.JSUtil.removeFromMap(nodeInfo, this.arrayUtil.concat(Object.keys(backTrackMap), orphanEPs));
	},
	
	_getEndPoints: function(sysIds, nodeInfo) {
		var epSysIds = sysIds.filter(function(sysId) {
			return (nodeInfo.hasOwnProperty(sysId) && nodeInfo[sysId]['isEndpoint']);
		});
		return epSysIds;
	},

	_formNextInput: function(sysIds, currEdgeLimit, children, excludeRelIds, nodeInfo){
		var _tmpInput = {};
		_tmpInput[this.SYS_IDS] = sysIds;
		_tmpInput[this.CURR_EDGE_LIMIT] = currEdgeLimit;
		_tmpInput[this.CHILDREN] = children;
		_tmpInput[this.EXCLUDE_REL_IDS] = excludeRelIds;
		_tmpInput[this.NODE_INFO] = nodeInfo;
		return _tmpInput;
	},

	_isEndPoint: function(ciClass) {
		return this.arrayUtil.contains(this.ENDPOINT_CLASSES, ciClass);
	},

	_fetchAndValidateCis: function(sysIds, level, skipLifeCycleCheck) {
		if (global.JSUtil.nil(sysIds) || sysIds.length == 0)
			return null;
		var output = {};
		var currNodeInfo = this._getCINodeInfo(sysIds, level, skipLifeCycleCheck);
		var validSysIds = this._sanitizeCiSysIds(currNodeInfo, sysIds);
		output[this.CURR_NODE_INFO] = currNodeInfo;
		output[this.VALID_SYS_IDS] = validSysIds;
		return output;
	},

	_sanitizePayload: function(result) {
		var pScope = this;
		var nodeInfo = result[this.CI_NODE_INFO];
		var arrayUtil = this.arrayUtil;
		//remove endpoints nodes || isEndpoint prop from node object
		for(ci in result[this.CI_NODE_INFO]) {
			if (result[this.CI_NODE_INFO][ci][this.IS_ENDPOINT])
				global.JSUtil.removeFromMap(result[this.CI_NODE_INFO], [ci]);
			else
				global.JSUtil.removeFromMap(result[this.CI_NODE_INFO][ci], [this.IS_ENDPOINT]);
		}
		for (var ci in result[this.EDGES]) {
			if (this._hasProperty(this.RELATIONS, result[this.EDGES][ci])) {
				result[this.EDGES][ci][this.RELATIONS] = result[this.EDGES][ci][this.RELATIONS].filter(function(edge) {
					return (pScope._hasProperty(edge[pScope.PARENT], nodeInfo) 
							&& pScope._hasProperty(edge[pScope.CHILD], nodeInfo));
				});
				arrayUtil.concat(result[this.CI_NODE_INFO][ci][this.CONNECTIONS], 
					result[this.EDGES][ci][this.RELATIONS]);
			}  
			if (result[this.EDGES][ci].hasOwnProperty(this.REFERENCES)){
				arrayUtil.concat(result[this.CI_NODE_INFO][ci][this.CONNECTIONS], 
					result[this.EDGES][ci][this.REFERENCES]);
			}
		}
		global.JSUtil.removeFromMap(result, [this.EDGES]);
	},

	_getLocationInfo: function(sysIds, label) {
		var result = {};
		if (sysIds == null || sysIds.length === 0) {
			return result;
		}
		var gr = new GlideRecordSecure(this.NODE_MAP_TABLE.CMN_LOCATION);
		gr.addQuery(this.COL_SYS_ID, this.IN_OP, sysIds);
		gr.query();
		while(gr.next()) {
			location = {};
			location[this.LABEL] = label;
			location[this.COL_NAME] = gr.getValue(this.COL_NAME);
			location[this.CITY] =  gr.getValue(this.CITY);
			result[gr.getUniqueValue()] = location;
		}
		return result;
	},

	getLifeCycleStageInclusionList: function(mode, appId, configIdentifierId) {
		if(!mode) {
			return "";
		}
		var lifeCycleStageList = this.LIFE_CYCLE_STAGE_INCLUSION_LIST;
		if (gs.nil(lifeCycleStageList)) {
			lifeCycleStageList =  this._getLifeCycleStageInclusionListFromDB({
				mode: mode,
				appId: appId,
				configIdentifierId: configIdentifierId
			});
		}
		return lifeCycleStageList;
	},

	getSuggestedRelationshipsByCi: function(args) {
		var suggestedRelationships = [];
		// If parent or child is unavailable, we cannot evaluate suggested relationships.
		// This is not neccessarily an error, and the user can still choose any relationship.
		if(gs.nil(args)) {
			return suggestedRelationships;
		}
		var parentCi = args.parentCi;
		var childCi = args.childCi;
		if(gs.nil(parentCi) || gs.nil(childCi)) {
			return suggestedRelationships;
		}
		var ciGr = new GlideRecord(this.CMDB_CI);
		var parentCiClass;
		if(ciGr.get(parentCi)) {
			parentCiClass = ciGr.getValue(this.SYS_CLASS_NAME);
		}
		var childCiClass;
		if(ciGr.get(childCi)) {
			childCiClass = ciGr.getValue(this.SYS_CLASS_NAME);
		}
		return this.getSuggestedRelationships({
			parentCiClass: parentCiClass,
			childCiClass: childCiClass
		});
	},
	getSuggestedRelationships: function(args) {
		var suggestedRelationships = [];
		// If parent or child is unavailable, we cannot evaluate suggested relationships.
		// This is not neccessarily an error, and the user can still choose any relationship.
		if(gs.nil(args)) {
			return suggestedRelationships;
		}
		var parentCiClass = args.parentCiClass;
		var childCiClass = args.childCiClass;
		if(gs.nil(parentCiClass) || gs.nil(childCiClass)) {
			return suggestedRelationships;
		}
		var table = new GlideTableHierarchy(parentCiClass); 
		var parentClassHierarchy = table.getTables();
		table = new GlideTableHierarchy(childCiClass); 
		var childClassHierarchy = table.getTables();
		
		var sugRelQuery = 
			this.SUGGESTED_RELATIONSHIPS.COL_BASE_CLASS + "IN" + parentClassHierarchy.join(this.COMMA_DELIMITER) + "^" +
			this.SUGGESTED_RELATIONSHIPS.COL_DEPENDENT_CLASS + "IN" + childClassHierarchy.join(this.COMMA_DELIMITER) + "^" +
			this.SUGGESTED_RELATIONSHIPS.COL_PARENT + "=true^" +
			"NQ" +
			this.SUGGESTED_RELATIONSHIPS.COL_BASE_CLASS + "IN" + childClassHierarchy.join(this.COMMA_DELIMITER) + "^" + 
			this.SUGGESTED_RELATIONSHIPS.COL_DEPENDENT_CLASS + "IN" + parentClassHierarchy.join(this.COMMA_DELIMITER) + "^" +
			this.SUGGESTED_RELATIONSHIPS.COL_PARENT + "=false";
		var sugRelGr = new GlideRecord(this.SUGGESTED_RELATIONSHIPS.TABLE);
		sugRelGr.addEncodedQuery(sugRelQuery);
		sugRelGr.addQuery(this.SUGGESTED_RELATIONSHIPS.COL_REL_TYPE, this.NOTIN_OP, Object.keys(this.REL_TYPE_EXCLUSION)); //filter all the rel type declared in REL_TYPE_EXCLUSION
		sugRelGr.query();
		
		while(sugRelGr.next()) {
			// Remove duplicates that may have been encountered as part of hierarchy
			var relationshipType = sugRelGr.getValue('cmdb_rel_type');
			if(suggestedRelationships.indexOf(relationshipType) === -1) {
				suggestedRelationships.push(relationshipType);
			}
		}
		return suggestedRelationships;
	},
	_getLifeCycleStageInclusionListFromDB: function(args){
		var mode = args.mode;
		var lifeCycleStageInclusionList;
		var requestObject  = {
			appId: args.appId,
			configId: args.configIdentifierId,
			table: this.NODE_MAP_TABLE.OPERATIONAL_LIFE_CYCLE_FOR_UNIFIED_MAP
		};
		var gr = this.configUtil.getApplicationConfigTable(requestObject);
		while(gr.next()) {
			if(gr.getValue(this.COL_MODE) === mode) {
				lifeCycleStageInclusionList = gr.getValue(this.COL_LIFE_CYCLE_STAGE_LIST);
				break;
			}
		}
		
		var nonTranslatedLifeCycleStageNames = [];
		var grLifeCycle = new GlideRecord(this.LIFE_CYCLE_STAGE_TABLE);
		grLifeCycle.addQuery(this.COL_SYS_ID, this.IN_OP, lifeCycleStageInclusionList);
		grLifeCycle.query();
		while(grLifeCycle.next()){
			nonTranslatedLifeCycleStageNames.push(grLifeCycle.getValue(this.COL_NAME));
		}
		return nonTranslatedLifeCycleStageNames.join(this.COMMA_DELIMITER);
	},
	
	_getUserInfo: function(sysIds) {
		return this._getCommon(sysIds, this.NODE_MAP_TABLE.SYS_USER);
	},
	
	_getRelTypeInfo: function(sysIds) {
		return this._getCommon(sysIds, this.NODE_MAP_TABLE.CMDB_REL_TYPE);
	},
	
	_getCommon: function(sysIds, tableName) {
		var result = {};
		if (sysIds == null || sysIds.length === 0) {
			return result;
		}
		var gr = new GlideRecordSecure(tableName);
		gr.addQuery(this.COL_SYS_ID, this.IN_OP, sysIds);
		gr.query();
		while(gr.next()) {
			result[gr.getUniqueValue()] = gr.getDisplayValue();
		}
		return result;
	},
	
	// Merges data from arg2 into arg1. Please note that this is for the use case 
	// when keys are unique, otherwise the key in arg1 will be overwritten
	_mergeData: function(arg1, arg2) {
		for (var name in arg2)
			arg1[name] = arg2[name];
	},
	
	_mergeGraph: function(endGraph, appendGraph) {
		var arrayUtil = this.arrayUtil;
		for(var ciSysId in appendGraph) {
			if (endGraph.hasOwnProperty(ciSysId)) {
				if (endGraph[ciSysId].hasOwnProperty(this.RELATIONS))
					arrayUtil.concat(endGraph[ciSysId][this.RELATIONS], appendGraph[ciSysId][this.RELATIONS]);
				else 
					endGraph[ciSysId][this.RELATIONS] = appendGraph[ciSysId][this.RELATIONS];
			} else {
				endGraph[ciSysId] = {};
				endGraph[ciSysId][this.RELATIONS] = appendGraph[ciSysId][this.RELATIONS];
			}
		}
	},

	_replaceRelIdsWithNames: function(relTypeIds, result) {
		// Get Rel Type Data
		// This is map of rel type ids to name {"guid1": "Runs on::Runs", "guid2": "Depends on::Used By"}
		var cacheKey = "rel_type_id_name_map";
		var strCachedMap = this._cacheGet(cacheKey);
		var cachedMap = null, relTypeInfo = {};
		var newRelIds = [];
		var pThis = this;
		//cache get & put logic
		if (global.JSUtil.nil(strCachedMap)) {
			relTypeInfo =  this._getRelTypeInfo(relTypeIds);
		} else {
			cachedMap = JSON.parse(strCachedMap);
			newRelIds = relTypeIds.filter(function(relTypeId) {
				return !pThis._hasProperty(relTypeId, cachedMap);
			});
			if (newRelIds.length > 0)
				relTypeInfo =  this._getRelTypeInfo(newRelIds);
			this._mergeData(relTypeInfo, cachedMap);
		}
		this._cachePut(cacheKey, JSON.stringify(relTypeInfo));
		// Update results to replace with name
		for (var ciId in result[this.EDGES]) {
			if (result[this.EDGES][ciId].hasOwnProperty(this.RELATIONS)) {
				
				var relObjArray = result[this.EDGES][ciId][this.RELATIONS];
				for (var relCount = 0; relCount < relObjArray.length; relCount++) {
					var relId = relObjArray[relCount][this.REL_TYPE];
					var relName = relTypeInfo[relId];
					if (!global.JSUtil.nil(relName))
						relObjArray[relCount][this.REL_TYPE] = relName;
				}
				result[this.EDGES][ciId][this.RELATIONS] = relObjArray;
			}
		}
		return result;
	},

	_replaceLocationAndUserNames: function(ciNodeInfo) {
		// Append location and owner details
		var locationSysIds = [];
		var userSysIds = [];
		var layerClasses = new CMDBSet();
		var ciClass = '';
		var locationPropKey = this.COL_LOCATION;
		var ownedByPropKey = this.COL_OWNED_BY;
		var tableName = this.SYS_CLASS_NAME;
		var ciIconMap = this._getIconFromMappingTable();

		for (var sysId in ciNodeInfo) {
			locationSysIds.push(ciNodeInfo[sysId][this.PROPERTIES][locationPropKey].value);
			userSysIds.push(ciNodeInfo[sysId][this.PROPERTIES][ownedByPropKey].value);
			ciClass = ciNodeInfo[sysId][this.PROPERTIES][tableName].value;
			var node = ciNodeInfo[sysId];
			var nodeClass = node.properties[this.SYS_CLASS_NAME].value;

			//add the Ci's & its parent classes
			if (!layerClasses.has(nodeClass))
				layerClasses.addAll(new GlideTableHierarchy(ciClass).getTables());
			
			//add icon property to the node
			if (ciIconMap[nodeClass] && ciIconMap[nodeClass][this.ICON]) {
				node.icon = ciIconMap[nodeClass][this.ICON];
			} else {
				node.icon = this._getClassDefaultIcon(ciClass); //default icon
			}	
		}
		
		var locationInfo = this._getLocationInfo(locationSysIds, ciNodeInfo[sysId][this.PROPERTIES][locationPropKey].label);
		var userInfo = this._getUserInfo(userSysIds);
		var classLayerMap = this._getClassLayers(layerClasses);
		var location = '';
		var ownedBy = '';
		// Update CI node info with display names
		for (var ciId in ciNodeInfo) {
			location = locationInfo[ciNodeInfo[ciId][this.PROPERTIES][locationPropKey].value];
			ciNodeInfo[ciId][this.PROPERTIES][locationPropKey] = global.JSUtil.nil(location) ? this._getPropWithLabelValue(ciNodeInfo[ciId][this.PROPERTIES][locationPropKey].label, "") : location;
			ownedBy = userInfo[ciNodeInfo[ciId][this.PROPERTIES][ownedByPropKey].value];
			ciNodeInfo[ciId][this.PROPERTIES][ownedByPropKey] = this._getPropWithLabelValue(ciNodeInfo[ciId][this.PROPERTIES][ownedByPropKey].label, global.JSUtil.nil(ownedBy) ? '' : ownedBy);
			ciNodeInfo[ciId][this.COL_LAYER] = classLayerMap[ciNodeInfo[ciId][this.PROPERTIES][this.SYS_CLASS_NAME].value];
		}
		return ciNodeInfo;
	},

	//fetches icons for CI classes by querying mapping tables.
	_getIconFromMappingTable: function() {
		var cacheKey = 'CI_ICON_DATA';
		var iconData = this._cacheGet(cacheKey);
		var classToIconMap = {};
		if (global.JSUtil.nil(iconData)) {
		var mappingGr = new GlideRecord(this.CMDB_CLASS_ICON_MAPPING);
			mappingGr.query();
			while (mappingGr.next()) {
				var tableName = mappingGr.table_name.name;
				var refRecord = mappingGr.icon.getRefRecord();
				if (refRecord.getValue(this.ICON_NAME_COLUMN)){
					classToIconMap[tableName] = {
						'icon': refRecord.getValue(this.ICON_NAME_COLUMN)
					};
				}
			}
			this._cachePut(cacheKey, JSON.stringify(classToIconMap));
		} else {
			classToIconMap = JSON.parse(iconData);
		}
		return classToIconMap;
	},

	_getClassDefaultIcon: function(ciClass) {
		//TODO: temp pre-release hack; will remove before GA
		if (ciClass) {
			switch (ciClass) {
				case 'cmdb_ci_apache_web_server':
				case 'cmdb_ci_app_server_websphere':
				case 'cmdb_ci_microsoft_iis_web_server':
					return 'globe-outline';
				case 'cmdb_ci_app_server_ws_ear':
					return 'puzzle-outline';
				case 'cmdb_ci_appl_generic':
				case 'cmdb_ci_appl_sp_service':
					return 'gear-outline';
				case 'cmdb_ci_appl_sharepoint':
					return 'square-s-fill';
				case 'cmdb_ci_application_cluster':
					return 'grid-four-outline';
				case 'cmdb_ci_business_app':
					return 'bag-outline';
				case 'cmdb_ci_db_mssql_instance':
				case 'cmdb_ci_db_mssql_integration':
					return 'database-outline';
				case 'cmdb_ci_db_ora_instance':
					return 'plug-outline';
				case 'cmdb_ci_directory_ha':
				case 'cmdb_ci_lb_service':
					return 'tree-workflow-outline';
				case 'cmdb_ci_exchange_frontend':
					return 'envelope-outline';
				case 'cmdb_ci_iisdirectory':
					return 'folder-outline';
				case 'cmdb_ci_linux_server':
				case 'cmdb_ci_service_discovered':
					return 'tree-outline';
				case 'cmdb_ci_windows_server':
					return 'tree-outline';
				default:
					return 'configuration-item-outline';
			}
		}
	},
	
	_sanitizeCiSysIds: function(ciNodeInfo, querySysIds) {
		var result = [];
		for (var i = 0; i < querySysIds.length; i++) {
			var ci = querySysIds[i];
			if (ciNodeInfo.hasOwnProperty(ci)) {
				result.push(ci);
			}
		} 
		return result;
	},

	_getClassLayers: function(layerClasses) {
		var ciClassLayerMap = {};
		var formClasLayer = function(ciClass, layer, includeChild) {
			ciClassLayerMap[ciClass] = layer;
			//if asked, add the child classes
			if (includeChild == '1') {
				var tables = new GlideTableHierarchy(ciClass);
				tables.getTableExtensions().forEach(function (childClass) {
					ciClassLayerMap[childClass] = layer;
				});
			}
		};
		var gr = new GlideRecordSecure(this.NODE_MAP_TABLE.CMDB_LAYER);
		gr.addQuery(this.COL_CLASS, this.IN_OP, layerClasses.toArray());
		gr.query();
		while (gr.next()) {
			formClasLayer(gr.getValue(this.COL_CLASS), gr.getElement(this.COL_LAYER).toString(),
							gr.getValue(this.COL_INCLUDE_CHILD));
		}
		return ciClassLayerMap;
	},

	_generateEdgeSysId: function(parent, child, edgeId){
		var edgeSysId = parent + "_" + edgeId + "_" + child;
		return this._generateMD5Hex(edgeSysId);
	},


	_getProfileData: function(inputTable, result, appId, configIdentifierId){
		result[this.CI_PROFILE_INFO] = {}; //In case customer deletes all OOB records
		var inputClassHierarchy = new GlideTableHierarchy(inputTable).getTables();

		var requestObject  = {
			appId: appId,
			configId: configIdentifierId,
			table: this.NODE_MAP_TABLE.NODE_MAP_CI_PROFILE
		};

		var profileGr = this.configUtil.getApplicationConfigTable(requestObject);
		var profileInfo = {};

		while (profileGr.next()) {
			var table = profileGr.getValue(this.COL_CMDB_CI_CLASS);
			if(inputClassHierarchy.indexOf(table) == -1) {
				continue;
			}
			profileInfo[table] = {};
			profileInfo[table][this.LAYERS] = profileGr.getValue(this.COL_LAYERS);
			profileInfo[table][this.LAYOUT] = profileGr.getValue(this.COL_ORIENTATION);
			profileInfo[table][this.SHARED_PRESET_ID] = profileGr.getValue(this.COL_SHARED_PRESET);
			if(inputTable == table){
				break;
			}
		}

		for(var i=0; i<inputClassHierarchy.length; i++) {
			var sysClass = inputClassHierarchy[i];
			if(global.JSUtil.notNil(profileInfo[sysClass])){
				result[this.CI_PROFILE_INFO][sysClass] = {};
				result[this.CI_PROFILE_INFO][sysClass][this.LAYOUT] = profileInfo[sysClass][this.LAYOUT];
				result[this.CI_PROFILE_INFO][sysClass][this.LAYERS] = this._getDefaultLayerJson();
				result[this.CI_PROFILE_INFO][sysClass][this.SHARED_PRESET_ID] = profileInfo[sysClass][this.SHARED_PRESET_ID];

				var selectedLayers = profileInfo[sysClass][this.LAYERS].split(',');
				for(var j=0; j<selectedLayers.length; j++){
					result[this.CI_PROFILE_INFO][sysClass][this.LAYERS][selectedLayers[j].trim()] = true;
				}
				break;
			}
		}
	},

	_fixGroupEdges: function(result) {
		var memberToGroupMap = {};
		// Find groups and members
		for( var id in result[this.CI_NODE_INFO]) {
			if(result[this.CI_NODE_INFO][id][this.IS_GROUP])
				this._getMemberToGroup(id, result[this.CI_NODE_INFO][id], memberToGroupMap);
		}
		
		this._reparentRecursiveGroup(memberToGroupMap);
		// Redirect incoming edges on members from other nodes to their respective groups
		for( var id in result[this.CI_NODE_INFO]) {
			var currConns = result[this.CI_NODE_INFO][id][this.CONNECTIONS];
			for(var c in currConns) {
				var memberId = currConns[c][this.CHILD];
				if(memberToGroupMap.hasOwnProperty(memberId) && this.VALID_GROUP_LABELS.indexOf(currConns[c][this.REL_TYPE].toLowerCase()) < 0 ) {
					currConns[c]['originalTargetId'] = memberId;
					currConns[c][this.CHILD] = memberToGroupMap[memberId];
				}
			}
		}
	},

	_getMemberToGroup : function(groupId, groupNode, memberToGroupMap) {
		for(var i=0; i < groupNode[this.CONNECTIONS].length; i++) {
			if(this.VALID_GROUP_LABELS.indexOf(groupNode[this.CONNECTIONS][i][this.REL_TYPE].toLowerCase()) > -1)
				memberToGroupMap[groupNode[this.CONNECTIONS][i][this.CHILD]] = groupId;
		}
	},

	_reparentRecursiveGroup : function(memberToGroupMapLocal) {
		if(!memberToGroupMapLocal)
			return;
		var replacements = {};
		var groups = [];
		for(var k in memberToGroupMapLocal)
			groups.push(memberToGroupMapLocal[k]);
			
		groups.forEach(function(g) {
			if(memberToGroupMapLocal.hasOwnProperty(g))
				replacements[g] = memberToGroupMapLocal[g];
		});

		for (var g in memberToGroupMapLocal) {
			if(replacements.hasOwnProperty(memberToGroupMapLocal[g]))
				memberToGroupMapLocal[g] = replacements[memberToGroupMapLocal[g]];
		}

	},

	_addSharedPresetInfo: function(mapOutput, appId, configIdentifierId) {
		var grSharedPreset = this.configUtil.getApplicationConfigTable({
			appId: appId,
			configId: configIdentifierId,
			table: this.NODE_MAP_TABLE.SHARED_PRESET
		});
		var sharedPreset = {};
		var sharedPresets = [];
		while (grSharedPreset.next()) {
			var current = {};
			current[this.ID] = grSharedPreset.getValue(this.COL_SYS_ID);
			current[this.LABEL] = grSharedPreset.getValue(this.COL_NAME);
			current[this.UNCHECKED] =  JSON.parse(grSharedPreset.getValue(this.COL_UNCHECKED_FILTER_LIST));
			sharedPresets.push(current);
		}
		sharedPreset.list = sharedPresets;
		mapOutput[this.RESULT][this.SHARED_PRESETS] = sharedPreset;
	},

	type: 'MapService'
});
