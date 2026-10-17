var EvtMgmtAutoTrainer = Class.create();
EvtMgmtAutoTrainer.prototype = {
    initialize: function() {
        this.similarity = {
            'solutionName': gs.getProperty("evt_mgmt_similarity_solution_title", "ml_x_global_alert_similarity"),
            'minAlerts': gs.getProperty('glide.platform_ml.api.min_similarity_window_records')
        };
        this.clustering = {
            'solutionName': gs.getProperty('sa_analytics.ml.solution_name', 'ml_sn_global_global_em_alert_clustering_solution'),
            'minAlerts': gs.getProperty('glide.platform_ml.api.min_clustering_records')
        };
        this.EMSolutions = [this.similarity, this.clustering];
        this.evtMgmtCommons = new EvtMgmtCommons();
        this.debugLog = this.type + " script include: \n";
    },

    train: function() {
        for (var solution in this.EMSolutions) {
            if (!this.EMSolutions.hasOwnProperty(solution)) {
                continue;
            }
            var solutionDefGr = new GlideRecord('ml_capability_definition_base');
            solutionDefGr.addQuery('solution_name', this.EMSolutions[solution].solutionName);
            solutionDefGr.addQuery('active', true);
            solutionDefGr.query();
            if (!solutionDefGr.next() || !solutionDefGr.isValidRecord() || !solutionDefGr.canWrite()) {
                this.debugLog += "Invalid or not active solution definition " + this.EMSolutions[solution].solutionName + '.\n';
                continue;
            }
            var solutionLabel = solutionDefGr.getValue("solution_label");
            if (this.checkConditions(solutionDefGr, this.EMSolutions[solution].minAlerts)) {
                var capabilityGr = solutionDefGr.capability.getRefRecord();
                if (!capabilityGr.isValidRecord()) {
                    this.debugLog += "Invalid solution capability for " + solutionLabel + " solution definition. \n";
                    continue;
                }
                var validationObj = new MlValidationHelper().preTrainingValidation(capabilityGr.getValue("value"), solutionDefGr);
                if (!validationObj.validation) {
                    this.debugLog += "The pre training validation failed for " + solutionLabel + " solution definition. \n";
                    continue;
                }
                new global.MLSolutionDefinitionUtils().trainCapabilitySolDef(solutionDefGr);
                gs.info("The " + solutionLabel + " ML solution has begun training");
            }
        }
        this.evtMgmtCommons.addDebugLogNoPrefix(this.debugLog);
    },

    // Checks whether the conditions for solution activation exist, i.e:
    // ML solution entitlement
    // The number of alerts surpass the minimum requirement
    // The solution isn't already activated
    checkConditions: function(solutionDefGr, minAlerts) {
        var result = false;
        var solutionName = solutionDefGr.getValue('solution_name');
        var entitlementProperty = gs.getProperty('evt_mgmt.ml_solutions.overwrite_entitlement', 'disable');
        var mlEntitlement = new MlValidationHelper().checkEntitlements(solutionDefGr.getValue('capability')).validation;
        if (entitlementProperty != 'disable') {
            gs.info("The ML entitlement check is overwritten with the value of " + entitlementProperty);
            mlEntitlement = (entitlementProperty == 'true');
        }
        if (mlEntitlement) {
            this.debugLog += "The " + solutionName + " solution has entitlement. \n";
            if (new MLTriggerAutoTrain().getSolutionRecords(solutionDefGr.getUniqueValue()).actualRows >= minAlerts) {
                this.debug += this.type + " script include: The " + solutionName + " surpasses the minimum alerts required for training. \n";
                if (new MLRequestSchedule().isCapabilitySolutionCurrentlyTraining(solutionDefGr.getUniqueValue()) == false &&
                    new global.MLSolutionResult().findActiveSolution(solutionName) == null) {
                    this.debugLog += "The " + solutionName + " does not have active solution. \n";
                    result = true;
                }
            }
        }
        this.debugLog += "The ML solution " + solutionName + " has been checked for auto training with the result of " + result + "\n";
        return result;
    },

    type: 'EvtMgmtAutoTrainer'
};
