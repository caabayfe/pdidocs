var PIWBMigrator = Class.create();
PIWBMigrator.prototype = {
    initialize: function() {
		this.ELIGIBLE_OUTPUT_FIELDS = ['assignment_group', 'category', 'cmdb_ci', 'business_service'];
		this.ELIGIBLE_USECASE_TEMPLATES = {};
		this.ELIGIBLE_USECASE_TEMPLATES['assignment_group'] = 'da7b9908870300105958bba826cb0bac';
		this.ELIGIBLE_USECASE_TEMPLATES['category'] = '52007d84870300105958bba826cb0bb4';
		this.ELIGIBLE_USECASE_TEMPLATES['cmdb_ci'] = 'b1ae01ad7700101092422160791061ba'; // installed via app-pimc-itsm-content
		this.ELIGIBLE_USECASE_TEMPLATES['business_service'] = '47de81ad770010109242216079106167'; // installed via app-pimc-itsm-content
		this.ELIGIBLE_TABLES = ['incident'];
		this.template_info = {};
		var ucm = new PIWBUsecaseManager();
		Object.keys(this.ELIGIBLE_USECASE_TEMPLATES).forEach(function(key) {
			var sys_id = this.ELIGIBLE_USECASE_TEMPLATES[key];
			this.template_info[sys_id] = ucm.getUsecaseTemplateInfo(sys_id);
		}.bind(this));
    },

	/**
		Migration eligible criteria
		   1. User should have piwb_manager role
		   2. Solution capability should be Classification
		   3. Solution definition should be active
		   4. Solution definition should have an active solution
		   5. Output fields should be part predefined eligible fields list.
		   6. The solution is not a migrated solution. (not present in PI workbench).
		   7. Solution should be created through UI.
		   8. Solution definition is for an eligible table
	*/

	isEligibleForMigration: function(solutionDef) {
		// non db query checks
		var isManager = gs.hasRole('piwb_manager');
		var isClassification = solutionDef.sys_class_name == 'ml_capability_definition_classification';
		var isSolutionDefActive = solutionDef.active + '' == 'true';
		var isEligibleTable = this.ELIGIBLE_TABLES.indexOf(solutionDef.table + '') > -1;
		var hasEligibleOutputField = this.ELIGIBLE_OUTPUT_FIELDS.indexOf(solutionDef.output_field + '') > -1;
		var isCreatedByAPI = solutionDef.request_source == 'api';
		if (!(isManager && isClassification && isSolutionDefActive && isEligibleTable && hasEligibleOutputField && !isCreatedByAPI))
			return false;

		// db query check 1 -- has active solution
		var activeSolution = new PiwbMLHelper().getActiveModel(solutionDef.sys_id + '');

		if (gs.nil(activeSolution))
			return false;

		// db query check 2 -- is solution already migrated
		var models = new PIWBUsecaseModelUtil().getModels([solutionDef.solution_name]);

		return Object.keys(models).length == 0;
	},

	getEligibleSolutions: function() {
		// Step 1: Get all solutions
		var mlHelper = new PiwbMLHelper();
		var solutionNames = [];
		var solutions = [];
		var gr = new GlideRecord('ml_capability_definition_classification');
		gr.addQuery('output_field', 'IN', this.ELIGIBLE_OUTPUT_FIELDS);
		gr.addQuery('table', 'IN', this.ELIGIBLE_TABLES);
		gr.addActiveQuery();
		var grSolution = gr.addJoinQuery('ml_solution', 'solution_name', 'solution_name');
		grSolution.addCondition('active', 'true');
		gr.query();
		while (gr.next()) {
			if (gr.request_source != 'api') {
				solutionNames.push(gr.getValue('solution_name'));
				var template_id = this.ELIGIBLE_USECASE_TEMPLATES[gr.getValue('output_field')];
				var activeVersion = new PIWBMLAPIAdapter().getSolutionActiveVersion(gr.getValue('solution_name'));
				var isDeployed = mlHelper.isDeployed(gr.solution_name + '');
				solutions.push({id: gr.getUniqueValue(),
								name: gr.getValue('solution_name'),
								label: gr.getValue('solution_label'),
								output_field: gr.getValue('output_field'),
								active_version: activeVersion,
								input_fields: gr.getValue('fields'),
								filter_condition: gr.getValue('filter'),
								target_template: this.template_info[template_id],
								is_deployed: isDeployed});
			}
		}

		// Step 2: Filter out solutions already present in PI workbench
		var models = new PIWBUsecaseModelUtil().getModels(solutionNames);
		var migratedSolutions = Object.keys(models);
		return solutions.filter(function(solution) {
			return migratedSolutions.indexOf(solution.name) == -1;
		});
	},

	migrateSolution: function(solution) {
		var ucManager = new PIWBUsecaseManager();
		var mlHelper = new PiwbMLHelper();
		var ucmUtil = new PIWBUsecaseModelUtil();

		// 1. Identify usecase template
		var usecaseTemplate = this.ELIGIBLE_USECASE_TEMPLATES[solution.output_field];
		if (gs.nil(usecaseTemplate)) {
			gs.error('PIWBMigrator.migrateSolution: Unable to map use case template, output_field: ' + solution.output_field);
			return false;
		}

		// 2. Get Template details
		var gr = new GlideRecord('piwb_usecase_template');
		if (!gr.get(usecaseTemplate)) {
			gs.error('PIWBMigrator.migrateSolution: Invalid use case template, template_id:  ' + usecaseTemplate);
			return false;
		}

		// 3. Create a usecase
		var solutionDetails = new JSON().decode(mlHelper.getSolutionDefinitionDetails(solution.id));
		var activeSolution = mlHelper.getActiveModel(solution.id);
		solutionDetails.isDeployed = solution.integrated;
		var usecase = this.buildUsecaseObect(solutionDetails, gr);
		var usecase_id = ucManager.createUsecase(usecase);
		if (gs.nil(usecase_id)) {
			gs.error('PIWBMigrator.migrateSolution: Unable to create a migrated use case, solution_id: '+ solution.id);
			return false;
		}

		// 4. Create a model
		var model = this.buildModelObject(solutionDetails, usecase_id);
		var model_id = ucmUtil.saveModel(model);
		if (gs.nil(model_id)) {
			ucManager.deleteUsecase(usecase_id);
			gs.error('PIWBMigrator.migrateSolution: Unable to create a migrated model, solution_id: '+ solution.id);
			return false;
		}

		// 5. update sa plans.
		var success = this.updateSAPlans(usecase_id);
		if (!success) {
			ucManager.deleteUsecase(usecase_id);
			gs.error('PIWBMigrator.migrateSolution, Unable to update usecase states, usecase_id:' + usecase_id);
			return false;
		}
		if(solutionDetails.isDeployed) {
			stage_id = this.closeSAStage(usecase_id, PIWBConstants.CLASSIFICATION_PLAN.STAGE_INTEGRATE_MODEL.ID);
			if (gs.nil(stage_id)) {
				gs.error('PIWBMigrator.updateSAPlans, Unable to complete Integrate Model stage, usecase_id, ' + usecase_id);
				return false;
			}
		}
		return usecase_id;
	},

	updateSAPlans: function(usecase_id) {
		var stage_id = this.closeSAStage(usecase_id, PIWBConstants.CLASSIFICATION_PLAN.STAGE_CREATE_MODEL.ID);
		if (gs.nil(stage_id)) {
			gs.error('PIWBMigrator.updateSAPlans, Unable to complete Create Model stage, usecase_id, ' + usecase_id);
			return false;
		}

		stage_id = this.closeSAStage(usecase_id, PIWBConstants.CLASSIFICATION_PLAN.STAGE_TEST_MODEL.ID);
		if (gs.nil(stage_id)) {
			gs.error('PIWBMigrator.updateSAPlans, Unable to complete Test Model stage, usecase_id, ' + usecase_id);
			return false;
		}

		return true;
	},

	closeSAStage: function(usecase_id, stage_id) {
		var saProcessor = new PIWBSetupAssitantProcessor();
		var data = {};
		data.usecase_id = usecase_id;
		data.stage_id = stage_id;
		data.status = 'complete';
		stage_id = saProcessor.updateSAStageStatus(data);
		return stage_id;
	},

	buildUsecaseObect: function(solutionDetails, gr) {
		var usecase = {};
		usecase.name = gs.getMessage('{0} (Migrated Use case)', solutionDetails.solution_label);
		usecase.description = gs.getMessage('{0} (Migrated Use case)', gr.name);
		usecase.template = gr.getUniqueValue();
		usecase.type = 'migrated';
		usecase.status = solutionDetails.isDeployed ? 'complete' : 'in_progress';
		return usecase;
	},

	buildModelObject: function(solutionDetails, usecase_id) {
		var model = {};
		model.name = gs.getMessage('{0} (Migrated Model)', solutionDetails.solution_label);
		model.description = gs.getMessage('{0} (Migrated Model)', solutionDetails.solution_label);
		model.usecase_id = usecase_id;
		model.solution_unique_name = solutionDetails.solution_name;
		model.status = solutionDetails.isDeployed ? 'integrated' : 'training_complete';
		var ml_model_config = {};
		ml_model_config.dataset_language = solutionDetails.dataset_language;
		ml_model_config.filterCondition = solutionDetails.filterCondition;
		ml_model_config.inputFields = solutionDetails.inputFields;
		ml_model_config.outputField = solutionDetails.outputField;
		ml_model_config.table = solutionDetails.table;
		ml_model_config.tableMetadata = solutionDetails.tableMetadata;
		model.ml_model_config = ml_model_config;
		return model;
	},

    type: 'PIWBMigrator'
};
