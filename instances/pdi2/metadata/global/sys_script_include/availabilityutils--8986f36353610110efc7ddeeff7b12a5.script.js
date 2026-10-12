var AvailabilityUtils = Class.create();
AvailabilityUtils.prototype = {
	initialize: function() {
		this.CONSTANTS = (new global.AvailabilityConstants());
	},

	/*
	 * hasCommitments
	 * returns true if record has any commitments in the commitments table
	 */
	hasCommitments: function(recordId) {
		var commitments = new GlideRecord(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
		commitments.addQuery('service_offering', recordId).addOrCondition('cmdb_ci', recordId);
		commitments.query();

		return (commitments.getRowCount() > 0);
	},

	getAvailabilityCIQuery: function() {
		var str = "sys_class_nameIN";
		return str += this.getApplicationServicesQuery();
	},

	getApplicationServicesQuery: function() {
		var str = "cmdb_ci_service_auto";
		var tu = new TableUtils('cmdb_ci_service_auto');
		var tables = tu.getTableExtensions();

		for (var i = 0; i < tables.size(); i++) {
			var table = tables.get(i) + '';

			if (this.CONSTANTS.EXCLUDED_APPLICATION_TABLES().indexOf(table) < 0)
				str += ',' + table;

		}
		// Append dynamic ci group when classification is "Application Service" only
		str += '^NQsys_class_name=cmdb_ci_query_based_service^ref_cmdb_ci_service_auto.service_classification=Application Service';
		return str;
	},

	getCiFromCommitment: function(commitmentGR) {
		var serviceOffering = commitmentGR.getValue('service_offering');
		var cmdbCi = commitmentGR.getValue('cmdb_ci');

		return serviceOffering || cmdbCi;
	},

	getCiClassFromCommitment: function(commitmentGR) {
		if (commitmentGR.getValue('service_offering')) {
			return 'service_offering'
		} else {
			return commitmentGR.cmdb_ci.sys_class_name + "";
		}
	},

	/*
	 * Read sys_properties timezone preferences and return timezone for calculation purpose
	 * returns string/timezone if commitment timezone is set to false else return null
	 */
	getTimezoneForCalculation: function() {
		if (gs.getProperty(this.CONSTANTS.PROP_AVAILABILITY_COMMITMENT_TZ).trim() == 'true')
			return null;
		else {
			var globalTimezone = gs.getProperty(this.CONSTANTS.PROP_AVAILABILITY_GLOBAL_TZ).trim();
			if (globalTimezone != '')
				return globalTimezone;
			else
				return gs.getSysTimeZone();
		}
	},

	/**
	 * Get all commitment records associated to configuration_item (application service)
	 * @Param cmdbCi - sys_id of configuration_item
	 * @param {array} commitments - array of sys_ids of service commitment records
	 */
	getCIsToCommitmentGr: function(cmdbCi, commitments) {
		var cmdbCiCommits = new GlideAggregate(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
		if (cmdbCi != null)
			cmdbCiCommits.addQuery('cmdb_ci', cmdbCi);
		if (commitments != null)
			cmdbCiCommits.addQuery(this.CONSTANTS.SERVICE_COMMITMENT, commitments);
		cmdbCiCommits.addQuery('service_commitment.type', 'availability');
		cmdbCiCommits.addEncodedQuery('cmdb_ciISNOTEMPTY');
		cmdbCiCommits.groupBy('cmdb_ci');
		cmdbCiCommits.groupBy('service_commitment.timezone');
		cmdbCiCommits.query();
		return cmdbCiCommits;
	},

	/**
	 * Get all service commitment records associated to service offerings
	 * @Param offeringId - sys_id of service_offering
	 * @param {array} commitments - array of sys_ids of service commitment records
	 */
	getOfferingToCommitmentGr: function(offeringId, commitments) {
		var offeringCommits = new GlideAggregate(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
		if (offeringId != null)
			offeringCommits.addQuery('service_offering', offeringId);
		if (commitments != null)
			offeringCommits.addQuery(this.CONSTANTS.SERVICE_COMMITMENT, commitments);
		offeringCommits.addQuery('service_commitment.type', 'availability');
		// ensure that there is either a configuration item populated, or a service offering that is in published state
		offeringCommits.addEncodedQuery('service_offeringISNOTEMPTY^service_offering.state=published^ORservice_offering.state=');

		offeringCommits.groupBy('service_offering');
		offeringCommits.groupBy('service_commitment.timezone');
		offeringCommits.query();

		return offeringCommits;
	},

	/**
	 * Get service_offering_commitments needed for Availability calculator by timezone
	 * @param {GlideRecord} cmdb_ci - GlideRecord CI have availability calculated
	 * @param {Array} commitments - Array of service_commit sys_ids
	 * @param {timezone/string}     - timezone
	 */
	getCommitmentsByTimezone: function(cmdb_ci, commitments, timezone) {
		var commits = new GlideRecord(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
		commits.addQuery('service_commitment.type', 'availability');

		// ensure that there is either a configuration item populated, or a service offering that is in published state
		commits.addEncodedQuery('cmdb_ciISNOTEMPTY^ORservice_offering.state=published^ORservice_offering.state=');

		if (cmdb_ci != null)
			commits.addQuery(this.CONSTANTS.SERVICE_OFFERING, cmdb_ci).addOrCondition(this.CONSTANTS.CMDB_CI, cmdb_ci);
		if (commitments != null)
			commits.addQuery(this.CONSTANTS.SERVICE_COMMITMENT, commitments);

		commits.addQuery('service_commitment.timezone', timezone);
		commits.query();
		return commits;
	},

	/**
	 * Evaluate start and end date for single offering or if null then for all the records in table
	 * @param {string} offeringId - sys_id of offering 
	 * @param {string} offeringId - sys_id of service commitment 
	 * @return {object} - {startDate, endDate}
	 */
	getStartAndEndDate: function(offeringId, commitmentId) {
		var date = {};
		var begin = new GlideDateTime().getLocalDate();
		begin.addDays(-365);
		var end = new GlideDateTime().getLocalDate();
		if (begin) {
			var startGa = new GlideAggregate('service_availability');
			if (offeringId)
				startGa.addQuery('service_offering', offeringId);
			if (commitmentId)
				startGa.addQuery('service_commitment', commitmentId);
			startGa.addQuery('type', 'daily');
			startGa.orderBy('start');
			startGa.query();
			while (startGa.next()) {
				begin = startGa.getValue('start');
				break;
			}
		}
		if (end) {
			var endGa = new GlideAggregate('service_availability');
			if (offeringId)
				endGa.addQuery('service_offering', offeringId);
			if (commitmentId)
				endGa.addQuery('service_commitment', commitmentId);
			endGa.addQuery('type', 'daily');
			endGa.orderByDesc('end');
			endGa.query();
			while (endGa.next()) {
				end = endGa.getValue('end');
				break;
			}
		}
		date.startDate = begin;
		date.endDate = end;
		return date;
	},

	/**
	 * find all unique timezone values and return as array
	 */
	getExistingTimeZone: function() {
		var exTZ = [];
		var ga = new GlideAggregate('service_availability');
		ga.groupBy('time_zone');
		ga.query();
		while (ga.next()) {
			exTZ.push(ga.getValue('time_zone'));
		}
		return exTZ;
	},

	type: 'AvailabilityUtils'
};
