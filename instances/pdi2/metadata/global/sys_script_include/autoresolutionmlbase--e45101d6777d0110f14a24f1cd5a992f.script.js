var AutoResolutionMLBase = Class.create();
AutoResolutionMLBase.prototype = {

    arConfigSysId: '',

    initialize: function() {
    },

    setConfigSysId: function(arConfigSysId) {
        this.arConfigSysId = arConfigSysId;
    },

    getConfigSysId: function() {
        return this.arConfigSysId;
    },

    _getSolutionName: function(gr) {
        return gr.getValue('ml_solution_name') || '';
    },
	
	/**
	 * Gets the active version number of a solution given a solution name.
	 * @param {SolutionStore} solutionStore	The solution store (e.g. AgentZeroSolutionStore and LanguageXSolutionStore) that the solution 	 
	 * 										name is available from.
	 * @param {string} solutionName			Name of the solution.
	 * @returns {number|string} Version number of the solution or empty string
	 */
	getActiveSolutionVersionNumberForSolutionName: function(solutionStore, solutionName) {
		try {
			var activeSolutionVersion = this._getActiveVersionForSolutionName(solutionStore, solutionName);
			return activeSolutionVersion.getVersionNumber();
		} catch(error) {
			this.LOGGER.debug('Error getting active solution for solution={0}: {1}. The solution still might be training.', solutionName, error);
		}
		return '';
	},

	/**
	 *
	 * @param {SolutionStore} solutionStore	The solution store (e.g. CompositeSolutionStore and LanguageXSolutionStore) that the solution
	 * 										name is available from.
	 * @param solutionName Name of the solution
	 * @param taskGr - the GlideRecord of the task
	 * @param predictionInputFields - fields from taskGr with its value that needs to be sent to LangX for prediction
	 * @returns {{message: string, status: string, payload: object}}
	 */
	predictBase: function(solutionStore, solutionName, taskGr, predictionInputFields, options) {
		// result in json format
		var predictionResultJSON;

		var response = {};

		// input to the language x
		var taskInputsForPrediction = {};
		taskInputsForPrediction["id"] = taskGr.getUniqueValue();
		taskInputsForPrediction["tableName"] = taskGr.getTableName();
		taskInputsForPrediction["fields"] = predictionInputFields;

		var errMsg = '';
		if (gs.nil(solutionName)) {
			errMsg = "Solution name is invalid or empty";
			predictionResultJSON
				= this._createInternalErrorPredictionResult(
				errMsg, taskInputsForPrediction["id"],
				taskInputsForPrediction["tableName"],
				taskInputsForPrediction["fields"]);

			response.status = AutoResolutionConstants.STATUS_ERROR;
			response.message = errMsg;
			response.payload = predictionResultJSON;

			return response;
		}

		var useCaseId = AutoResolutionUtil.getMLUseCaseId(taskGr.getTableName());
		if (!gs.nil(useCaseId))
			options.mluc = useCaseId;

		// start time stamp
		var startTs = new GlideDateTime().getNumericValue();

		try {
			var resultStr = this._executeLanguageX(solutionStore, taskInputsForPrediction, solutionName, options);

			// if empty or null is null, throw an exception.
			if (gs.nil(resultStr))
				throw 'LanguageX prediction results are invalid or empty';

			predictionResultJSON = JSON.parse(resultStr);

		} catch (ex) {
			this.LOGGER.warn("Unexpected exception occurred during LanguageX prediction={0}", ex);
			errMsg = "Unexpected exception occurred during LanguageX prediction";

			// create a result object with the error.
			predictionResultJSON
				= this._createInternalErrorPredictionResult(
				errMsg, taskInputsForPrediction["id"],
				taskInputsForPrediction["tableName"],
				taskInputsForPrediction["fields"]);
		}

		// the time taken for language-X execution.
		var execTime = new GlideDateTime().getNumericValue() - startTs;

		response
			= global.AutoResolutionPredictionHelper.processPredictionResults(
			this.LOGGER, this.contextSysId, solutionName, predictionResultJSON, execTime);

		response.payload = predictionResultJSON;
		return response;
	},

	/**
	 * Execute LanguageX/Composite solution
	 */
	_executeLanguageX:function(solutionStore, taskInputsForPrediction, solutionName, options) {
		var languageXInputs = [];
		languageXInputs.push(taskInputsForPrediction);
		var languageXSolution = solutionStore.get(solutionName);
		var optionsInput = {};
		optionsInput = JSON.parse(sn_ml.AgentZeroSolutionStore.getCompositeOptions(solutionName, options));
		var languageXResults = languageXSolution.getActiveVersion().predict(languageXInputs, optionsInput);
		return languageXResults;
	},

	_createInternalErrorPredictionResult: function(errMsg, sysId, tableName, fields) {
		var rtnObj = {
			schemaVersion: "",
			status: {
				code: global.AutoResolutionLanguageX.ERROR_CODE,
				message: errMsg
			},
			result: [
				{
					input: {
						id: sysId,
						tableName: tableName,
						fields: {}
					},
					output: []
				}
			]
		};
		// add fields
		rtnObj.result[0].input.fields = fields;
		return rtnObj;
	},
	
	/**
	 * Gets the version of a solution given a language code.
	 * @param {string} languageCode   The two letter language code (e.g. en, de, ...)
	 * @returns {Version} Java object present in the package com.glide.platform_ml.api.solution.solutionversion if exists, empty string otherwise
	 * @private
	 */
	_getActiveVersionForLanguage: function(solutionStore, languageCode) {
		try {
			var solutionName = AutoResolutionLanguageHelper.getSolutionNameForLanguage(languageCode, this.getConfigSysId(), this.getCapability());
			return this._getActiveVersionForSolutionName(solutionStore, solutionName);
		} catch(error) {
			this.LOGGER.debug('Error getting active solution for solution={0}: {1}. The solution still might be training.', solutionName, error);
		}
		return '';
	},
	
	/**
	 * Gets the version of a solution given a solution name.
	 * @param {SolutionStore} solutionStore	The solution store (e.g. AgentZeroSolutionStore and LanguageXSolutionStore) that the solution 	 
	 * 										name is available from.
	 * @param {string} solutionName			Name of the solution.
	 * @returns {Version} Version of the solution (e.g. AgentZeroVersion and LanguageXVersion) or an empty string
	 * @private
	 */
	_getActiveVersionForSolutionName: function(solutionStore, solutionName) {
		try {
			var autoResolutionPISolution = solutionStore.get(solutionName);
			var autoResolutionVersion = autoResolutionPISolution.getActiveVersion();
			return autoResolutionVersion;
		} catch (error) {
			throw gs.getMessage('Error getting the solution version: {0}', error);
		}
	},
	
    type: 'AutoResolutionMLBase'
};
