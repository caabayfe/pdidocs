var IntentDiscoveryUtil = Class.create();

IntentDiscoveryUtil.getIDVersionUtil = function() {
    var configUtil = new sn_nlu_discovery.IntentDiscoveryConfigUtil();
    if (configUtil.isOrlando()) {
        return new sn_nlu_discovery.IntentDiscoveryUtilOrlando();
    } else if (configUtil.isParis()) {
        return new sn_nlu_discovery.IntentDiscoveryUtilParis();
    } else if (configUtil.isQuebec() || (gs.getProperty('sn_nlu_discovery.use_java_trainer', 'false') == 'true')) {
        return new sn_nlu_discovery.IntentDiscoveryUtilQuebec();
    }
    return new sn_nlu_discovery.IntentDiscoveryIntegrator();
};

function getModelGrById(modelId) {
    var modelGr = new GlideRecord('sys_nlu_model');
    modelGr.addQuery('sys_id', modelId);
    modelGr.query();
    if (modelGr.next())
        return modelGr;
    return null;
}

IntentDiscoveryUtil.prototype = {
    initialize: function() {
        this.integrator = IntentDiscoveryUtil.getIDVersionUtil();
        this.JOB_REQUEST_SUCCEDED = "running_generate";
        this.JOB_REQUEST_FAILED = "error";
    },

    createReport: function(reportDef, extraOpts) {
        extraOpts = extraOpts || {};
        if (reportDef.getValue("user_fields") && reportDef.getValue("user_fields") != null) {
            var userFields = reportDef.getValue("user_fields").split(",");
            var configUtil = new sn_nlu_discovery.IntentDiscoveryConfigUtil();
            var validFields = configUtil.checkFieldsAreValid(reportDef.getValue("table"), userFields);
            if (validFields.length > 0) {
                extraOpts.user_fields = validFields;
            }
        }

        extraOpts = this.integrator.getOptions(extraOpts, reportDef);

        var solutionName = this.integrator.createJob(reportDef.getValue("sys_id"), reportDef.getValue("table"), reportDef.getValue("field"), reportDef.getValue("filter"), extraOpts);
        gs.info("created job with solution name: " + solutionName);

        var solutionDef = new GlideRecord("ml_capability_definition_base");
        solutionDef.addQuery("solution_name", solutionName);
        solutionDef.query();

        if (solutionDef.next()) {
            reportDef.solution_definition = solutionDef.getUniqueValue();
            reportDef.status = this.JOB_REQUEST_SUCCEDED;
            reportDef.update();
        } else {
            gs.error("Unable to create solution definition");
            reportDef.status = this.JOB_REQUEST_FAILED;
            reportDef.update();
        }
        return solutionName;
    },
    rerun: function(reportDefRec) {
        // Load the solution definition
        var solutionDefId = reportDefRec.getValue('solution_definition');
        var solutionDefRec = new GlideRecord('ml_capability_definition_base');
        solutionDefRec.get(solutionDefId);

        if (!solutionDefRec.isValidRecord()) {
            var errorMsg = 'Cannot load solution definition with ID ' + solutionDefId;
            gs.warn('[DISC] rerun_report: ' + errorMsg);
            return {
                error: errorMsg
            };
        }
        return this.integrator.rerun(solutionDefId, solutionDefRec, reportDefRec);
    },

    getSolution: function(solutionName) {
        try {
            return this.integrator.getSolution(solutionName);
        } catch (e) {
            return null;
        }
    },

    cloneIntent: function(reportId, taxModel, reportIntentName, modelId, modelProps, secondaryLanguages) {
        if (modelId === null || getModelGrById(modelId) === null) {
            // create new model if model doesn't exist
            var fields = ['display_name', 'language', 'category'];
            modelId = global.NLUSystemUtil.copyRecord('sys_nlu_model', fields, modelProps);
        }
        return new sn_nlu_discovery.IntentDiscoveryCloneUtil(reportId, reportIntentName, taxModel).cloneIntent(modelId, secondaryLanguages);
    },
    type: 'IntentDiscoveryUtil'
};
