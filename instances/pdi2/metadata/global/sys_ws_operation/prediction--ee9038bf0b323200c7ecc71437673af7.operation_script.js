(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var threshold = NaN;
	if (request.queryParams.predict_threshold) {
		threshold = request.queryParams.predict_threshold[0];
	}
	var topN = 1;
    if (request.queryParams.top_n) {
        topN = request.queryParams.top_n[0];
    }
	var confidenceLevel = 95;
    if (request.queryParams.confidence_level) {
        confidenceLevel = request.queryParams.confidence_level[0];
    }
	if(( confidenceLevel<0  )|| (confidenceLevel>100)){
		return {
			"input" : params,
			"output" : "Unable to predict: Confidence Level must lie in 0-100 range!"
		};
	}
	
	var i18nObj = i18n();
	var solutionName = request.pathParams.solution_name;	
	var solutionFinder = new sn_ml.SolutionFinder();
	var solution = solutionFinder.getSolution(solutionName);
	var params = request.queryParams;
	
	var activeSolution = new GlideRecord("ml_solution");
	activeSolution.addQuery("solution_name", solutionName);
	activeSolution.addQuery("active","true");
	activeSolution.query();
	if (!activeSolution.next()){
		return {
			"input" : params,
			"output" : "Unable to predict: No active solutions found for " + solutionName + ". Please activate a solution first!"
		};
	}
	
	var ml_ui = false;
	var ml_capability = '';
	var table = params.table ? params.table : '';
	var op_table = params.op_table ? params.op_table : '';
	var ml_prediction_type = params.testtype ? params.testtype: 'single'; // type = single, batch
	var field_list = '';
	var op_field_list = '';
	var batch_encodedQuery = params.encodedQuery ? params.encodedQuery : '';
	var input_field_list = params.input_field_list;
	var inputs = {};
	ml_capability = solution.getCapability();
	
	// For classification, fetch the results, apply threshold and then check for topN constraint
	var originalTopN = topN;
	if(ml_capability === 'classification_trainer' || ml_capability === 'workflow_classification_trainer')
		topN = (topN * MLBaseConstants.CLASSIFICATION_TOP_N_MULTIPLIER).toFixed();
	
	if (params.ml_ui) {
		ml_ui = true;
		ml_capability = solution.getCapability();
		var solution_gr = new GlideRecord(MLBaseConstants.ML_SOLUTION);
		if(solution_gr.get(params.solution_id +'')) {
			switch(ml_capability) {
				case 'similarity_trainer' :
				case 'workflow_similarity_trainer' :
					field_list = solution_gr.getValue('fields_to_compare');
					op_field_list = solution_gr.getValue('prediction_input_fields'); 
					break;
				case 'classification_trainer': 
				case 'workflow_classification_trainer':
					field_list = solution_gr.getValue('input_fields');
					op_field_list = solution_gr.getValue('input_fields');
					break;
				case 'clustering_trainer' :
				case 'workflow_clustering_trainer' :
					field_list = solution_gr.getValue('prediction_input_fields');
					op_field_list = solution_gr.getValue('prediction_input_fields');
					break;
				case 'regression_trainer':
				case 'workflow_regression_trainer':
					field_list = solution_gr.getValue('input_fields');
					op_field_list = solution_gr.getValue('input_fields');
					break;
			}
		}	
		for (var k =0; k < input_field_list.length; k++) {
			var obj = JSON.parse(input_field_list[k]);
			for (var key in obj){
				if (obj.hasOwnProperty(key)) {
					inputs[key] = obj[key].toString();
				}
			}
		}
	} else {
		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				inputs[key] = params[key].toString();
			}
		}
	}
	
	var mlPredictor = new MLPredictor();
	var scopeSupportedDBQuery = new MLScopedAppsSupport();
	var result = {};
	result['inputs'] = inputs;
	result['output'] = [];
	result["output_msg"] = "Unable to predict.";
	result["type"]= "failure";
	if(ml_prediction_type == 'single'){
		if(ml_capability == 'regression_trainer' || ml_capability == 'workflow_regression_trainer'){
			var outcomeArr = solution.predictTextTopNConfInterval(inputs, topN, confidenceLevel);
		} else{
			var outcomeArr = solution.predictTextTopN(inputs, topN);
		}
		var outputs = generateJsonOutput(i18nObj, inputs, solution, outcomeArr, mlPredictor, ml_capability, ml_prediction_type, originalTopN);
		
		//for similarity need records details
		if ((ml_capability == 'similarity_trainer' || ml_capability == 'workflow_similarity_trainer') && op_table && outputs.sysidArr && outputs.sysidArr.length > 0) {
			outputs.outputJSON = scopeSupportedDBQuery.generateSimilarityOutPut(op_table, outputs.outputJSON, op_field_list, outputs.sysidArr);
		}
		var rec = {};
		rec['sys_obj'] = {};
		rec['outcomeArr'] = outputs.outputJSON;
		result['output'].push(rec);
		result["output_msg"] = "";
		result["type"]= "success";
		//for single it will be array of single outcome array
		//for batch it will be records array containing outcome array for each records
	} else if(ml_prediction_type == 'batch'){
		var outcomeArr = solution.predictBatch(table, batch_encodedQuery, 0, 50, 1);
		var rowcount = 0;
		for (var sys_id in outcomeArr) {
			if (outcomeArr.hasOwnProperty(sys_id) && outcomeArr[sys_id]) {
				var rec = {};
				rec['sys_obj'] = outcomeArr[sys_id].inputobj;
				var output = generateJsonOutputBatch(i18nObj, outcomeArr[sys_id].outcomeArr,outcomeArr[sys_id].record,ml_capability);
				rec['outcomeArr'] = output.outputJSON;
				rec['record'] = outcomeArr[sys_id].record;
				result['output'].push(rec);
				rowcount++;
			}
		}
		result["output_msg"] = "";
		result["type"]= "success";
		if(rowcount == 0){
			result.output['sys_obj'] = {};
			result.output['outcomeArr'] = []; 
			result["output_msg"] = "predictions are empty";
			result["type"]= "failure";
		}
	}
	
	//sending table columns if a call is made from Test Solution Page
	if (ml_ui) {
        var columnNameToLabel = [];
		if (ml_prediction_type == 'batch') {
            columnNameToLabel.push({
                'name': 'InputRecord',
                'label': i18nObj.inputRecord
            });
        }
        if (ml_capability == 'classification_trainer' || (ml_capability == 'workflow_classification_trainer')) { 
			columnNameToLabel.push({
                'name': 'ClassName',
                'label': i18nObj.className
            });
			columnNameToLabel.push({
                'name': 'Confidence',
                'label': i18nObj.confidence
            });
			columnNameToLabel.push({
                'name': 'Threshold',
                'label': i18nObj.threshold
            });
        } else if (ml_capability == 'regression_trainer' || (ml_capability == 'workflow_regression_trainer')) { 
			columnNameToLabel.push({
                'name': 'PointEstimate',
                'label': i18nObj.pointEstimate
            });
			columnNameToLabel.push({
                'name': 'LowerBound',
                'label': i18nObj.lowerBound
            });
			columnNameToLabel.push({
                'name': 'UpperBound',
                'label': i18nObj.upperBound
            });
		} else if (ml_capability == 'similarity_trainer' || ml_capability == 'workflow_similarity_trainer') {
			columnNameToLabel.push({
                'name': 'Record',
                'label': i18nObj.record
            });
			columnNameToLabel.push({
                'name': 'Confidence',
                'label': i18nObj.confidence
            });
			columnNameToLabel.push({
                'name': 'Threshold',
                'label': i18nObj.threshold
            });
            var columns = op_field_list.split(',');
            for (var i = columns.length - 1; i >= 0; i--) {
                var columnName = columns[i];
                columnNameToLabel.push({
                    'name': columnName,
                    'label': columnName
                });
			}  
        }
       
        result['columns'] = columnNameToLabel;  
    }
	
	return result;
})(request, response);

