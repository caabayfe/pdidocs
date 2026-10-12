(function executeRule(current, previous /*null when async*/ ) {
    /*if DBSCAN is selected than remove threshold for the same solution definition
     */
    var ld = "668619e753220010d1dcddeeff7b125a";
    var jd = "abc3169eeb021110f4e8dc7ab5522885";
    var dbscan = "f4c4ca8053c04010d1dcddeeff7b1236";
    var remove_clustered_points = "6d558e8053c04010d1dcddeeff7b1273";
    var threshold = "999c201453733300d1dcddeeff7b1212";
    var epsilon = "30cbe4d053733300d1dcddeeff7b1252";
    var minimum_neighbors = "32ddecd053733300d1dcddeeff7b12c2";
    var tf_idf = "6bbf34405f633300d1dc4560be731334";
    var solution_parameters = current.getValue('solution_parameters');
    var solutionDef = current.getValue(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD);
    switch (solution_parameters) {
        case ld:
            var clustering_params = [dbscan];
            for (var i = 0; i < clustering_params.length; i++) {
                if (!isAdvanceSolutionParamPresent(clustering_params[i])) {
                    addAdvanceSolutionSetting(clustering_params[i]);
                }
            }
            // Remove jd, tf-idf from advanced parameter if present.
            var gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", tf_idf + ',' + jd);
            gr.deleteMultiple();
            break;
        case jd:
            var clustering_params = [dbscan];
            for (var i = 0; i < clustering_params.length; i++) {
                if (!isAdvanceSolutionParamPresent(clustering_params[i])) {
                    addAdvanceSolutionSetting(clustering_params[i]);
                }
            }
            // Remove ld, tf-idf from advanced parameter if present.
            var gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", tf_idf + ',' + ld);
            gr.deleteMultiple();
            break;
        case tf_idf:
            // Remove ld, jd from advanced parameter if present.
            var gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", ld + ',' + jd);
            gr.deleteMultiple();
            break;
        case dbscan:
            var gr = new GlideRecord(global.MLBaseConstants.ML_CAPABILITY_DEF_CLUSTERING);
            if (gr.get(solutionDef)) {
                gr.setValue('update_frequency', 'do_not_update');
                gr.update();
            }
            //Remove threshold from advanced parameter if present.
            gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", threshold);
            gr.deleteMultiple();

            //add epsilon, minimum neighbors if the solution parameters are active
            var clustering_params = [minimum_neighbors, epsilon];

            for (var i = 0; i < clustering_params.length; i++) {
                if (!isAdvanceSolutionParamPresent(clustering_params[i])) {
                    addAdvanceSolutionSetting(clustering_params[i]);
                }
            }
            break;
        case remove_clustered_points:
            //remove_clustered_points doesnot work for dbscan;
            gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", dbscan);
            gr.query();
            if (gr.next()) {
                gs.addErrorMessage(gs.getMessage("DBSCAN is added to the solution defintion. Remove clustered points doesnot work with dbscan. Please remove DBSCAN and add Remove clustered Points"));
                current.setAbortAction(true);
            }
            break;
        case threshold:
            //threshold doesnot work for dbscan;
            gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", dbscan);
            gr.query();
            if (gr.next()) {
                gs.addErrorMessage(gs.getMessage("DBSCAN is added to the solution defintion. Target coverage solution coverage doesnot work with dbscan. Please remove DBSCAN and add threshold"));
                current.setAbortAction(true);
            }
            break;
    }

    function addAdvanceSolutionSetting(solutionParamSysid) {
        var solParamSysidGr = new GlideRecord('ml_solution_parameters');
        solParamSysidGr.addActiveQuery();
        solParamSysidGr.addQuery('sys_id', solutionParamSysid);
        solParamSysidGr.query();
        if (solParamSysidGr.next()) {
            var gr = new GlideRecord('ml_advanced_solution_settings');
            gr.initialize();
            gr.setValue('solution_parameters', solParamSysidGr.getValue('sys_id'));
            gr.setValue('ml_capability_definition', solutionDef);
            gr.setValue('user_inputs', solParamSysidGr.getValue('user_inputs'));
            gr.insert();
        }
    }

    function isAdvanceSolutionParamPresent(param) {
        if (param) {
            var gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery('solution_parameters', param);
            gr.query();
            if (gr.next()) {
                return true;
            }
            return false;
        }
    }
})(current, previous);
