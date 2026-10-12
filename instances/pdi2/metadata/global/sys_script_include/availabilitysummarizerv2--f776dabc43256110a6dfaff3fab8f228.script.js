var AvailabilitySummarizerV2 = Class.create();
AvailabilitySummarizerV2.prototype = {
    initialize: function() {
        this.CONSTANTS = (new global.AvailabilityConstants());
        this.UTILS = (new global.AvailabilityUtils());
        this.ac = (new global.AvailabilityCalculatorV2());
        this.cmdb_ci;
        this.commitments;
        // set timezone based on sys_properties
        this.timezone = this.UTILS.getTimezoneForCalculation();
    },
    /**
     * An optional setter to specify which timezone should be used for availaility calculation
     * @param {String} tz - timezone to set
     */
    setTimezone: function(tz) {
        this.timezone = tz;
    },
    /**
     * An optional setter to specify which CI should have availaility calculated
     * @param {GlideRecord/String} cmdb_ci - GlideRecord or sys_id of CI have availability calculated
     */
    setCi: function(cmdb_ci) {
        if (typeof cmdb_ci === "string") {
            var grCi = new GlideRecord('cmdb_ci');
            grCi.get(cmdb_ci);
            this.cmdb_ci = grCi;
        } else
            this.cmdb_ci = cmdb_ci;
    },
    /**
     * An optional setter to specify which service commitments of the CI to have availability calculated for
     * @param {Array} commitments - Array of service_commit sys_ids
     */
    setCommitments: function(commitments) {
        this.commitments = commitments;
    },
    /**
     * Get all offerings associated to any availability service_commitment
     */
    _getOfferings: function() {
        if (this.cmdb_ci != null)
            return false;

        var offeringCommits = new GlideAggregate(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
        offeringCommits.addQuery('service_commitment.type', 'availability');
        // ensure that there is either a configuration item populated, or a service offering that is in published state
        offeringCommits.addEncodedQuery('service_offeringISNOTEMPTY^service_offering.state=published^ORservice_offering.state=');
        offeringCommits.groupBy(this.CONSTANTS.SERVICE_OFFERING);
        offeringCommits.query();
        return offeringCommits;
    },

    /**
     * Get all service commitment records associated to service offerings
     * @Param offeringId - sys_id of service_offering
     * @param {array} commitments - array of sys_ids of service commitment records
     */
    _getOfferingToCommitmentGr: function(offeringId, commitments) {
        return this.UTILS.getOfferingToCommitmentGr(offeringId, commitments);
    },

    /**
     * Get all commitment records associated to configuration_item (application service)
     * @Param cmdbCi - sys_id of configuration_item
     * @param {array} commitments - array of sys_ids of service commitment records
     */
    _getCIsToCommitmentGr: function(cmdbCi, commitments) {
        return this.UTILS.getCIsToCommitmentGr(cmdbCi, commitments);
    },

    /**
     * Get service_offering_commitments needed for Availability calculator by timezone
     * @param {GlideRecord} cmdbCi - GlideRecord CI have availability calculated
     * @param {Array} commitments - Array of service_commit sys_ids
     * @param {timezone/string}     - timezone
     */
    _getCommitmentsByTimezone: function(cmdbCi, commitments, timezone) {
        return this.UTILS.getCommitmentsByTimezone(cmdbCi, commitments, timezone);
    },

    /**
     * Get all configuration items other than service_offerings assocaited to any availbility service_commitment
     */
    _getConfigurationItems: function() {
        if (this.cmdb_ci != null)
            return false;

        var cmdbiCommits = new GlideAggregate(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
        cmdbiCommits.addQuery('service_commitment.type', 'availability');
        cmdbiCommits.addEncodedQuery('cmdb_ciISNOTEMPTY');
        cmdbiCommits.groupBy(this.CONSTANTS.CMDB_CI);
        cmdbiCommits.query();
        return cmdbiCommits;
    },

    /**
     * Get service_offering_commitments needed for Availability calculator to generate availability records
     * @param {GlideRecord} cmdb_ci - GlideRecord CI have availability calculated
     * @param {Array} commitments - Array of service_commit sys_ids
     */
    _getCommitments: function(cmdb_ci, commitments) {
        var commits = new GlideRecord(this.CONSTANTS.SERVICE_OFFERING_COMMITMENT);
        commits.addQuery('service_commitment.type', 'availability');

        // ensure that there is either a configuration item populated, or a service offering that is in published state
        commits.addEncodedQuery('cmdb_ciISNOTEMPTY^ORservice_offering.state=published^ORservice_offering.state=');

        if (cmdb_ci != null)
            commits.addQuery(this.CONSTANTS.SERVICE_OFFERING, cmdb_ci).addOrCondition(this.CONSTANTS.CMDB_CI, cmdb_ci);
        if (this.commitments != null)
            commits.addQuery(this.CONSTANTS.SERVICE_COMMITMENT, commitments);
        commits.query();
        return commits;
    },

    /**
     * Generates availability records for all CI items and commitments
     * @param {GlideDateTime} begin - the beginning of the interval to calculate availability 
     * @param {GlideDateTime} end - the end of the interval to calculate availability
     */
    _summarizeAll: function(begin, end) {
        if (!this.timezone) {
            // use timezone of service commitment for availability calculation
            this._summarizeAllWithCommitmentTZ(begin, end, null, null);
        } else {
            // use global timezone for availability calculation
            // if global timezone is empty then use system timezone as global timezone
            this._summarizeAllWithGlobalTZ(begin, end);
        }
    },

    /**
     * Generates availability records for all CIs and offerings using globally defined timezone
     * @param {GlideDateTime} begin - the beginning of the interval to calculate availability 
     * @param {GlideDateTime} end - the end of the interval to calculate availability
     */
    _summarizeAllWithGlobalTZ: function(begin, end) {
        var offeringsCommitmentGr = this._getOfferings();
        var commitmentsGr;
        while (offeringsCommitmentGr.next()) {
            commitmentsGr = this._getCommitments(offeringsCommitmentGr.service_offering);
            this.ac.setCi(offeringsCommitmentGr.service_offering);
            this.ac.setOfferingCommitments(commitmentsGr);
            this.ac.setTimezone(this.timezone);
            this.ac.calculate(begin, end);
        }

        var cmdbCiCommitmentGr = this._getConfigurationItems();
        while (cmdbCiCommitmentGr.next()) {
            commitmentsGr = this._getCommitments(cmdbCiCommitmentGr.cmdb_ci);
            this.ac.setCi(cmdbCiCommitmentGr.cmdb_ci);
            this.ac.setOfferingCommitments(commitmentsGr);
            this.ac.setTimezone(this.timezone);
            this.ac.calculate(begin, end);
        }
    },

    /**
     * Generates availability records for all CIs and offerings using service commitment timezone
     * @param {GlideDateTime} begin - the beginning of the interval to calculate availability 
     * @param {GlideDateTime} end - the end of the interval to calculate availability
     * @param {string} ciSysId - sys_id of either service_offering or configuration_item
     * @param {array} commitments - array of sys_ids of service commitment records
     */
    _summarizeAllWithCommitmentTZ: function(begin, end, ciSysId, commitments) {
        // get commitment records for offerings
        var offeringsCommitmentGr = this._getOfferingToCommitmentGr(ciSysId, commitments);
        var commitmentsGr;
        while (offeringsCommitmentGr.next()) {
            var offeringCommitmentTz = offeringsCommitmentGr.getValue('service_commitment.timezone');
            commitmentsGr = this._getCommitmentsByTimezone(offeringsCommitmentGr.service_offering, commitments, offeringCommitmentTz);
            this.ac.setCi(offeringsCommitmentGr.service_offering);
            this.ac.setOfferingCommitments(commitmentsGr);
            this.ac.setTimezone(offeringCommitmentTz);
            this.ac.calculate(begin, end);
        }

        // get commitment records for configuration_items(application services)
        var cmdbCiCommitmentGr = this._getCIsToCommitmentGr(ciSysId, commitments);
        while (cmdbCiCommitmentGr.next()) {
            var cmdbCiCommitmentTz = cmdbCiCommitmentGr.getValue('service_commitment.timezone');
            commitmentsGr = this._getCommitmentsByTimezone(cmdbCiCommitmentGr.cmdb_ci, commitments, cmdbCiCommitmentTz);
            this.ac.setCi(cmdbCiCommitmentGr.cmdb_ci);
            this.ac.setOfferingCommitments(commitmentsGr);
            this.ac.setTimezone(cmdbCiCommitmentTz);
            this.ac.calculate(begin, end);
        }
    },
    /**
     * Generates availability records for all CI items and commitments unless set via setter methods
     * @param {GlideDateTime} begin - the beginning of the interval to calculate availability 
     * @param {GlideDateTime} end - the end of the interval to calculate availability
     */
    summarize: function(begin, end) {
        if (this.cmdb_ci) {
            if (!this.timezone) {
                // calculate based on commitment tz
                this._summarizeAllWithCommitmentTZ(begin, end, this.cmdb_ci, this.commitments);
            } else {
                // calculate based on global tz
                this.ac.setCi(this.cmdb_ci);
                this.ac.setOfferingCommitments(this._getCommitments(this.cmdb_ci.sys_id, this.commitments));
                this.ac.setTimezone(this.timezone);
                this.ac.calculate(begin, end);
            }
        } else
            this._summarizeAll(begin, end);
    },

    type: 'AvailabilitySummarizerV2'
};
