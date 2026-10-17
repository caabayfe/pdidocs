var AvailabilityConstants = Class.create();
AvailabilityConstants.prototype = {
	initialize: function() {},
	// Properties
	PROP_AVAILABILITY_V2: 'com.snc.availability.v2',
	PROP_AVAILABILITY_COMMITMENT_TZ: 'spm.availability.commitment.tz',
	PROP_AVAILABILITY_GLOBAL_TZ: 'spm.availability.global.tz',
	// Tables
	CMDB_CI_OUTAGE: 'cmdb_ci_outage',
	CMDB_OUTAGE_CI_MTOM: 'cmdb_outage_ci_mtom',
	SERVICE_OFFERING_COMMITMENT: 'service_offering_commitment',
	ALERT_GROUP: 'cmdb_ci_alert_group',
	DYNAMIC_CI_GROUP: 'cmdb_ci_query_based_service',
	CMN_SCHEDULE_SPAN: 'cmn_schedule_span',
	SERVICE_AVAILABILITY: 'service_availability',

	// Outage Fields
	TYPE: 'type',
	OUTAGE: 'outage',
	PLANNED: 'planned',
	CMDB_CI: 'cmdb_ci',
	BEGIN: 'begin',
	END: 'end',

	AVAIL_FIELDS: {
		SERVICE_COMMITMENT: 'service_commitment',
		TYPE: 'type',
		START: 'start',
		END: 'end',
		ABSOLUTE_DOWNTIME: 'absolute_downtime',
		SCHEDULED_DOWNTIME: 'scheduled_downtime',
		SCHEDULED_AVAILABILITY: 'scheduled_availability',
		ABSOLUTE_AVAILABILITY: 'absolute_availability',
		ABSOLUTE_COUNT: 'absolute_count',
		SCHEDULED_COUNT: 'scheduled_count',
		MTBF: 'mtbf',
		MTRS: 'mtrs',
		AST: 'ast',
		ALLOWED_DOWNTIME: 'allowed_downtime',
		MET_COMMITMENT: 'met_commitment',
		TIME_ZONE: 'time_zone'
	},

	// Service Offering Commitment Fields
	SERVICE_OFFERING: 'service_offering',
	CMDB_CI: 'cmdb_ci',
	SERVICE_COMMITMENT: 'service_commitment',

	// Availability types based on type field in service_availability table
	AVAIL_TYPES: {
		ANNUALLY: 'annually',
		MONTHLY: 'monthly',
		WEEKLY: 'weekly',
		DAILY: 'daily',
		LAST_12_MONTHS: 'last12months',
		LAST_30_DAYS: 'last30days',
		LAST_7_DAYS: 'last7days',
		FIXED: ['annually', 'monthly', 'weekly', 'daily'],
		ROLLING: ['last12months', 'last30days', 'last7days']
	},

	DURATIONS: {
		LAST_12_MONTHS: 12,
		LAST_30_DAYS: 30,
		LAST_7_DAYS: 7
	},

	// Availability segment types
	SEGMENT_TYPES: {
		FIXED: 'fixed',
		ROLLING: 'rolling'
	},
  
	// Types
	OUTAGE_TYPES: {
		OUTAGE: 'outage',
		PLANNED: 'planned'
	},

	EXCLUDED_APPLICATION_TABLES: function() {
		return [
			this.ALERT_GROUP,
			this.DYNAMIC_CI_GROUP
		];
	},
	type: 'AvailabilityConstants'
};
