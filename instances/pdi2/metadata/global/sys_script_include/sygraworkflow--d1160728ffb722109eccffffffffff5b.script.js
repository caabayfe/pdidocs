var SygraWorkflow = Class.create();
SygraWorkflow.prototype = {
    initialize: function() {},

    submitJob: function(seedData, pipelineDetails) {
        var isError = false;
        var responseMessage;

        var processData;
        try {
            //Preparing the dataset definition if the table name is present in seedData
            if (seedData) {
                var tableName = seedData.tableName;
                if (tableName) {
                    fieldNames = seedData.fieldNames;
                    var maxRowLimit = seedData.maxRowLimit || 1000;

                    var encodedQuery = "";
                    if (seedData.encodedQuery != "" || seedData.encodedQuery != null || seedData.encodedQuery != undefined) encodedQuery = seedData.encodedQuery;

                    processData = new sn_ml.DatasetDefinition({
                        'tableName': tableName,
                        'fieldNames': fieldNames,
                        'maxRowLimit': maxRowLimit,
                        'encodedQuery': encodedQuery
                    });
                }
            }

            //Preparing pipeline input
            var requestLabel = pipelineDetails.label || "sygra_data_gen";
            var requestDescription = pipelineDetails.description || "";

            var pipelineInput = {};
            //Adding datasets only if provided by user
            if (processData) {
                pipelineInput["datasets"] = {
                    "incidents": processData
                };
            } else pipelineInput["datasets"] = {};

            var config = pipelineDetails.sygraConfig || {};

            //Setting num_records value to 10 by default if it is empty.
            if (!config.hasOwnProperty("num_records")) {
                config["num_records"] = 10;
            }
            pipelineInput["config"] = config;

            var solutionPipeline = new sn_ml.WorkflowSolution({
                "label": requestLabel,
                "description": requestDescription,
                "schedulingInfo": {
                    "useCase": "sygra_data_generator",
                    "overrideCapability": {
                        "name": "sygra_data_generator",
                        "version": "29.0",
                    }
                },
                "tags": [
                    "SyGra",
                    "Workflow"
                ],
                "trainingPipeline": {
                    "pipelineName": "sygra_synthetic_data_gen_pipeline_v1",
                    "pipelineInput": pipelineInput
                }
            });


            var solutionName = sn_ml.WorkflowSolutionStore.add(solutionPipeline);
            gs.info('Solution Name: ' + solutionName);

            var solutionVersion = solutionPipeline.submitTrainingJob();
            responseMessage = "Training job successfully submitted";

        } catch (ex) {
            isError = true;
            responseMessage = "Error occurred while submitting Sygra training job: " + ex;
            gs.error(responseMessage);
        }
        return {
            "isError": isError,
            "responseMessage": responseMessage,
            "solutionName": solutionName
        };
    },

    type: 'SygraWorkflow'
};
