var GuidedDecisionComponentUtil = Class.create();
GuidedDecisionComponentUtil.prototype = {
    initialize: function() {
    },
	// sys_ux_screen_type Recommendation card base
	SCREEN_COLLECTION_BASE: '99db11a1b7e21110ca990f68ee11a985',
	getPreviewExperienceRefQual: function () {
		var macroponents = [];
		var grScreens = new GlideRecord('sys_ux_screen');
		grScreens.addEncodedQuery('screen_type=99db11a1b7e21110ca990f68ee11a985');
		grScreens.query();
		while(grScreens.next()) {
			macroponents.push(grScreens.getValue('macroponent'));
		}
		return 'sys_idIN' + macroponents.join(',');
	},
    type: 'GuidedDecisionComponentUtil'
};
