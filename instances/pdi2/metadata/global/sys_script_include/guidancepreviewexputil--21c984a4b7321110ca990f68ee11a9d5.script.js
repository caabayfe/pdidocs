var GuidancePreviewExpUtil = Class.create();
GuidancePreviewExpUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'GuidancePreviewExpUtil',
	
	RECOMMENDED_ACTION_APP_ROUTE: '16fd1125b7e21110ca990f68ee11a94b',
	RECOMMENDED_ACTION_PAGE_REGISTRY: '76723724b7321110ca990f68ee11a9a2',
	GUIDANCE_PAGE_REGISTRY: '2dbefb7753422110f67eddeeff7b12d3',
	GUIDANCE_APP_ROUTE: '6d1a26b210729110f877cb8bae2edf78',
	RECOMMENDED_ACTION_DEFAULT_APP_CONFIG: 'ae723724b7321110ca990f68ee11a99e',
	GUIDANCE_DEFAULT_APP_CONFIG: 'ec693f7353422110f67eddeeff7b121a',
	RECOMMENDED_ACTION_SCREEN_COLLECTION: '99db11a1b7e21110ca990f68ee11a985',
	GUIDANCE_SCREEN_COLLECTION : 'ad1a22b210729110f877cb8bae2edf57',
	GUIDED_DECISIONS_GUIDANCE_MANAGER: 'sn_gd_guidance.guidance_manager',
	SYS_ADMIN: 'admin',
	getPreviewUIBUrl: function () {
		var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
		var guidance = this.getParameter('sysparm_guidance');
		var guidanceGr = guidanceModel.getGuidanceComponentById(guidance);
		var output = this.newItem("output");
		if (!guidanceGr) {
			output.setAttribute("message", gs.getMessage('Error fetching Guidance component record'));
			output.setAttribute("success", false);
			return false;
		}
		if(!gs.hasRole(this.GUIDED_DECISIONS_GUIDANCE_MANAGER)){
			output.setAttribute("message", gs.getMessage('Error fetching Guidance component record'));
			output.setAttribute("success", false);
			return false;
		}

		var macroponentGr = new GlideRecord('sys_ux_macroponent');
		macroponentGr.get(guidanceGr.getValue('preview_macroponent'));
		if (!macroponentGr.isValidRecord()) {
			output.setAttribute("message", gs.getMessage('Preview macroponent is missing'));
			output.setAttribute("success", false);
			return false;
		}
		var macroponentId = macroponentGr.getUniqueValue();
		var screenGr = new GlideRecord('sys_ux_screen');
		screenGr.addQuery('macroponent', macroponentId);
		screenGr.addQuery('app_config', this.RECOMMENDED_ACTION_DEFAULT_APP_CONFIG);
		screenGr.setLimit(1);
		screenGr.query();
		if (!screenGr.next()) {
			output.setAttribute("message", gs.getMessage('Variant for preview experience is missing'));
			output.setAttribute("success", false);
			return false;
		}
		var screenId = screenGr.getUniqueValue();
		output.setAttribute("url", this.RECOMMENDED_ACTION_PAGE_REGISTRY + '/' + this.RECOMMENDED_ACTION_APP_ROUTE + '/' + screenId);
		output.setAttribute("success", true);
		return true;
	},
	createPreviewExpForWorkspace: function (current) {
		if(!gs.hasRole(this.GUIDED_DECISIONS_GUIDANCE_MANAGER))
			return false;
		var RECOMMENDED_ACTION_DEFAULT_PAGE = "00efecadb7221110ca990f68ee11a944";
		var RECOMMENDED_ACTION_DEFAULT_VARIANT = "55fb51a1b7e21110ca990f68ee11a94f";
		var BASE_SCRIPTS = ['1cef20edb7221110ca990f68ee11a992', '48ef20edb7221110ca990f68ee11a982', 'd4ef20edb7221110ca990f68ee11a987', '58ef20edb7221110ca990f68ee11a98c'];
		var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
		var newMacroponentId = this.createMacroponent(current, RECOMMENDED_ACTION_DEFAULT_PAGE);
		
		var screen = this.createVariant(current,RECOMMENDED_ACTION_DEFAULT_VARIANT, newMacroponentId, this.RECOMMENDED_ACTION_SCREEN_COLLECTION, this.RECOMMENDED_ACTION_DEFAULT_APP_CONFIG);
		guidanceModel.createPreviewExperience(current, newMacroponentId, screen);
		gs.addInfoMessage(gs.getMessage('Properties for the preview UI were created. Select Edit Preview in UI Builder next to configure the UI.'));
		gs.setRedirect(current);

		BASE_SCRIPTS.forEach(function (uxScriptId) {
			var uxScriptBase = new GlideRecord('sys_ux_client_script');
			uxScriptBase.get(uxScriptId);
			uxScriptBase.setValue('macroponent', newMacroponentId);
			uxScriptBase.setValue('sys_policy', null);
			uxScriptBase.insert();
		}, this);

		return true;
	},
	createDetailExperience: function(current){
		if(!gs.hasRole(this.GUIDED_DECISIONS_GUIDANCE_MANAGER))
			return false;
		var GUIDANCE_DEFAULT_PAGE = "611a22b210729110f877cb8bae2edf5a";
		var GUIDANCE_VARIANT = "a11a22b210729110f877cb8bae2edf5c";
		var newMacroponentId = this.createMacroponent(current, GUIDANCE_DEFAULT_PAGE);
		var screen = this.createVariant(current,GUIDANCE_VARIANT, newMacroponentId, this.GUIDANCE_SCREEN_COLLECTION, this.GUIDANCE_DEFAULT_APP_CONFIG);
		var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
		guidanceModel.createDetailExperience(current, newMacroponentId, screen);
		gs.addInfoMessage(gs.getMessage('Properties for the detail UI were created. Select Edit Detail in UI Builder next to configure the UI.'));
		gs.setRedirect(current);
		return true;
	},
	getDetailExpURL: function(){
		var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
		var guidance = this.getParameter('sysparm_guidance');
		var guidanceGr = guidanceModel.getGuidanceComponentById(guidance);
		var output = this.newItem("output");
		if (!guidanceGr) {
			output.setAttribute("message", gs.getMessage('Error fetching Guidance component record'));
			output.setAttribute("success", false);
			return false;
		}

		if(!gs.hasRole(this.GUIDED_DECISIONS_GUIDANCE_MANAGER)){
			output.setAttribute("message", gs.getMessage('Error fetching Guidance component record'));
			output.setAttribute("success", false);
			return false;
		}
			
		var macroponentGr = new GlideRecord('sys_ux_macroponent');
		macroponentGr.get(guidanceGr.getValue('experience_macroponent'));
		if (!macroponentGr.isValidRecord()) {
			output.setAttribute("message", gs.getMessage('Experience macroponent is missing'));
			output.setAttribute("success", false);
			return false;
		}
		var screenId = guidanceGr.getValue('experience_screen');
		output.setAttribute("url", this.GUIDANCE_PAGE_REGISTRY + '/' + this.GUIDANCE_APP_ROUTE + '/' + screenId);
		output.setAttribute("success", true);
		return true;
	},

	createMacroponent: function(current, defaultPageId){
		var newGuidanceUIMacroponent = new GlideRecord("sys_ux_macroponent");
		newGuidanceUIMacroponent.get(defaultPageId);
		newGuidanceUIMacroponent.setValue('name', current.name);
		newGuidanceUIMacroponent.setValue('sys_policy', null);
		var newMacroponentId = newGuidanceUIMacroponent.insert();
		return newMacroponentId;
	},

	createVariant: function(current, defaultVaiant, newMacroponentId, screenCollection, appConfig){
		var newGuidanceUIVariant = new GlideRecord("sys_ux_screen");
		newGuidanceUIVariant.get(defaultVaiant);
		newGuidanceUIVariant.setValue('macroponent', newMacroponentId);
		newGuidanceUIVariant.setValue('active', true);
		newGuidanceUIVariant.setValue('name', current.getValue('name'));
		newGuidanceUIVariant.setValue('app_config', appConfig);
		newGuidanceUIVariant.setValue('screen_type', screenCollection);
		newGuidanceUIVariant.setValue('sys_id', gs.generateGUID());

		newGuidanceUIVariant.setValue('sys_policy', null);
		var screen = newGuidanceUIVariant.insert();
		return screen;
	},	

	getCustomExperienceDetails: function() {
		var customExpObj = {
			"preview": false,
			"detail": false
		};
		if(!gs.hasRole(this.GUIDED_DECISIONS_GUIDANCE_MANAGER))
			return customExpObj;
			
		var guidanceSysId = this.getParameter('sysparm_guidanceSysId');
		var guidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
		var guidance = guidanceModel.getGuidanceComponentById(guidanceSysId);
		if (guidance.getValue('preview_macroponent') != null)
			customExpObj.preview = true;
		if (guidance.getValue('experience_macroponent') != null)
			customExpObj.detail = true;

		return JSON.stringify(customExpObj);
	}
});
