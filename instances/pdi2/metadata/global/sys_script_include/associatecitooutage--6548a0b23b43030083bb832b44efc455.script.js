var AssociateCIToOutage = Class.create();
AssociateCIToOutage.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	SESSION_KEY: 'com.snc.change_request.AssociateCIToOutage.ci_user_filter',

	// Tables
	OUTAGE_TABLE: 'cmdb_ci_outage',
	CI_TABLE: 'cmdb_ci',
	APP_SERVICE: 'cmdb_ci_service_auto',
	MAPPED_APP_SERVICE: 'cmdb_ci_service_discovered',
	TAG_BASED_MAPS: 'cmdb_ci_service_by_tags',
	DYNAMIC_CI_GROUP: 'cmdb_ci_query_based_service',
	CI_RELATIONSHIPS: 'cmdb_rel_ci',
	SERVICE_OFFERING: 'service_offering',

	// Columns
	SYS_CLASS_NAME: 'sys_class_name',
	CHILD: 'child',
	TYPE: 'type',
	PARENT: 'parent',
	SERVICE_REFERENCE: 'ref_cmdb_ci_service',
	OFFERING_REFERENCE: 'ref_service_offering',
	SERVICE_CLASSIFICATION: 'service_classification',

	CONTAINS_RELATIONSHIP: '55c95bf6c0a8010e0118ec7056ebc54d',
	DEPENDS_RELATIONSHIP: '1a9cb166f1571100a92eb60da2bce5c5',

	ajaxFunction_getURL: function() {
		var outageId = this.getParameter("sysparm_id");
		var addToTable = this.getParameter("sysparm_add_to");
		return this._getURL(outageId, addToTable);
	},

	_getURL: function(outageId, addToTable) {
		this.removeUserFilter();

		var affectedCiTable = this.getOutageCiTable(outageId);
		var filter = this.getFilterForCI(outageId);

		var latestClassAdded = "";
		var parentClass = "cmdb_ci";

		// latestClassAdded logic
		// 1. if there are ci's, get the latest class of the ci
		// 2. default the latest class to parent class
		latestClassAdded = this.getLatestClass(outageId);
		if (!latestClassAdded)
			latestClassAdded = parentClass;
		var url = new GlideURL("outage_add_affected_cis.do");
		url.set("sysparm_crTable", affectedCiTable);
		url.set("sysparm_crSysId", outageId);
		url.set("sysparm_view", "associate_ci");
		url.set("sysparm_add_to", addToTable);
		url.set("sysparm_stack", "no");
		url.set("sysparm_table", latestClassAdded);
		url.set("sysparm_parent_class", parentClass);
		url.set("sysparm_filter", filter);
		return url;
	},

	storeUserFilter: function() {
		var filter;
		filter = this.getParameter("sysparm_filter_query");
		gs.getSession().putClientData(this.SESSION_KEY, filter);
		return;
	},

	removeUserFilter: function() {
		gs.getSession().clearClientData(this.SESSION_KEY);
		return;
	},

	addSelected: function() {
		var id = this.getParameter("sysparm_id");
		var addToTable = this.getParameter("sysparm_add_to_table");
		var listTableName = this.getParameter("sysparm_tableName");
		var selCIsList = this.getParameter("sysparm_selCIs");
		var selCIs = selCIsList.split(",");
		for (var i = 0; i < selCIs.length; i++) {
			if (selCIs[i]) {
				var existingCI = new GlideRecordSecure(addToTable);
				existingCI.addQuery("JOINcmdb_ci_outage.sys_id=cmdb_outage_ci_mtom.outage");
				existingCI.addQuery("ci_item", selCIs[i]);
				existingCI.addQuery("outage", id);
				existingCI.query();

				if (!existingCI.hasNext()) {
					var affectedCI = new GlideRecordSecure(addToTable);
					affectedCI.initialize();
					affectedCI.outage = id;
					affectedCI.ci_item = selCIs[i];
					affectedCI.insert();
				}
			}
		}
		return gs.getMessage("Added selected configuration items successfully to the outage.");
	},

	getOutageCiTable: function(outageId) {
		var outageGr = GlideRecordSecure(this.OUTAGE_TABLE);
		outageGr.get(outageId);
		var affectedCiId = outageGr.getValue(this.CI_TABLE);

		var ciGr = GlideRecordSecure(this.CI_TABLE);
		ciGr.get(affectedCiId);
		var affectedCiClass = ciGr.getValue(this.SYS_CLASS_NAME);
		return affectedCiClass;
	},

	getLatestClass: function(outageId) {
		var affectedCiGR = new GlideRecordSecure("cmdb_outage_ci_mtom");
		affectedCiGR.addQuery("JOINcmdb_ci_outage.sys_id=cmdb_outage_ci_mtom.outage");
		affectedCiGR.addQuery("outage", outageId);
		affectedCiGR.orderByDesc("sys_updated_on");
		affectedCiGR.setLimit(1);
		affectedCiGR.query();
		if (affectedCiGR.next())
			return affectedCiGR.ci_item.sys_class_name;
		return "";
	},

	addAll: function() {
		var id = this.getParameter("sysparm_id");
		var query = this.getParameter("sysparm_query");
		var addToTable = this.getParameter("sysparm_add_to_table");
		var listTableName = this.getParameter("sysparm_tableName");

		var result = [];
		var existingCI = new GlideRecordSecure(addToTable);
		existingCI.addQuery("JOINcmdb_ci_outage.sys_id=cmdb_outage_ci_mtom.outage");

		existingCI.addQuery("outage", id);
		existingCI.query();
		while (existingCI.next()) {
			result.push(existingCI.ci_item.sys_id);

		}

		var affectedCiGR = new GlideRecordSecure(listTableName);
		var finalQuery = query;
		affectedCiGR.addEncodedQuery(finalQuery, true);
		affectedCiGR.addQuery("sys_id", "NOT IN", result.join());
		affectedCiGR.query();
		while (affectedCiGR.next()) {
			var affectedCI = new GlideRecordSecure(addToTable);
			affectedCI.initialize();
			affectedCI.outage = id;
			affectedCI.ci_item = affectedCiGR.sys_id;
			affectedCI.insert();
		}
		return gs.getMessage("Added {0} configuration items successfully to the outage.", affectedCiGR.getRowCount());
	},

	/**
	 * Returns encoded query for the list of offerings that are related to the CI that the outage is opened against
	 * @param {string} outageSysId - sys_id of cmdb_ci_outage record
	 * @returns {string}
	 */
	getFilterForCI: function(outageSysId) {
		var outageId = this.getParameter("sysparm_id");
		if (outageSysId) {
			outageId = outageSysId
		}
		var output = [];

		var outageGr = GlideRecordSecure(this.OUTAGE_TABLE);
		outageGr.get(outageId);
		var affectedCiId = outageGr.getValue(this.CI_TABLE);

		var ciGr = GlideRecordSecure(this.CI_TABLE);
		ciGr.get(affectedCiId);
		var affectedCiClass = ciGr.getValue(this.SYS_CLASS_NAME);

		var appServiceTables = [this.APP_SERVICE, this.MAPPED_APP_SERVICE, this.TAG_BASED_MAPS];

		if (appServiceTables.indexOf(affectedCiClass) !== -1) {
			output = this.getTechnicalOfferingsWithContainsRelationship(ciGr.getUniqueValue());
			output = output.concat(this.getBusinessOfferingsWithDependsRelationship(ciGr.getUniqueValue()));
		} else if (affectedCiClass == this.DYNAMIC_CI_GROUP) {
			output = this.getTechnicalOfferingsWithContainsRelationship(ciGr.getUniqueValue());
		}

		if (output.length > 0) {
			return 'nameIN' + output.toString();
		} else {
			return '';
		}
	},

	/**
	 * Returns list of sys_id's of technical offerings that have a Contains::Contained by relationship to the passed in Configuration Item
	 * @param {string} ciSysId - sys_id of configuration item
	 * @returns {array}
	 */
	getTechnicalOfferingsWithContainsRelationship: function(ciSysId) {
		var output = []
		var cmdbRelCiGr = new GlideRecordSecure(this.CI_RELATIONSHIPS);
		cmdbRelCiGr.addQuery(this.CHILD, ciSysId);
		cmdbRelCiGr.addQuery(this.TYPE, this.CONTAINS_RELATIONSHIP);
		cmdbRelCiGr.addQuery(this.PARENT + '.' + this.SYS_CLASS_NAME, this.SERVICE_OFFERING);
		cmdbRelCiGr.addQuery(this.PARENT + '.' + this.OFFERING_REFERENCE + '.' + this.PARENT + '.' + this.SERVICE_CLASSIFICATION, 'Technical Service').addOrCondition(this.PARENT + '.' + this.OFFERING_REFERENCE + '.' + this.SERVICE_CLASSIFICATION, 'Technical Service');;
		cmdbRelCiGr.query();
		while (cmdbRelCiGr.next()) {
			output.push(cmdbRelCiGr.getDisplayValue(this.PARENT));
		}
		return output;
	},

	/**
	 * Returns list of sys_id's of business offerings that have a Depends on::Used by relationship to the passed in Configuration Item
	 * @param {string} ciSysId - sys_id of configuration item
	 * @returns {array}
	 */
	getBusinessOfferingsWithDependsRelationship: function(ciSysId) {
		var output = []
		var cmdbRelCiGr = new GlideRecordSecure(this.CI_RELATIONSHIPS);
		cmdbRelCiGr.addQuery(this.CHILD, ciSysId);
		cmdbRelCiGr.addQuery(this.TYPE, this.DEPENDS_RELATIONSHIP);
		cmdbRelCiGr.addQuery(this.PARENT + '.' + this.SYS_CLASS_NAME, this.SERVICE_OFFERING);
		cmdbRelCiGr.addQuery(this.PARENT + '.' + this.OFFERING_REFERENCE + '.' + this.PARENT + '.' + this.SERVICE_CLASSIFICATION, 'Business Service').addOrCondition(this.PARENT + '.' + this.OFFERING_REFERENCE + '.' + this.SERVICE_CLASSIFICATION, 'Business Service');
		cmdbRelCiGr.query();
		while (cmdbRelCiGr.next()) {
			output.push(cmdbRelCiGr.getDisplayValue(this.PARENT));
		}
		return output;
	},

	type: "AssociateCIToOutage"
});
