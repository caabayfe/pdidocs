var VAGeniusQACardCreator = Class.create();
VAGeniusQACardCreator.prototype = Object.extendsObject(global.VAGeniusCardCreator, {

	initialize: function(searchMetadata, geniusResults, vaSystem, vaInputs, vaVars, index) {
		VAGeniusCardCreator.prototype.initialize.call(
			this, searchMetadata, geniusResults, vaSystem, vaInputs, vaVars,'QACard', index);
	},

	preProcess: function() {
		var table = this.getModel()["columns.table"];
		var sys_id = this.getModel()["columns.sys_id"];

		if(!gs.nil(table) && !gs.nil(sys_id))
			this.CARD_DATA["linkHref"] = this.getMetricsURL(this.VA_SYSTEM.applyLinkTemplate(sys_id, table));
	},

	type: 'VAGeniusQACardCreator'
});
