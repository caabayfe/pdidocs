var MapBase = Class.create();
MapBase.prototype = {
initialize: function() {},

	ID: 'id',
	PARENT: 'sourceId',
	CHILD: 'targetId',
	PORT: 'port',
	CHILDREN: 'children',
	TYPE: 'type',
	REL_TYPE: '_label',
	EDGES: 'edges',
	RELATIONS: 'relations',
	REFERENCES: 'references',
	SYS_CLASS_NAME: 'sys_class_name',
	CLASS: 'Class',
	NEXT_CIS: 'nextCis',
	IDS: 'ids',
	SYS_IDS: 'sysIds',
	REL_TYPE_IDS: 'relTypeIds',
	IN_OP: 'IN',
	NOTIN_OP: 'NOT IN',
	COUNT: 'COUNT',
	LABEL: 'label',
	VALUE: "value",
	INTERNAL_ID: "internal_id",
	REF_CI_VISITED: 'refCiVisited',
	RELATED_LIST_EXCLUDED_ITEMS_USR_PREF_KEY: 'sn.cmdb.ws.node.map.user.excluded.rel.items',
	RELATED_LIST_SORT_ORDER_USR_PREF_KEY: 'sn.cmdb.ws.node.map.user.sort.order.rel.items',
	RELATED_LIST_USR_PREF_KEY: 'sn.cmdb.ws.node.map.user.excluded.rel.items',
	COMMA_DELIMITER: ',',
	CMDB_CI: 'cmdb_ci',
	CMDB_CI_ENDPOINT: 'cmdb_ci_endpoint',
	VIR_CONNECTION: "Endpoint Connection",
	MAP_INFO: 'mapInfo',
	SERVICE_MAP_INFO: 'serviceMapInfo',
	CI_NODE_INFO: 'ciNodeInfo',
	NODE_INFO: 'nodeInfo',
	CURR_NODE_INFO: 'currNodeInfo',
	CURR_EDGE_COUNT: 'currentEdgeCount',
	CURR_EDGE_LIMIT: 'currEdgeLimit',
	REF_EDGE_COUNT: 'refEdgeCount',
	VALID_SYS_IDS: 'validSysIds',
	REF_CIS: 'refCis',
	EXCLUDE_REL_IDS: 'excludedRelIds',
	BACKTRACK_MAP: 'backtrackMap',
	ORPHAN_EPS: 'orphanEPs',
	TABLE_NAME: 'tableName',
	EP: 'ep',
	IS_ENDPOINT: 'isEndpoint',
	IS_GROUP: 'isGroup',
	CI_COL_META_DATA: 'ciColMetadata',
	IS_VIR_CONN: 'isVirtualConnection',
	ENDPOINTS: 'endpoints',
	TABLENAME: 'tableName',
	TABLELABEL: 'tableLabel',
	REFFIELD: 'referenceField',
	SORT_DESC: 'desc',
	SUCCESS: 'success',
	ERROR: 'error',
	RESULT: 'result',
	CI_LIST: 'ciList',
	SORT_DIR: 'sortDir',
	SORT_FIELD: 'sortField',
	START_INDEX: 'startIndex',
	END_INDEX: 'endIndex',
	LBL_LAYER: gs.getMessage('Layer'),
	LAYOUT: 'layout',
	LAYERS: 'layers',
	CI_PROFILE_INFO: 'ciProfileInfo',
	ALL_NODES: 'allNodes',
	CREATED: "Created",
	NAME: "Name",
	MAP_TYPE: "mapType",
	MAP_TYPE_DEP: "dependency",
	MAP_TYPE_SVC_INSTANCE: "service_instance",

	COL_SYS_ID: 'sys_id',
	COL_CI_CLASS: 'ci_class',
	COL_REF_CI_CLASS: 'referenced_ci_class',
	COL_REF_FIELD: 'reference_field',
	COL_SHOW_REVERESE: 'show_reverse',
	COL_CMDB_CLASS_NAME: 'cmdb_class_name',
	COL_ATTRIBUTES: "attributes",
	COL_FOLLOW_HIERARCHY: "follow_hierarchy",
	COL_NAME: 'name',
	COL_LOCATION: 'location',
	COL_OWNED_BY: 'owned_by',
	COL_SYS_UPDATED_ON: 'sys_updated_on',
	COL_DISCOVERY_SOURCE: 'discovery_source',
	COL_LAST_DISCOVERED: 'last_discovered',
	COL_TABLE: 'table',
	COL_CONDITIONS: 'conditions',
	COL_FIELDS: 'fields',
	COL_ORDER: 'order',
	COL_LAYER: 'layer',
	COL_UNCHECKED_FILTER_LIST: 'unchecked_filter_list',
	COL_SHARED_PRESET: 'shared_preset',
	COL_CLASS: 'class',
	COL_INCLUDE_CHILD:'include_child',
	COL_PARENT: 'parent',
	COL_CHILD: 'child',
	COL_CMDB_CI_CLASS: 'cmdb_ci_class',
	COL_ORIENTATION: 'orientation',
	COL_LAYERS: 'layers',
	COL_TITLE_FIELD: 'title_field',
	COL_NUMBER_FIELD: 'number_field',
	COL_FOOTER_FIELD: 'footer_field',
	COL_SORT_FIELDS:  'sort_fields',
	COL_LINK_DESTINATION: 'link_destination',
	COL_ACTIVE: 'active',
	COL_CONFIG_IDENTIFIER_ID: 'config_identifier_id',
	COL_SYS_CREATED_ON: 'sys_created_on',
	COL_DATE_FIELD: 'date_field',
	COL_END_DATE_FIELD: 'end_date_field',
	COL_TIMELINE_ICON: 'icon',
	COL_TIMELINE_HIGHLIGHT_FIELD: 'highlight_field',
	COL_MODE: 'mode',
	COL_LIFE_CYCLE_STAGE: 'life_cycle_stage',
	COL_LIFE_CYCLE_STAGE_LIST: 'life_cycle_list',
	COL_CI_ID: 'ci_id',
	COL_SERVICE_ID: 'service_id',
	TIMELINE_LEGEND_CATEGORY: 'timeline_legend_category',
	ENDPOINT_DEDUP_PROP: 'unifiedmap.map_search_filter.endpoint_deduplication_fields',
	MAX_NODE_PROP: 'unifiedmap.map_search.max_nodes',
	ARIA_LABEL: "ariaLabel",
	SHARED_PRESETS: 'sharedPresets',
	SHARED_PRESET_ID: 'sharedPresetId',
	UNCHECKED: "unchecked",
	MESSAGES: "messages",
	SEVERITY: "severity",
	MESSAGE: "message",
	MESSAGE_SEVERITY: {
		INFO: 'info',
		CRITICAL: 'critical',
		WARNING: 'warning'
	},

	DEF_MAX_NODE_VAL: '250',
	DEF_MAX_LEVEL: 25,

	REL_TYPE_EXCLUSION: {
		"85d98503ff100200d699ffffffffff8c" : "Applicative Flow To::Applicative Flow From"
	},

	PROPERTIES: 'properties',
	CONNECTIONS: 'connections',
	SYSID: 'sysId',
	IS_REF: 'isReference',
	RELATED_ITEM_CATEGORY_SYS_ID: 'relatedItemCategorySysId',
	CMDB_CLASS_ICON: 'sn_cmdb_ws_class_icon',
	CMDB_CLASS_ICON_MAPPING: 'sn_cmdb_ws_class_icon_mapping',
	CI_TYPE: 'ci_type',
	ICON_NAME: 'icon_name',
	ICON: 'icon',
	AUTO_DISMISS: 'autoDismiss',
	IMAGE: 'image',
	DEFAULT_ICON: 'configuration-item-outline',
	FIXED_LAYER: 'fixedLayer',
	VALID_GROUP_LABELS: ['inclusion','cluster'],
	CITY: "city",
	ICON_NAME_COLUMN: "icon_name",
	TABLE_NAME_COLUMN: "table_name",
	CMDB_BU_CONFIG: "sn_cmdb_ws",
	LIFE_CYCLE_STAGE_TABLE: "life_cycle_stage",
	OPERATIONAL_LIFE_CYCLE_STAGE_MODE: {
		VIEW: "view",
		EDIT: "edit"
	},
	NODE_MAP_TABLE: {
		"NODE_MAP_CI_REF": "sn_cmdb_ws_node_map_reference",
		"CI_EXTENDED_PROPS": "sn_cmdb_ws_node_map_table_attributes",
		"RELATED_ITEM": "sn_cmdb_ws_node_map_related_item",
		"CMN_LOCATION": "cmn_location",
		"SYS_USER": "sys_user",
		"CMDB_REL_TYPE": "cmdb_rel_type",
		"CMDB_REL_CI": "cmdb_rel_ci",
		"CMDB_CI": "cmdb_ci",
		"CMDB_LAYER": "cmdb_layer",
		"NODE_MAP_CI_PROFILE": "sn_cmdb_ws_node_map_profiles",
		"OPERATIONAL_LIFE_CYCLE_FOR_UNIFIED_MAP": "sn_cmdb_ws_operational_lifecycle_for_unified_map",
		"SVC_CI_ASSOC": "svc_ci_assoc",
		"SHARED_PRESET": "sn_cmdb_ws_unified_map_shared_preset"
	},
	DYNAMIC_CI_GROUP_COLUMNS: {
		'sys_class_name':  gs.getMessage('Class'),
		'owned_by.name': gs.getMessage('Owned by'),
		'discovery_source': gs.getMessage('Discovery source'),
		'last_discovered' : gs.getMessage('Most recent discovery')
	},
	SUGGESTED_RELATIONSHIPS: {
		TABLE: 'cmdb_rel_type_suggest',
		COL_BASE_CLASS: 'base_class',
		COL_DEPENDENT_CLASS: 'dependent_class',
		COL_PARENT: 'parent',
		COL_REL_TYPE: 'cmdb_rel_type'
	},
	DYNAMIC_CI_GROUP_MEMBERS_RECORD_MAX_COUNT: 50,
	
	arrayUtil: new global.ArrayUtil(),
	proxyExecutor: new CMDBWSProxyScriptExecutor(sn_cmdb, 'CMDBWSScriptUtil'),
	glideDigest: new GlideDigest(),

	
	/**
	  * A little hack to make multiple class prototype inheritance 
	  *
	  */
	inherit: function(classes) {
		var pThis = this;
		classes.forEach(function(_class) {

			var refService = Object.clone(_class['prototype']);  
			for (var property in refService) {
				if (property != 'initialize' && property != 'type') {
					pThis[property] = refService[property];
				}
			}
		});
		
	},

	_splitIntoArray: function(str, delimit) {
		if (global.JSUtil.nil(str) && global.JSUtil.nil(str.trim()))
			return [];

		if (global.JSUtil.nil(delimit))
			delimit = this.COMMA_DELIMITER;

		return str.split(delimit).filter(function (item){
			return (global.JSUtil.notNil(item) && global.JSUtil.notNil(item.trim()));
		}).map(function(item) {
			return item.trim();
		});
	},

	_hasProperty: function(key, obj){
		return obj.hasOwnProperty(key);
	},

	//verify if the given object contains all the properties - if all found then return true else false
	_hasAllProperty: function(props, obj){
		for(var i = 0; i < props.length; i+= 1) {
			if (!obj.hasOwnProperty(props[i]))
				return false;
		}
		return true;
	},

	//return number if input is a valid number else return 0
	_sanitizeNumber: function(value) {
		if (global.JSUtil.notNil(value)) {
			var isAnInt = function (v) {return (v == (v >> 0));}; //bitwise check to test for floating point numbers
			var cType = typeof value;
			if (cType == 'string') {
				if (/^\d+$/.test(value)) {
					value = parseInt(value);
					return isAnInt(value) ? value : 0;
				} else {
					return 0;
				}
			} else if (cType == 'number' && isAnInt(value)) {
				return value;
			}
		}
		return 0;
	},

	_isEmptyObj: function(input) {
		if (global.JSUtil.nil(input))
			return true;
		if ((typeof input == 'object') && Object.keys(input).length == 0)
			return true;
		return false;
	},
	
	_grepHighLightedStyle: function(highlightedStyles, field) {
		var output = {};
		var tmpStyleArr = highlightedStyles.filter(function(style) {
			return (style['field'] === field);
		});
		if (tmpStyleArr.length > 0) {
			output = tmpStyleArr[0];
			global.JSUtil.removeFromMap(output, ['field', 'value']);
		}
		return output;
	},
	
	_extractFieldValues: function(tableName, fields, glideRecord) {
		var output = {};
		var tmpObj = {};
		var fieldName = '';
		var fieldList = this._splitIntoArray(fields, this.COMMA_DELIMITER);
		if (fieldList != null && fieldList.length == 0)
			return output;

		var highlightedStyles = [];
		var _tmpHighlightedStyles = this.proxyExecutor.executeStaticFunction('getHighlightedValueStyles', 
                                                                            [tableName, fields, null, glideRecord], '[]');
		if(_tmpHighlightedStyles && _tmpHighlightedStyles.length) {
			highlightedStyles = JSON.parse(_tmpHighlightedStyles);
		}

		for(var i = 0; i < fieldList.length; i += 1){
			fieldName = fieldList[i];

			tmpObj = {};
			tmpObj['field'] = fieldName;
			// dot walk to extended property value
			if(fieldName.indexOf(".") > 0) {
				var fieldArray = fieldName.split('.');
				var element;
				var label = "";
				for (var j = 0; j < fieldArray.length; j++) {
					if (j == 0) {
						element = glideRecord[fieldArray[0]];
					} else {
						element = element[fieldArray[j]];
						label += ".";
					}
					// the element may not exist in some plugin configurations if the column is undefined
					if (!element && element != "")
						break;

					label += element.getLabel();
				}
				if (element || element == "") {
					// add only to output if it's a valid dotwalk
					tmpObj['label'] = label;
					tmpObj['value'] = element.getDisplayValue() || element.toString() ||  gs.getMessage("None");
					tmpObj['highlightedStyle'] = this._grepHighLightedStyle(highlightedStyles, fieldName);
					output[fieldName] = tmpObj;
				}
			} else {
				// some columns in table attributes may not exist on all plugin configurations
				if (!glideRecord.isValidField(fieldName))
					continue;
				tmpObj['label'] = glideRecord[fieldName].getLabel();
				tmpObj['value'] = glideRecord.getDisplayValue(fieldName) || gs.getMessage("None");
				tmpObj['highlightedStyle'] = this._grepHighLightedStyle(highlightedStyles, fieldName);
				output[fieldName] = tmpObj;
			}
		}
		return output;
	},
	
	_cacheGet: function(key) {
		return this.proxyExecutor.executeStaticFunction('nodeMapCacheGet', key);
	},
	
	_cachePut: function(key, value) {
		this.proxyExecutor.executeStaticFunction('nodeMapCachePut', [key, value]);
	},

	_isEmpty: function(value) {
		return (global.JSUtil.nil(value) || global.JSUtil.nil(value.trim()));
	},

    _getOutputResponse: function(result, messages) {
		var output = {};
		output[this.SUCCESS] = true;
		output[this.RESULT] = result;
		if (messages && messages.length) {
			output[this.MESSAGES] = messages;
		}
		return output;
	},

	_getErrorResponse: function(errorObj) {
		var output = {};
		output[this.SUCCESS] = false;
		output[this.ERROR] = errorObj;
		return output;
    },
	_generateMessageObj: function(args) {
		var messageObj = {};
		messageObj[this.SEVERITY] = args.severity;
		messageObj[this.MESSAGE] = args.message;
		messageObj[this.ICON] = args.icon;
		messageObj[this.AUTO_DISMISS] = args.autoDismiss;
		
		return messageObj;
	},

	_isArray: function (value) {
		return global.JSUtil.notNil(value) && Array.isArray(value);
	},

	_isEmptyArray: function (value) {
		return (this._isArray(value) && value.length == 0);
	},

	_generateMD5Hex: function(value) {
		return this.glideDigest.getMD5Hex(value).toLowerCase();
	},
	
	_getPropWithLabelValue: function(label, value, internalId) {
		var obj = {};
		obj[this.LABEL] = label;
		obj[this.VALUE] = value;
		if(internalId) {
			obj[this.INTERNAL_ID] = internalId;
		}
		return obj;
	},
	type: 'MapBase'
};
