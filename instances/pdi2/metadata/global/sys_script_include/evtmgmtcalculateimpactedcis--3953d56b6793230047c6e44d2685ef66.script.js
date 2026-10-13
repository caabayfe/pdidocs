var EvtMgmtCalculateImpactedCis = Class.create();
EvtMgmtCalculateImpactedCis.prototype = {

    type: 'EvtMgmtCalculateImpactedCis',

    initialize: function() {
        // Classes
        this.impactManager = new SNC.ImpactManager();
        this.batchUtil = new SNC.BatchCommandsUtil();
        this.evtMgmtImpactedServiceGroups = new EvtMgmtImpactedServiceGroups();
        this.evtMgmtCommons = new EvtMgmtCommons();
        this.arrayUtil = new ArrayUtil();

        // Constants
        this.emImpactGraphModel = {
            TABLE: 'em_impacted_graph',
            PARENT_ID: 'parent_id',
            CHILD_ID: 'child_id',
            BUSINESS_SERVICE: 'business_service'
        };
        this.emImpactedCiModel = {
            TABLE: 'em_impacted_ci',
            ALERT_CI: 'alert_ci',
            IMPACTED_CI: 'impacted_ci'
        };
    },

    init: function() {
        // Properties
        this.isImpactedCisEnabled = gs.getProperty('evt_mgmt.impacted_cis.enable', 'true').toString() == 'true';
        this.isConnectedServicesEnabled = gs.getProperty('evt_mgmt.impacted_cis.enable_connected_services', 'true').toString() == 'true';
        this.maxCisLimit = gs.getProperty('evt_mgmt.impacted_cis.max_cis_limit', 10000);
        this.maxLevelsLimit = gs.getProperty('evt_mgmt.impacted_cis.max_levels', 10);
        this.bypassLimitsForServices = gs.getProperty('evt_mgmt.impacted_cis.bypass_limits_for_services', 'true').toString() == 'true';

        this.reset();
    },

    reset: function() {
        // Variables
        this.cisCount = 0;
        this.levelsCount = 0;
        this.impactedCis = {};
        this.impactedServices = {};
    },

    /**
     * Main function
     * Finds impacted CIs (cis, services and service groups) from a single given alert GlideRecord on a specific CI
     * @param alertGr - GlideRecord of an alert on a CI for which impact calculation is wanted
     */
    calculate: function(alertGr) {
        if (!(alertGr instanceof GlideRecord) || alertGr.getTableName() != 'em_alert') {
            this.evtMgmtCommons.addDebugLogNoPrefix(gs.getMessage("{0} script include: Parameter passed to calculate() must be GlideRecord from em_alert table", [this.type]));
            return;
        }
		this.evtMgmtCommons.addDebugLogNoPrefix("****** Impacted CIs calculation starting... ************");

        // Init
        this.init();

        // Check impacted CIs property is enabled
        if (!this.isImpactedCisEnabled) {
            this.evtMgmtCommons.addDebugLogNoPrefix(gs.getMessage("{0} script include: Impact calculation was called although it is disabled", [this.type]));
            return;
        }

        // Add the child itself to impactd CIs
        this.alertCiSysId = alertGr.getValue('cmdb_ci');
        this.addToImpactedCis(this.alertCiSysId);

        // Clear existing records for the alert ci
        this.clearExistingRecords();

        // Run impact calculation
        this.calculateImpactedCis();
    },

    /**
     * Finds all impacted parents and services for the child of the alert
     */
    calculateImpactedCis: function() {
		gs.log("Starting calculateImpactedCis");
        var children = {};
        var services = {
            current: '',
            next: {}
        };

        // Start from looking for the parents of the first CI
        children[this.alertCiSysId] = '';

        do {
            if (this.bypassLimitsForServices || !this.hasReachedMaxLevelsLimit()) {
                var parents = {};
				this.levelsCount++;
				this.evtMgmtCommons.addDebugLogNoPrefix("level=" + this.levelsCount);
                for (var child in children) {
                    var parentsGr = this.getParentsGr(child, services);
                    this.extractParents(parents, parentsGr, services);
                }
                children = this.getChildren(parents, services);
            }
            else {
                children = {};
            }
        }
        while (this.getLength(children));

        this.saveAndReset();
    },

    extractParents: function(parents, parentsGr, services) {
        while (parentsGr.next()) {
            if (!this.bypassLimitsForServices && this.hasReachedMaxCisLimit()) {
                // If limits have been reached then save stored data and force exit
                this.saveAndReset();
                return {};
            }
            var parent = parentsGr.getValue(this.emImpactGraphModel.PARENT_ID);
            var bs = parentsGr.getValue(this.emImpactGraphModel.BUSINESS_SERVICE);

            if (!services.current) {
                services.current = bs;
            }

            if (parent == bs) {
                // Add the service to the impacted SERVICES object
                this.addToImpactedServices(bs);
                // Continue traveling up the tree only if connected services is enabled, even if a limit was reached
                if (this.isConnectedServicesEnabled) {
                    if (!this.isLimitReached() || (this.isLimitReached() && this.bypassLimitsForServices)) {
                        if (!services.next.hasOwnProperty(bs)) {
                            services.next[bs] = {};
                        }
                        services.next[bs][bs] = {};
                    }
                }
            }
            else if (services.current != bs) {
                if (!services.next.hasOwnProperty(bs)) {
                    services.next[bs] = {};
                }
                services.next[bs][parent] = '';
            } else {
                // Keep adding impacted CIs only if the limits weren't reached
                if (!this.isLimitReached()) {
                    // Add the CI to the impacted CIS object
                    this.addToImpactedCis(parent);
                }
                parents[parent] = '';
            }
        }
    },

    getChildren: function(parents, services) {
        if (!this.bypassLimitsForServices && this.hasReachedMaxCisLimit()) {
            return {};
        }
        // Return parents as the children
        else if(parents && this.getLength(parents)) {
            return parents;
        }
        else {
            // Save to DB and reset objects
            this.saveAndReset();

            // Get children from the next service
            if (this.getLength(services.next)) {
                services.current = Object.keys(services.next).shift(); // Get the first BS in object and make it current
                var children = services.next[services.current]; // Get the children of that BS
                for (var child in children) {
                    if (child != services.current) {
                        this.addToImpactedCis(child);
                    }
                }
                delete(services.next[services.current]); // Remove the BS as it is no longer needed in next object
                return children; // Return the children
            } else {
                return {};
            }
        }
    },

    /**
     * Increases the levels counter by 1 and returns GlideRecords of the parent of the given CI
     * @param ci
     * @param [bs]
     * @returns {*}
     */
    getParentsGr: function(ci, services) {
        if (!services.current || (ci == services.current && this.isConnectedServicesEnabled)) {
            services.current = '';
            return this.impactManager.getParentsGrByCi(ci);
        } else {
            return this.impactManager.getParentsGrByCisAndBs(ci, services.current);
        }
    },

    /**
     * Adds the given ciSysId to the impacted cis object
     * @param ciSysId
     * @returns {*}
     */
    addToImpactedCis: function(ciSysId) {
        this.addImpact(this.impactedCis, ciSysId);
    },

    /**
     * Adds the given ciSysId to the impacted services object
     * @param ciSysId
     * @returns {*}
     */
    addToImpactedServices: function(ciSysId) {
        this.addImpact(this.impactedServices, ciSysId);
    },

    /**
     * If ciSysId doesn't exist in impactedObject: Adds the given ciSysId to the given impactedObject and returns ciSysId in an array
     * Else: return an empty array
     * @param impactedObject
     * @param ciSysId
     * @returns {*}
     */
    addImpact: function(impactedObject, ciSysId) {
        if (!impactedObject.hasOwnProperty(ciSysId)) {
            this.cisCount++;
            impactedObject[ciSysId] = '';
        }
    },

    /**
     * Saves the impacted CIs and clears the objects
     */
    saveAndReset: function() {
        this.saveResults();
        this.reset();
    },

    /**
     * Saves the impacted CIs in the DB
     */
    saveResults: function() {
        // Prepare results
		this.evtMgmtCommons.addDebugLogNoPrefix("Starting saveResults()");
        var impactedCis = Object.keys(this.impactedCis); // CIs
		this.evtMgmtCommons.addDebugLogNoPrefix("After 1st keys");
        var impactedServices = Object.keys(this.impactedServices); // Services
		this.evtMgmtCommons.addDebugLogNoPrefix("After 2nd keys");
        var impactedServiceGroups = this.evtMgmtImpactedServiceGroups.getImpactedServiceGroups(impactedServices); // Service groups

        var allImpactedCis = this.arrayUtil.union(impactedCis, impactedServices, impactedServiceGroups);

        // Save results
        this.insertToDb(allImpactedCis);
    },

    insertToDb: function(ciArray) {
		gs.log("Starting insertToDb()");
        // prepare JSON array for bulk insert
        var jsonArr = [];
        for (var i = 0; i < ciArray.length; i++) {
            this.addCiToImpactJson(ciArray[i], jsonArr);
        }
        // now - insert the new records
        var str = JSON.stringify(jsonArr);
        var domain = this.evtMgmtCommons.getCurrentDomainID();
        this.batchUtil.batchInsertMultiple(str, this.emImpactedCiModel.TABLE, domain);
		this.evtMgmtCommons.addDebugLogNoPrefix("insertToDb(). After batchInsertMultiple");
    },

    /**
     * Removes all records of the alert ci from the em_impacted_ci table
     */
    clearExistingRecords: function() {
        // Delete old records for this alert CI
        var gr = new GlideRecord(this.emImpactedCiModel.TABLE);
        gr.addQuery(this.emImpactedCiModel.ALERT_CI, this.alertCiSysId);
        gr.query();
        gr.deleteMultiple();
    },

    addCiToImpactJson: function(impactedCi, jsonArr) {
        var jsonObj = {};
        if (this.alertCiSysId && impactedCi && (impactedCi != "null")) {
            jsonObj[this.emImpactedCiModel.ALERT_CI] = this.alertCiSysId;
            jsonObj[this.emImpactedCiModel.IMPACTED_CI] = impactedCi;
            jsonArr.push(jsonObj);
        }
    },

    /**
     * Returns a count of the number of elements in the given object
     * @param object
     * @returns {number}
     */
    getLength: function(object) {
        return Object.keys(object).length;
    },

    /**
     * Returns true if one of the limits is reached or about to be reached
     * @returns {boolean}
     */
    isLimitReached: function() {
        return this.hasReachedMaxLevelsLimit() || this.hasReachedMaxCisLimit();
    },

    /**
     * Returns true if level counter with the next level is going to be larger than the max levels
     * @returns {boolean}
     */
    hasReachedMaxLevelsLimit: function() {
        var maxLevelsLimit = parseInt(this.maxLevelsLimit, 10);
        if (this.levelsCount > maxLevelsLimit) {
            this.evtMgmtCommons.addDebugLogNoPrefix(gs.getMessage("{0} script include: Reached the max levels of {1}", [this.type, maxLevelsLimit]));
            return true;
        }
        return false;
    },

    /**
     * Returns true if the cis counter equals or larger than the max cis limit
     * @returns {boolean}
     */
    hasReachedMaxCisLimit: function() {
        var maxCisLimit = parseInt(this.maxCisLimit, 10);
        if (this.cisCount >= maxCisLimit) {
            this.evtMgmtCommons.addDebugLogNoPrefix(gs.getMessage("{0} script include: Reached the max CIs of {1}", [this.type, maxCisLimit]));
            return true;
        }
        return false;
    },

};
