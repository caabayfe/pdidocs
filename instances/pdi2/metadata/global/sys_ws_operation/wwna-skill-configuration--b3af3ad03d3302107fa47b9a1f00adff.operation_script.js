(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	const WWNA_SKILL_CONFIG_TYPE = '8c9697d7a38a421075d1d78446fcda50';

	var skillId = request.queryParams['skill_id'][0];
	var recordTableName = request.queryParams['record_table_name'][0];
	var recordId = request.queryParams['record_sys_id'][0];
	var wwnaComponentId = null;
	if(request.queryParams['wwna_component_id']) {
		wwnaComponentId = request.queryParams['wwna_component_id'][0];
	}

	const skillConfig = new sn_wwna.WWNAUtils().fetchNACMSkillConfiguration(skillId, recordTableName, recordId);
	if(skillConfig === undefined){
		return new sn_ws_err.NotFoundError('No Skill found');
	}

	var skillConfigId = skillConfig.sys_id;
	var nowAssistSkillConfig = new sn_nowassist_admin.NowAssistSkillConfig();
	var isMobileEnabled = nowAssistSkillConfig.isSkillConfigurationEnabledInMobile(skillConfigId);

	const wwnaResponse = {
		WwnaMobileEnabled: isMobileEnabled,
		SkillName: skillConfig.skill_name,
		SkillDescription: skillConfig.skill_description,
		SkillConfigId: skillConfigId,
		RefineActions: []
	};

	if (!wwnaResponse.WwnaMobileEnabled)
		return wwnaResponse;

	const varsetFilter = function(varset) {
		if(varset.config_type !== WWNA_SKILL_CONFIG_TYPE) {
			return false;
		}

		var componentId = varset.props.wwna_component_id;
		return !wwnaComponentId || componentId === wwnaComponentId;
	};

	var varsets = skillConfig.variable_sets.filter(varsetFilter);
	if(varsets.length > 0) {
		varsets[0].props.refine_actions.forEach((action) => {
			const refineAction = {
				CommandName: action.commandName,
				Id: action.sysId,
				Name: action.name,
				ActionType: action.actionType,
				TableName: action.tableName
			};

			if(action.actionGroup) {
				refineAction.Group = action.actionGroup;
			}

			wwnaResponse.RefineActions.push(refineAction);
		});
	}

	return wwnaResponse;
})(request, response);