function i18n() {
    var i18nObj = {
        'unable2Predict': gs.getMessage("Unable to predict."),
        'serviceunavailable2Predict': gs.getMessage("Service Unavailable to predict or Prediction request might have timedout. Please refer KB1705848"),
        'failed2Predict': gs.getMessage("Prediction has failed. Please check the node logs for more details."),
        'unable2PredictThreshold': gs.getMessage("Prediction results below threshold"),
        'className': gs.getMessage("ClassName"),
        'confidence': gs.getMessage("Confidence"),
        'threshold': gs.getMessage("Threshold"),
		'pointEstimate': gs.getMessage("PointEstimate"),
		'errorEstimate': gs.getMessage("ErrorEstimate"),
		'lowerBound':gs.getMessage("LowerBound"),
		'upperBound':gs.getMessage("UpperBound"),
        'record': gs.getMessage("Record"),
        'inputRecord': gs.getMessage('InputRecord')
    };
    return i18nObj;
}

function generateJsonOutputBatch(i18nObj, outcomeArr, record, ml_capability){
	var output = {};
	output.outputJSON = [];
	output.sysidArr = [];
	var outputObj = {};
	if(outcomeArr.length == 0){
		outputObj = {
				"output_msg":i18nObj.unable2Predict,
				"output":"failure"
			};
		output.outputJSON.push(outputObj);
		return output;
	}

	for (var i = 0; i < outcomeArr.length; i++) {
		if(ml_capability == 'regression_trainer' || ml_capability == 'workflow_regression_trainer'){
				outputObj = {
					"PointEstimate" : outcomeArr[i].outcome,
					"LowerBound" : outcomeArr[i].lowerBound,
					"UpperBound" : outcomeArr[i].upperBound,
					"output": "success",
					"InputRecord": record
			};
		}else{
		var confidence = outcomeArr[i].confidence * 100;
		if (confidence >= outcomeArr[i].threshold) {
				outputObj = {
			    "ClassName" : outcomeArr[i].outcome,
				"Confidence" : confidence,
				"Threshold" : outcomeArr[i].threshold,
				"output": "success",
				"InputRecord": record
			};
		}
		}
			output.outputJSON.push(outputObj);

	}
	output.outputJSON.length != 0 || output.outputJSON.push({"output_msg":i18nObj.unable2PredictThreshold,
				"output":"failure"});
	return output;
}
function generateJsonOutput(i18nObj, inputs, solution, outcomeArr, mlPredictor, ml_capability, type, originalTopN, record ) {
	var output = {};
	output.outputJSON = [];
	output.sysidArr = [];
	var outputObj = {};
	if (outcomeArr == null || outcomeArr.length == 0) {
		outputObj = {
				"output_msg":i18nObj.unable2Predict,
				"output":"failure"
			};
		output.outputJSON.push(outputObj);
		return output;
    }

	for (var i = 0; i < outcomeArr.length; i++) {
		outputObj = {};
		if (!outcomeArr[i].hasPrediction() || JSUtil.nil(outcomeArr[i].predictedValue())) {
			var messageMap = JSON.stringify(outcomeArr[i].getMessagesMap());
			if (messageMap.includes('400')){
				outputObj = {
				"output_msg":i18nObj.serviceunavailable2Predict,
				"output":"failure"
				};
			} else if (messageMap.includes('404')){
				outputObj = {
				"output_msg":i18nObj.failed2Predict,
				"output":"failure"
				};
			} else {
				outputObj = {
					"output_msg":i18nObj.unable2Predict,
					"output":"failure"
				};
		}} else {
			//filtering prediction o/p using threshold.
			var threshold = mlPredictor.__getPredictionThreshold(solution, outcomeArr[i]);
			var confidence = outcomeArr[i].confidence();
			if(ml_capability == 'regression_trainer' || ml_capability == 'workflow_regression_trainer'){

					outputObj = {
						"PointEstimate" : outcomeArr[i].predictedValue(),
						"LowerBound" : outcomeArr[i].lowerBound(),
						"UpperBound" : outcomeArr[i].upperBound(),
						"output": "success"
					};
				}
			else {
				if (confidence >= threshold){
					outputObj = {
						"ClassName" : outcomeArr[i].predictedValue(),
						"Confidence" : confidence,
						"Threshold" : threshold,
						"OutcomeDetails": outcomeArr[i].detailedOutcome(),
						"output": "success"
					};
				}
				if (type == 'batch') {
					outputObj['InputRecord'] = record;
				}
			}
			output.sysidArr.push(outcomeArr[i].predictedValue());
		}
		if ( Object.keys(outputObj).length !== 0){
			output.outputJSON.push(outputObj);
		}
		if ((ml_capability === 'classification_trainer' || 'workflow_classification_trainer')  && output.outputJSON.length >= originalTopN)
			break;
	}
	output.outputJSON.length != 0 || output.outputJSON.push({"output_msg":i18nObj.unable2PredictThreshold,
				"output":"failure"});
	return output;
}
