var PIWBPredictionProcessor_default = Class.create();
PIWBPredictionProcessor_default.prototype = {
    tableName: '',

    initialize: function() {
    },

    getTableName: function() {
        return this.tableName;
    },

    process: function(recordGr) {
		// set table name for the following logic
		this.tableName = recordGr.getTableName();

		try {
			var info = '';
			var piwbUtil = new global.PIWBUtil();
			var usecases = piwbUtil.getCompleteUsecasesOnTable(this.getTableName());

			usecases.forEach(function(usecase) {
				var integratedModel = usecase.integrated_model;
				if (!integratedModel)
					return;

				try {
					var predictor = new MLPredictor();
					var solutionName = integratedModel.ml_model_solution_name;
					var solution = predictor.findActiveSolution(solutionName);
					if (!solution)
						return;
		
					/* The next line of code is doing the prediction and updating current record. */
					/* If no prediction is done, we don't build prediction info message. */
					if (!predictor.applyPredictionForSolution(recordGr, solution))
						return;
		
					/* Building prediction info message */
					var fieldName = solution.getPredictedField();
					var fieldLabel = recordGr.getElement(fieldName).getLabel();
					var predictedDisplayValue = recordGr.getDisplayValue(fieldName);
					var msg = gs.getMessage("Predicted {0} for {1}.", [predictedDisplayValue, fieldLabel]);
					if (info.length > 0)
						info += " ";
					info += msg;
				} catch (e1) {
					gs.error('PIWBPredictionProcessor_incident.process: Error occurs in the prediction of model ' + integratedModel.sys_id + '. Error message: ' + e1.message);
					return;
				}
			});
			/* Print out prediction info message on screen. */
			if (info.length > 0) {
				var recordUrl = "<a href='"+recordGr.getLink()+"'>"+recordGr.getDisplayValue()+":</a>";
				gs.addInfoMessage(recordUrl + " " + info);
			}
		} catch(e2) {
			gs.error('PIWBPredictionProcessor_default.process: ' + e2.message);
			return true;
		}
		return true;
	},

    type: 'PIWBPredictionProcessor_default'
};
