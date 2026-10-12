var AvailabilityRecord = Class.create();

AvailabilityRecord.prototype = {
	type: 'daily',

	/**
	 * Constructor
	 * @param {GlideRecord} cmdb_ci
	 * @param {GlideDateTime} start
	 * @param {GlideDateTime} end
	 */
	initialize: function(cmdb_ci, start, end) {
		this.CONSTANTS = new global.AvailabilityConstants();
		this.cmdb_ci = cmdb_ci;
		this.start = start;
		this.end = end;
		this.cmdb_ci_class = this.CONSTANTS.SERVICE_OFFERING;
	},

	/**
	 * Wrapper function to find/update or create a new availability record
	 * @param {GlideRecord|String} commitment
	 * @param {*} - parameters representing fields of availability
	 * @returns {String} sys_id of created/updated record
	 */
	updateOrCreateRecord: function(commitment, absolute, scheduled, absolute_avail, scheduled_avail, absolute_count, scheduled_count, ast, mtbf, mtrs, allowed, met, tz) {
		if (!commitment || !this.type || !this.cmdb_ci || !this.start || !this.end)
			return null;

		var existingRecordSysId = this.findExistingRecord(commitment, tz);
		if (existingRecordSysId)
			return this.updateRecord(existingRecordSysId, commitment, absolute, scheduled, absolute_avail, scheduled_avail, absolute_count, scheduled_count, ast, mtbf, mtrs, allowed, met, tz);
		else
			return this.post(commitment, absolute, scheduled, absolute_avail, scheduled_avail, absolute_count, scheduled_count, ast, mtbf, mtrs, allowed, met, tz);
	},

	/**
	 * Return an existing availability record given commitment, type, start date, end date (if it exists)
	 * @param {GlideRecord|String} commitment
	 * @Param {timezone/string} tz
	 * @returns {String} sys_id of found record
	 */
	findExistingRecord: function(commitment, tz) {
		if (!commitment || !this.type || !this.cmdb_ci || !this.start || !this.end)
			return null;

		var startGDT = new GlideDateTime();
		startGDT.setNumericValue(this.start);
		var endGDT = new GlideDateTime();
		endGDT.setNumericValue(this.end);

		var existingRecord = new GlideRecord(this.CONSTANTS.SERVICE_AVAILABILITY);
		existingRecord.addQuery(this.CONSTANTS.AVAIL_FIELDS.SERVICE_COMMITMENT, commitment);
		existingRecord.addQuery(this.CONSTANTS.AVAIL_FIELDS.TYPE, this.type);

		// if the type of availability is last12months/last30days/last7days, do not use start and end in the query
		if (this.CONSTANTS.AVAIL_TYPES.FIXED.indexOf(this.type) >= 0) {
			existingRecord.addQuery(this.CONSTANTS.AVAIL_FIELDS.START, startGDT.getValue());
			existingRecord.addQuery(this.CONSTANTS.AVAIL_FIELDS.END, endGDT.getValue());
		}

		if (this.cmdb_ci_class === this.CONSTANTS.SERVICE_OFFERING)
			existingRecord.addQuery(this.CONSTANTS.SERVICE_OFFERING, this.cmdb_ci);
		else
			existingRecord.addQuery(this.CONSTANTS.CMDB_CI, this.cmdb_ci);

		// FIXED: Search for records with matching timezone OR 'undefined' (literal string) OR empty
		// This allows V2 to find and update V1 records that have 'undefined' string in timezone field
		// Prevents duplicate records when switching from V1 to V2 or when timezone changes
		if (tz) {
			var tzQuery = existingRecord.addQuery(this.CONSTANTS.AVAIL_FIELDS.TIME_ZONE, tz);
			tzQuery.addOrCondition(this.CONSTANTS.AVAIL_FIELDS.TIME_ZONE, '');
			tzQuery.addOrCondition(this.CONSTANTS.AVAIL_FIELDS.TIME_ZONE, 'undefined');
		}
		
		existingRecord.query();
		if (existingRecord.next())
			return existingRecord.getUniqueValue();

		return null;
	},

	/**
	 * Update an existing availability record with new field values
	 * @param {GlideRecord|String} sysId - sys_id of existing availability
	 * @param {GlideRecord|String} commitment
	 * @param {*} - parameters representing fields of availability
	 * @returns {String} sys_id of updated record
	 */
	updateRecord: function(sysId, commitment, absolute, scheduled, absolute_avail, scheduled_avail, absolute_count, scheduled_count, ast, mtbf, mtrs, allowed, met, tz) {
		if (!sysId || !commitment || !this.type || !this.cmdb_ci || !this.start || !this.end)
			return null;

		var existingRecord = new GlideRecord(this.CONSTANTS.SERVICE_AVAILABILITY);
		if (existingRecord.get(sysId)) {
			if (this.cmdb_ci_class === this.CONSTANTS.SERVICE_OFFERING)
				existingRecord.setValue(this.CONSTANTS.SERVICE_OFFERING, this.cmdb_ci);
			else
				existingRecord.setValue(this.CONSTANTS.CMDB_CI, this.cmdb_ci);

			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SERVICE_COMMITMENT, commitment);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.START, this.start);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.END, this.end);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ABSOLUTE_DOWNTIME, absolute);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SCHEDULED_DOWNTIME, scheduled);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SCHEDULED_AVAILABILITY, scheduled_avail);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ABSOLUTE_AVAILABILITY, absolute_avail);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.TYPE, this.type);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ABSOLUTE_COUNT, absolute_count);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SCHEDULED_COUNT, scheduled_count);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.MTBF, mtbf);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.MTRS, mtrs);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.AST, ast);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ALLOWED_DOWNTIME, allowed);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.MET_COMMITMENT, met);
			existingRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.TIME_ZONE, tz);
			return existingRecord.update();
		}

		return null;
	},

	/**
	 * Create a new availability record
	 * @param {GlideRecord|String} commitment
	 * @param {*} - parameters representing fields of availability
	 * @returns {String} sys_id of created record
	 */
	post: function(commitment, absolute, scheduled, absolute_avail, scheduled_avail, absolute_count, scheduled_count, ast, mtbf, mtrs, allowed, met, tz) {
		if (!commitment || !this.type || !this.cmdb_ci || !this.start || !this.end)
			return null;

		var newRecord = new GlideRecord(this.CONSTANTS.SERVICE_AVAILABILITY);
		if (this.cmdb_ci_class === this.CONSTANTS.SERVICE_OFFERING)
			newRecord.setValue(this.CONSTANTS.SERVICE_OFFERING, this.cmdb_ci);
		else
			newRecord.setValue(this.CONSTANTS.CMDB_CI, this.cmdb_ci);

		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SERVICE_COMMITMENT, commitment);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.START, this.start);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.END, this.end);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ABSOLUTE_DOWNTIME, absolute);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SCHEDULED_DOWNTIME, scheduled);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ABSOLUTE_AVAILABILITY, absolute_avail);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SCHEDULED_AVAILABILITY, scheduled_avail);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.TYPE, this.type);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ABSOLUTE_COUNT, absolute_count);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.SCHEDULED_COUNT, scheduled_count);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.MTBF, mtbf);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.MTRS, mtrs);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.AST, ast);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.ALLOWED_DOWNTIME, allowed);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.MET_COMMITMENT, met);
		newRecord.setValue(this.CONSTANTS.AVAIL_FIELDS.TIME_ZONE, tz);
		return newRecord.insert();
	},

	/**
	 * Set the type of the availability record to be updated/created
	 * @param {String} type
	 */
	setType: function(type) {
		this.type = type;
	},

	/**
	 * Set the cmdb_ci_class of the availability record to be updated/created
	 * @param {String} cmdb_ci_class
	 */
	setCiClass: function(cmdb_ci_class) {
		this.cmdb_ci_class = cmdb_ci_class;
	}
};
