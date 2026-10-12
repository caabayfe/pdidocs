(function executeRule(current, previous /*null when async*/ ) {

    if (gs.nil(current.table))
        return;

    var count = 0;
    var capability = current.getValue('capability');
    var gr = new GlideAggregate(current.table);
    gr.setCategory("platform_ml");
    gr.addAggregate('COUNT');
    if (capability == 'similarity_trainer' || capability == 'clustering_trainer' || capability == 'workflow_clustering_trainer' || capability == 'workflow_similarity_trainer') {
        gr.addEncodedQuery(current.similarity_window_filter);
    } else {
        gr.addEncodedQuery(current.input_filter);
    }

    if (GlidePluginManager.isActive('com.glide.domain.msp_extensions.installer')) {
        gr.addDomainQuery(current);
    }

    gr.query();
    if (gr.next()) {
        count = gr.getAggregate('COUNT');
        var maxNumber = ""; // Initializing Max Number value
        switch (capability) {
            case "similarity_trainer":
            case "workflow_similarity_trainer":
                maxNumber = gs.getProperty('glide.platform_ml.api.max_similarity_window_records');
                count = checkRowCountValue(count, maxNumber);
                break;
            case "clustering_trainer":
            case "workflow_clustering_trainer":
                maxNumber = gs.getProperty('glide.platform_ml.api.max_clustering_records');
                count = checkRowCountValue(count, maxNumber);
                break;
            case "classification_trainer":
            case "workflow_classification_trainer":
                maxNumber = gs.getProperty('glide.platform_ml.api.csv_max_line');
                count = checkRowCountValue(count, maxNumber);
                break;
            case "regression_trainer":
            case "workflow_regression_trainer":
                maxNumber = gs.getProperty('glide.platform_ml.api.max_regression_records');
                count = checkRowCountValue(count, maxNumber);
                break;
            default:
        }
    }

    current.row_count = count;
    current.setWorkflow(false);
    current.update();

    function checkRowCountValue(count, maxrecords) {
        if (JSUtil.notNil(maxrecords) && count > parseInt(maxrecords)) {
            return parseInt(maxrecords);
        } else {
            return count;
        }
    }

})(current, previous);
