var PDPanelOverrideService = Class.create();
PDPanelOverrideService.prototype = {
	initialize: function() {
		this.panelOverrideRepo = new PDPanelOverrideRepository();
	},
	type: 'PDPanelOverrideService',
	getPanelOverrides: function(processTypeId) {
		return this.panelOverrideRepo.getPanelOverrides(processTypeId);
	}
};
