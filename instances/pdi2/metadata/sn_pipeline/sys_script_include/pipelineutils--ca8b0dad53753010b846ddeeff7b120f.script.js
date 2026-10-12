var PipelineUtils = Class.create();
PipelineUtils.prototype = {
    initialize: function() {},
	/**
	 * Determines if the current instance is a controller
	 * @returns {boolean}
	 */
    currentInstanceIsController: function() {
		var controllerData = this.getControllerData();

		if (!controllerData.controllerIsDefined || !controllerData.environment) { return true; }

		return controllerData.environment.getValue("instance_id").trim() === gs.getProperty("instance_id").trim();
	},
	/**
	 * Determines if the current instance is a controller
	 * @returns {Object}
	 */
    getControllerData: function() {
		var controllerEnv = this.getEnvironmentControllerRecord();

		if (!controllerEnv) {
			return {
				controllerIsDefined: false,
				environment: null,
			};
		}

		return {
			controllerIsDefined: true,
			environment: controllerEnv,
		};
	},
	/**
	 * Queries sn_pipeline_environment table for a controller record
	 * @returns {Object}
	 */
	getEnvironmentControllerRecord: function() {
		var pipelineEnvironmentGR = new GlideRecord(PipelineConstants.table.ENVIRONMENT_TABLE);
		pipelineEnvironmentGR.addQuery("is_controller", true);
		pipelineEnvironmentGR.query();
		
		if (pipelineEnvironmentGR.next()) {
			return pipelineEnvironmentGR;
		}
		
		return null;
	},
	/**
	 * Queries sn_pipeline_environment table and converts them to JSON
	 * @param {Array} [columns] array of strings for column names
	 * @returns {Array}
	 */
	getEnvironments: function(columns) {
		var pipelineEnvironmentGR = new GlideRecord(PipelineConstants.table.ENVIRONMENT_TABLE);
		pipelineEnvironmentGR.query();

		var environments = [];

		while (pipelineEnvironmentGR.next()) {
			var pipelineEvnironmentObj = this.getObjectFromGlideRecord(pipelineEnvironmentGR, columns);
			environments.push(pipelineEvnironmentObj);
		}

		return environments;
	},
	/**
	 * Queries sn_pipeline_environment for given instanceId
	 * @param {String} instanceId string
	 * @returns {Object}
	 */
	getEnvironmentByInstanceId: function(instanceId) {
		var pipelineEnvironmentGR = new GlideRecord(PipelineConstants.table.ENVIRONMENT_TABLE);
		pipelineEnvironmentGR.addQuery("instance_id", instanceId);
		pipelineEnvironmentGR.query();

		if (pipelineEnvironmentGR.next()) {
			return this.getObjectFromGlideRecord(pipelineEnvironmentGR, PipelineConstants.columns.ENVIRONMENT_COLUMNS);
		}

		return {};
	},
	/**
	 * Queries sn_pipeline_pipeline_type for given pipeline type name
	 * @param {String} name string
	 * @param {Array} [fields] optional array of fields to return
	 * @returns {Object}
	 */
	getPipelineTypeByName: function(name, fields) {
		var pipelineTypeGR = new GlideRecord(PipelineConstants.table.PIPELINE_TYPE);
		pipelineTypeGR.addQuery("name", name);
		pipelineTypeGR.query();

		if (pipelineTypeGR.next()) {
			var pipelineTypeObject = this.getObjectFromGlideRecord(pipelineTypeGR, fields || PipelineConstants.columns.PIPELINE_TYPE_COLUMNS);
			var roles = pipelineTypeObject[PipelineConstants.formFields.ROLES_REQUIRED_IN_SOURCE_ENVIRONMENT];
			var permissionSets = pipelineTypeObject[PipelineConstants.formFields.PERMISSION_SETS_REQUIRED_IN_SOURCE_ENVIRONMENT];
			
			if(roles) {
				var userRoleGR = new GlideRecord("sys_user_role");
				var roleNames = [];
				userRoleGR.addQuery("sys_id", "IN", roles);
				userRoleGR.query();

				while(userRoleGR.next()) {
					roleNames.push(userRoleGR.getValue("name"));
				}

				pipelineTypeObject[PipelineConstants.formFields.ROLES_REQUIRED_IN_SOURCE_ENVIRONMENT] = roleNames;
			}

			if (permissionSets) {
				pipelineTypeObject[PipelineConstants.formFields.PERMISSION_SETS_REQUIRED_IN_SOURCE_ENVIRONMENT] = permissionSets.split(",");
			}

			return pipelineTypeObject;
		}

		return {};
	},
	/**
	 * Creates JSON object from GlideRecord Object
	 * @param {GlideRecord} gr
	 * @param {Array} [fields] if fields is not passed in, function will return all fields
	 * @returns {Object}
	 */
    getObjectFromGlideRecord: function(gr, fields) {
		if (!gr) {
			return {};
		}

		var isNonEmptyArray = Array.isArray(fields) && fields.length > 0;
		var resultObj = {};

        if (isNonEmptyArray) {

			fields.forEach(function(field) {
				resultObj[field] = gr.getValue(field);
			});

		} else {

			for (var prop in gr) {
				if (gr[prop]) {
					resultObj[prop] = gr.getValue(prop);
				}
			}

		}

		return resultObj;
    },
	/**
	 * Queries sn_pipeline_pipeline table
	 * @param {string} sourceInstanceId
	 * @param {string} pipelineType
	 * @returns {GlideRecord}
	 */
	getPipelineforInstanceIdOfType: function(sourceInstanceId, pipelineTypeName) {
		if (!pipelineTypeName || !sourceInstanceId) {
			return null;
		}
		
		var pipelineGR = new GlideRecord(PipelineConstants.table.PIPELINE_TABLE);
		pipelineGR.addActiveQuery();
		pipelineGR.addQuery('pipeline_type.name', pipelineTypeName);
		pipelineGR.addQuery('source_environment.instance_id', sourceInstanceId);
		pipelineGR.query();

		if (pipelineGR.next()) {
			return pipelineGR;
		}
		
		return null;
	},
	/**
	 * Queries sn_pipeline_pipeline table for a valid pipeline for a given instance_id and pipeline type
	 * @param {string} sourceInstanceId
	 * @param {string} pipelineType
	 * @returns {boolean}
	 */
	isSourceInstanceInPipeline: function(sourceInstanceId, pipelineTypeName) {
		if (!pipelineTypeName || !sourceInstanceId) {
			return false;
		}
		
		var pipelineGR = new GlideRecord(PipelineConstants.table.PIPELINE_TABLE);
		pipelineGR.addActiveQuery();
		pipelineGR.addQuery('pipeline_type.name', pipelineTypeName);
		pipelineGR.addQuery('source_environment.instance_id', sourceInstanceId);
		pipelineGR.query();

		if (pipelineGR.next()) {
			var pipelineEnvironmentOrderGR = new GlideRecord(PipelineConstants.table.PIPELINE_ENVIRONMENT_ORDER_TABLE);
			
			pipelineEnvironmentOrderGR.get('pipeline', pipelineGR.getUniqueValue());
			
			return pipelineEnvironmentOrderGR.isValidRecord();
		}
		
		return false;
	},
	/**
	 * Triggers validate_controller action
	 * @param {String} url
	 * @param {GlideRecord} credential_alias
	 * @param {String} sourceInstanceId
	 * @param {String} pipelineTypeName
	 * @returns {Object}
	 */
	getValidateControllerResponse: function(url, credential_alias, sourceInstanceId, pipelineTypeName) {
		var inputs = {
			url: url,
			credential: credential_alias,
			source_instance_id: sourceInstanceId,
			pipeline_type_name: pipelineTypeName
		};
		
		return this.getPipelineActionResponse(PipelineConstants.flow.environmentValidation.actions.CONTROLLER, inputs);
	},
	/**
	 * Triggers validate_connection action
	 * @param {String} url
	 * @param {GlideRecord} credential_alias
	 * @returns {Object}
	 */
	getValidateConnectionResponse: function(url, credential_alias) {
		var inputs = {
			url: url,
			credential: credential_alias
		};
		
		return this.getPipelineActionResponse(PipelineConstants.flow.environmentValidation.actions.CONNECTION, inputs);
	},
	/**
	 * Triggers pipeline actions from a list of accepted actions
	 * @param {String} actionName
	 * @param {Object} inputs
	 * @returns {Object}
	 */
	getPipelineActionResponse: function(actionName, inputs) {
		var acceptedActionNames = [
			PipelineConstants.flow.environmentValidation.actions.CONTROLLER,
			PipelineConstants.flow.environmentValidation.actions.CONNECTION,
			PipelineConstants.flow.runner.actions.RUNNER_ACTION,
			PipelineConstants.flow.pipelineType.actions.GET_PIPELINE_TYPE_ACTION,
			PipelineConstants.flow.authorization.actions.GET_AUTHORIZED_REQUEST,
			PipelineConstants.flow.adminEmail.actions.GET_ADMIN_CONTACT
		];
		
		if (acceptedActionNames.indexOf(actionName) === -1) {
			throw 'Unsupported action name';
		}

		try {
			var actionResult = sn_fd.FlowAPI.getRunner()
				.action(actionName)
				.inForeground()
				.withInputs(inputs)
				.run();
		
			return actionResult.getOutputs();
		} catch (e) {
			return {
				error_code: 1,
				error_message: e.getMessage()
			};
		}
	},
	/**
	 * Removes trailing slash from URLs
	 * @param {string} url
	 * @returns {string}
	 */
	removeTrailingSlash: function(url) {
        var regexPattern = /\/+$/;

        return regexPattern.test(url) ? url.replace(regexPattern, '') : url;
    },

    type: 'PipelineUtils'
};
