function include({ imports }) {
	//unifiedMapPropertiesUtils shared client script include in (CI) Properties UI Controller
	const _CONNECTIONS_EXCLUSION_FIELDS = {
		DIRECTION: 'direction',
		ENDPOINTS: 'endpoints',
		ID: 'id',
		EPID: 'epId',
		IS_REFERENCE: 'isReference',
		IS_VIRTUAL_CONNECTION: 'isVirtualConnection',
		STYLE: 'style',
		SYSID: 'sysId',
		LABEL: '_label',
		TABLENAME: 'tableName',
		SOURCEID: 'sourceId',
		TARGETID: 'targetId',
		PORT: 'port',
		IP_ADDRESS: 'IP Address',
		IS_SERVICE_MAPPING: 'isServiceMapping',
		ORIGINAL_TARGET_ID: 'originalTargetId',
		ORIGINAL_SOURCE_ID: 'originalSourceId',
		COMMENTS: 'comments',
		COMMAND_LINE: 'Command line',
		ATTACHMENT_INFO: 'Attachment Info',
		COMMAND_LINE_PARAMETERS: 'Command Line Parameters',
		STORAGE_PATH: 'Storage Path'
	};

	const _PROP_CLASS = 'Class';

	const _CI_GROUP_MEMBER_FIELDS = {
		CLASS: 'sys_class_name',
		DISCOVERY_SOURCE: 'discovery_source',
		OWNED_BY: 'owned_by',
		MOST_RECENT_DISCOVERY: 'last_discovered'
	};

	const _LOCATION = {
		NAME: "name",
		CITY: "city"
	};

	const _SM_INPUT_EDGE_PROPERTIES = {
		ENDPOINT_ID: "epId",
		BUSINESS_SERVICE_ID: "bsId",
		STABLE_ID: "stableId",
		ORIGINAL_ID: "originalId",
		EDGES: "edges"
	};

	const _CI_FIELDS = {
		ENTRY_POINTS: "Entry Points",
		LOCATION: "location"
	};

	const _buildStackedValueObj = function (name, value) {
		return {
			label: name,
			value: {
				type: "string",
				value: value
			}
		};
	};

	const _getNameObj = function (name) {
		return {
			label: name,
			size: "md",
			variant: "primary",
		};

	}

	const _getClassDisplayNameObj = function (name) {
		return {
			label: name,
			lines: 1,
			size: "md",
		}
	}

	const _buildDynamicCIGroupRouteObject = function (ciSysId, dynamicCiText) {
		return {
			route: "list",
			fields: {
				table: _TABLE_NAME.SVC_CI_ASSOC,
			},
			params: {
				columns: 'ci_id.name,ci_id.sys_class_name,ci_id.owned_by,ci_id.discovery_source,ci_id.last_discovered',
				fixedFilter: 'service_id=' + ciSysId,
				listTitle: dynamicCiText,
				hideActions: true
			}
		};
	}

	const _CLASS_NAME = {
		CMDB_CI_QUERY_BASED_SERVICE: 'cmdb_ci_query_based_service'
	}

	const _TABLE_NAME = {
		SVC_CI_ASSOC: 'svc_ci_assoc'
	}

	const _isDynamicCIGroup = function (className) {
		return className && className === _CLASS_NAME.CMDB_CI_QUERY_BASED_SERVICE;
	}

	const _DYNAMIC_GROUP_COLUMNS = {
		NAME: "name",
		DISPLAY_NAME: "displayName"
	}

	const _USER_PREFERENCE = {
		ADDITIONAL_ATTRIBUTES_EXPANDED: "cmdb_ws.unifiedmap.additionalAttributesExpanded"
	}

	const _ATTRIBUTE_PANEL_OPEN_MAP_BASE_URL_KEY = "unifiedmap.attribute_panel_open_map_base_url";
	const _ATTRIBUTE_PANEL_OPEN_MAP_DEFAULT_URL = "/now/cmdb/unifiedmap";
	return {
		buildStackedValueObj: _buildStackedValueObj,
		getNameObj: _getNameObj,
		buildDynamicCIGroupRouteObject: _buildDynamicCIGroupRouteObject,
		isDynamicCIGroup: _isDynamicCIGroup,
		getClassDisplayNameObj: _getClassDisplayNameObj,
		CONNECTION_EXCLUSION_FIELDS: _CONNECTIONS_EXCLUSION_FIELDS,
		CI_GROUP_MEMBER_FIELDS: _CI_GROUP_MEMBER_FIELDS,
		CI_FIELDS: _CI_FIELDS,
		LOCATION: _LOCATION,
		TABLE_NAME: _TABLE_NAME,
		CLASS_NAME: _CLASS_NAME,
		DYNAMIC_GROUP_COLUMNS: _DYNAMIC_GROUP_COLUMNS,
		PROP_CLASS: _PROP_CLASS,
		SM_INPUT_EDGE_PROPERTIES: _SM_INPUT_EDGE_PROPERTIES,
		USER_PREFERENCE: _USER_PREFERENCE,
		ATTRIBUTE_PANEL_OPEN_MAP_BASE_URL_KEY: _ATTRIBUTE_PANEL_OPEN_MAP_BASE_URL_KEY,
		ATTRIBUTE_PANEL_OPEN_MAP_DEFAULT_URL: _ATTRIBUTE_PANEL_OPEN_MAP_DEFAULT_URL
	};
}
