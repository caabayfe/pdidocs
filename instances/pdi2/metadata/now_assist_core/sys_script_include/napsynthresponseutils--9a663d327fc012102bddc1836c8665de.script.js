var NapSynthResponseUtils = Class.create();
NapSynthResponseUtils.prototype = {
	SKILL_SEARCH_APP_SYS_ID: '80a4472477703110569156391e5a9965',
	CALL_BACK_MODE: {
		SINGLE: 'single',
		MULTIPLE: 'multiple'
	},
	SEARCH_RESULT_TYPE: {
		REGULAR: 'regular',
		GR: 'gr',
		ALL: 'all'
	},
	GENIUS_RESULT_CONFIG: {
		NOW_ASSIST_ACTIONS_GR_CONFIG_RECORD_SYS_ID: 'a17c66ef77b9f110be280d892c5a9986',
		NOW_ASSIST_MULTI_CONTENT_RESPONSE_GR_CONFIG_RECORD_SYS_ID: '088c73a5430302104eaff03a5ab8f22f'
	},
	MULTI_TURN_SKILL_CONFIG_ID: 'a3b8c4f87ff702102bddc1836c8665f0',

    initialize: function() {
    },

	/**
	 * Return true if Synthesized Response is enabled for Now Assist Panel. 
	 */
	isSynthesizedResponseEnabled: function() {
		var gr = new GlideRecord('sn_nowassist_skill_config_status');
		if (!gr.isValid())
			return false;

		gr.addQuery('skill_config', this.MULTI_TURN_SKILL_CONFIG_ID);
		gr.query();
		// if platform skill is not installed, return false.
		return gr.hasNext();
	},

	/**
	 * Return an object of search Configuration. Those configuration records
	 * are retrived based on the parameter indicating if synth response is enabled.
	 */
	getNAPSearchConfiguration: function() {
		return {
			searchAppConfigId: this.SKILL_SEARCH_APP_SYS_ID,
			callbackMode: this.CALL_BACK_MODE.SINGLE,
			searchResultType: this.SEARCH_RESULT_TYPE.GR,
			geniusResultConfigIdFilter: this.isSynthesizedResponseEnabled() ?
				[this.GENIUS_RESULT_CONFIG.NOW_ASSIST_MULTI_CONTENT_RESPONSE_GR_CONFIG_RECORD_SYS_ID] :
				[this.GENIUS_RESULT_CONFIG.NOW_ASSIST_ACTIONS_GR_CONFIG_RECORD_SYS_ID],
			isSynthesized: this.isSynthesizedResponseEnabled()
		};
	},

    type: 'NapSynthResponseUtils'
};
