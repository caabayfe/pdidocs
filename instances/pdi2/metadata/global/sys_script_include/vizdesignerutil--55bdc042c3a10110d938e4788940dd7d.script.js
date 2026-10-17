var VizDesignerUtil = Class.create();
VizDesignerUtil.prototype = {
    initialize: function() {
    },
	
	_removeVizFromUserPreference: function(gr, vizId) {
		var preference = gr.getValue('value');
		if (!preference)
			return;
	
		var favorites = JSON.parse(preference);
		if (!Array.isArray(favorites))
			return;

		var idx = favorites.indexOf(vizId);
		if (idx < 0)
			return;
	
		favorites.splice(idx, 1);
		gr.setValue('value', JSON.stringify(favorites));
		gr.update();
	},
	
	_getTitlePropertyName: function(macroponentId) {
		// List
		if (macroponentId == '2b1c080881e05dc63b917044290b233f')
			return 'listTitle';
			
		// Scorecard	
		if (macroponentId == '9d31ba4d773ce32ef350d4555b673f6e')
			return 'heading';
			
		// Calendar
		if (macroponentId == '259e0221ff18a75c5f5f0fb28fa5d32f')
			return 'componentTitle';
	},
	
	removeVizFromUserPreferences: function(vizId) {
		var gr = new GlideRecord('sys_user_preference');
		gr.addQuery('name', 'viz-designer-favorites');
		gr.query();
		
		while (gr.next())
			this._removeVizFromUserPreference(gr, vizId);
	},
	
	getTitleFromProperties: function(macroponentId, stringifiedProperties) {
		var properties = JSON.parse(stringifiedProperties);
		var titlePropertyName = this._getTitlePropertyName(macroponentId);
		
		if (titlePropertyName)
			return properties[titlePropertyName];
	},
	
	getNameFromProperties: function(macroponentId, stringifiedProperties) {
		var title = this.getTitleFromProperties(macroponentId, stringifiedProperties);
		if (title)
			return title;
		
		return 'Untitled';
	},
	
	ownViz: function(vizId) {
		return new global.VizACLUtil().ownViz(vizId);
	},
	
	canShareViz: function(vizId) {
		return new global.VizACLUtil().canShareViz(vizId);
	},
	
	isVizSharedWithMeOrIamOwner: function(vizId) {		
		return new global.VizACLUtil().isVizSharedWithMeOrIamOwner(vizId);
	},
	
	isVizSharedWithMeWithEditModeOrIamOwner: function(vizId) {		
		return new global.VizACLUtil().isVizSharedWithMeWithEditModeOrIamOwner(vizId);
	},

    type: 'VizDesignerUtil'
};
