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
    var disable_idf = "797a9118eb531110f4e8dc7ab5522889";
    var tfidf_regex_pattern = "c58b5158eb531110f4e8dc7ab552288c"
    var solution_parameters = current.getValue('solution_parameters');
    var solutionDef = current.getValue(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD);
    switch (solution_parameters) {
        case dbscan:
            //add threshold
            var clustering_params = [threshold];
            for (var i = 0; i < clustering_params.length; i++) {
                if (!isAdvanceSolutionParamPresent(clustering_params[i])) {
                    addAdvanceSolutionSetting(clustering_params[i]);
                }
            }
            // remove eplison, minimum_neighbors
            var gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", epsilon + ',' + minimum_neighbors + ',' + ld + ',' + jd);
            gr.deleteMultiple();
            break;
        case tf_idf:
            // remove disable_idf, tfidf_regex_pattern
            var gr = new GlideRecord(global.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, solutionDef);
            gr.addQuery("solution_parameters", "IN", disable_idf + ',' + tfidf_regex_pattern);
            gr.deleteMultiple();
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
