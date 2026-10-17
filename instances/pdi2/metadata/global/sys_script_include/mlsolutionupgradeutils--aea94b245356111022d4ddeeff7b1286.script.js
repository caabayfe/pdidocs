var MLSolutionUpgradeUtils = Class.create();

var ML_SOLUTION = MLBaseConstants.ML_SOLUTION;
var ML_CAPABILITY_DEF_BASE = MLBaseConstants.ML_CAPABILITY_DEF_BASE;
var SOLUTION_NAME = "solution_name";
var SYS_CREATED_ON = "sys_created_on";
var VERSION = "version";
var ACTIVE = "active";
var SYS_ID = "sys_id";
var CURRENT_SOLUTION_VERSION = "current_solution_version";
var NOT_IN = "NOT IN";

(function() {
    /** 
     * This method:
	   *  1. Turns active to false for all ml_solution sys_ids having the same SOLUTION_NAME as in mlsolution_id record
	   *  2. Checks if the mlsolution_id has latest version, if not updates with the latest number and updates SYS_CREATED_ON to current datetime 
	   *  3. Updates the version change in ML_CAPABILITY_DEF_BASE if its not highest already
	   * 
     * @param mlsolution_id - sys_id from ml_solution table which has to be active
     * @param plugin_id - plugin id to be printed in logs
     * @return
     */
    MLSolutionUpgradeUtils.setModelIdAsActive = function(mlsolution_id, plugin_id) {
        //var plugin_id = "com.sn_csm.nlu"; // update plugin id here for logging purposes
        //var mlsolution_id = 'fd7b167bbdf5d510f877b95101f5e9ff';
        gs.log("START - ML model solution upgrade script", plugin_id);
        var newsolutionGR = new GlideRecord(ML_SOLUTION);
        newsolutionGR.get(mlsolution_id);
        // Validate if the solution id is correct
        if (newsolutionGR.isValid()) {
            // START - Deactivate any old active ml_solution records
            var updateMlsolGR = new GlideRecord(ML_SOLUTION);
            updateMlsolGR.addQuery(SOLUTION_NAME, newsolutionGR.getValue(SOLUTION_NAME));
            updateMlsolGR.addQuery(SYS_ID, NOT_IN, [mlsolution_id]);
            updateMlsolGR.addQuery(ACTIVE, true);
            updateMlsolGR.query();
            if (updateMlsolGR.hasNext()) {
                updateMlsolGR.setValue(ACTIVE, false); // Set all the active records to false other than mlsolution_id
                updateMlsolGR.updateMultiple();
                gs.log("updated active to false for - " + newsolutionGR.getValue(SOLUTION_NAME), plugin_id);
            } else {
                gs.log("OOB ml_solution is the only active solution sys_id : " + mlsolution_id, plugin_id);
            }
            // END - Deactivate any old active ml_solution records
            // START - update the sys_created_on field of OOB ml_solution record if there customer has any trained non published record
            // this is to make sure consecutive train will generate new ml_solution record
            var customerTrainedMlsolGR = new GlideRecord(ML_SOLUTION);
            customerTrainedMlsolGR.addQuery(SOLUTION_NAME, newsolutionGR.getValue(SOLUTION_NAME));
            customerTrainedMlsolGR.addQuery(SYS_CREATED_ON, ">=", newsolutionGR.getValue(SYS_CREATED_ON));
            customerTrainedMlsolGR.addQuery(SYS_ID, NOT_IN, [mlsolution_id]);
            customerTrainedMlsolGR.query();
            if (customerTrainedMlsolGR.hasNext()) {
                newsolutionGR.setValue(SYS_CREATED_ON, new GlideDateTime()); // this is to ignore any trained model which is not publised
                gs.log("update sys_created_on for new ml_solution - " + newsolutionGR.getValue(SOLUTION_NAME) + ": " + newsolutionGR.update(), plugin_id);
            } else {
                gs.log("Customer has not trained this model : " + mlsolution_id, plugin_id);
            }
            // END - update the sys_created_on
            // START - update latest sequence number for OOB model
            var nextSequence = newsolutionGR.getValue(VERSION);
            var mlsolGR = new GlideRecord(ML_SOLUTION);
            mlsolGR.addQuery(SOLUTION_NAME, newsolutionGR.getValue(SOLUTION_NAME));
            mlsolGR.addQuery(SYS_ID, NOT_IN, newsolutionGR.getValue(SYS_ID));
            mlsolGR.orderByDesc(VERSION);
            mlsolGR.setLimit(1);
            mlsolGR.query();
            if (mlsolGR.next() && parseInt(mlsolGR.getValue(VERSION)) >= newsolutionGR.getValue(VERSION)) {
                nextSequence = parseInt(mlsolGR.getValue(VERSION)) + 1;
                nextSequence += "";
                newsolutionGR.setValue(VERSION, nextSequence);
                newsolutionGR.setValue(ACTIVE, true);
                gs.log("updated sequence to " + nextSequence + " for solution:" + newsolutionGR.getValue(SOLUTION_NAME) + "-" + newsolutionGR.getValue(SYS_ID) + " - " + newsolutionGR.update(), plugin_id);
            } else {
                gs.log("OOB ml_solution has the latest sequence sys_id : " + mlsolution_id, plugin_id);
            }
            // END - update latest sequence number for OOB model
            // START - update ml_capability_definition_base with latest sequence number
            var mldefinitionGR = new GlideRecord(ML_CAPABILITY_DEF_BASE);
            mldefinitionGR.addQuery(SOLUTION_NAME, newsolutionGR.getValue(SOLUTION_NAME));
            mldefinitionGR.addQuery(CURRENT_SOLUTION_VERSION, "!=", nextSequence);
            mldefinitionGR.query();
            if (mldefinitionGR.next()) {
                mldefinitionGR.setValue(CURRENT_SOLUTION_VERSION, nextSequence);
                gs.log("updated sequence to " + nextSequence + " for " + ML_CAPABILITY_DEF_BASE + ":" + mldefinitionGR.getValue(SOLUTION_NAME) + "-" + mldefinitionGR.getValue(SYS_ID) + +" - " + mldefinitionGR.update(), plugin_id);
            } else {
                gs.log(ML_CAPABILITY_DEF_BASE + " record update not needed " + newsolutionGR.getValue(SOLUTION_NAME), plugin_id);
            }
            // START - update ml_capability_definition_base with latest sequence number
        } else {
            gs.log("there is no record in ml_solution with sys_id : " + mlsolution_id);
        }
        gs.log("END - ML model solution upgrade script", plugin_id);
    };

    MLSolutionUpgradeUtils.prototype = {
        initialize: function() {},
        type: 'MLSolutionUpgradeUtils'
    };

})();
