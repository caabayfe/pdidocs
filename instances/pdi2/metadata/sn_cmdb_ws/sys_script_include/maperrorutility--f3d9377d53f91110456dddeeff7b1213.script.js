var MapErrorUtility = Class.create();
MapErrorUtility.prototype = {

    initialize: function() {},
	
	CMDBUM_400_001: "CMDBUM-400-001",
	CMDBUM_400_002: "CMDBUM-400-002",
	CMDBUM_400_003: "CMDBUM-400-003",
	CMDBUM_400_004: "CMDBUM-400-004",
	CMDBUM_400_005: "CMDBUM-400-005",
	CMDBUM_400_006: "CMDBUM-400-006",
	CMDBUM_400_007: "CMDBUM-400-007",
	CMDBUM_400_008: "CMDBUM-400-008",
	CMDBUM_400_009: "CMDBUM-400-009",
	CMDBUM_400_010: "CMDBUM-400-010",
	CMDBUM_400_011: "CMDBUM-400-011",
	CMDBUM_400_012: "CMDBUM-400-012",
	CMDBUM_400_013: "CMDBUM-400-013",
	CMDBUM_400_014: "CMDBUM-400-014",
	CMDBUM_400_015: "CMDBUM-400-015",
	CMDBUM_400_016: "CMDBUM-400-016",
	CMDBUM_400_017: "CMDBUM-400-017",
	CMDBUM_400_018: "CMDBUM-400-018",
	CMDBUM_500_001: "CMDBUM-500-001",
	CMDBUM_500_002: "CMDBUM-500-002",
	CMDBUM_500_003: "CMDBUM-500-003",
	CMDBUM_500_004: "CMDBUM-500-004",
	CMDBUM_404_001: "CMDBUM-404-001",

	ERROR_CODES: {
		"CMDBUM-400-001": gs.getMessage("sys_id is required"),
		"CMDBUM-400-002": gs.getMessage("List of sys_id is required (Related Item)"),
		"CMDBUM-400-003": gs.getMessage("Invalid level (should be a positive integer)"),
		"CMDBUM-400-004": gs.getMessage("CI class is required"),
		"CMDBUM-400-005": gs.getMessage("Related List table name is required"),
		"CMDBUM-400-006": gs.getMessage("Related List name is required"),
		"CMDBUM-400-007": gs.getMessage("Related List table CMDB reference column is required"),
		"CMDBUM-400-008": gs.getMessage("Related Item data fields are required"),
		"CMDBUM-400-009": gs.getMessage("Related Item data sort field is required"),
		"CMDBUM-400-010": gs.getMessage("Related Item data sort direction is required"),
		"CMDBUM-400-011": gs.getMessage("Related Item data start index is required"),
		"CMDBUM-400-012": gs.getMessage("Related Item data end index is required"),
		"CMDBUM-400-013": gs.getMessage("Related Item aggregate input config is required"),
		"CMDBUM-400-014": gs.getMessage("Related Item data input config is required"),
		"CMDBUM-400-015": gs.getMessage("Invalid CI Class name (should be a valid CI class name)"),
		"CMDBUM-400-016": gs.getMessage("List of edges is required"),
		"CMDBUM-400-017": gs.getMessage("Invalid life cycle stage"),
		"CMDBUM-400-018": gs.getMessage("appId is required"),
		"CMDBUM-500-001": gs.getMessage("Internal Server Error"),
		"CMDBUM-500-002": gs.getMessage("Service Mapping Internal Server Error"),
		"CMDBUM-500-003": gs.getMessage("Service Mapping Plugin is not installed"),
		"CMDBUM-500-004": gs.getMessage("Service Mapping API timeout"),
		"CMDBUM-404-001": gs.getMessage("CI not found")
	},


	_form50XErrorObject: function (e, errCode, uiMessage) {
		var exceptionMessage = e ? e.message : null;
		return this._formErrorObject(errCode, exceptionMessage, uiMessage);
	},

	_form40XErrorObject: function (errCode, uiMessage) {
		return this._formErrorObject(errCode, null, uiMessage);
	},

	_formErrorObject: function(errorCodeParam, internalMessage, uiMessage) {
		var errorCode = global.JSUtil.nil(errorCodeParam) ? this.CMDBUM_500_001 : errorCodeParam;
		var codeText = this.ERROR_CODES[errorCode] || this.ERROR_CODES[this.CMDBUM_500_001];
		codeText = gs.getMessage(
			"The server returned an error while retrieving map data. Reason: {0} (error code: {1})",
			[codeText, errorCode]);

		var errObj = {
			"code": errorCode,
			"message": global.JSUtil.nil(internalMessage) ? codeText : internalMessage
		};

		if(global.JSUtil.notNil(uiMessage) || global.JSUtil.notNil(codeText)) {
			errObj["uiMessage"] = global.JSUtil.nil(uiMessage) ? codeText : uiMessage;
		}

		return errObj;
	},

    type: 'MapErrorUtility'
};
