var AISearchGlideSignalsGeniusResultEvent = Class.create();

AISearchGlideSignalsGeniusResultEvent.prototype = Object.extendsObject(global.AISearchGlideSignalsEvent, {
		
	intents:[],
	CATALOG_SOURCE_TABLE:'sc_cat_item',
	USER_SOURCE_TABLE:'sys_user',
	USER_INTENT:'personFind',
	CATALOG_INTENT:'catalogFind',

	initialize: function(searchResultMetadata, paramBag) {
		
		global.AISearchGlideSignalsEvent.prototype.initialize.call(this, searchResultMetadata, paramBag);
		
		var intents = searchResultMetadata[global.AISearchConstants.MATCHED_GENIUS_RESULT_INTENTS];
		this.intents = gs.nil(intents) ? [] : intents.split(',');
	},
	
	buildPayload: function(data) {
		
		if (gs.nil(data))
			return;
		
		var propValues = data.propValues;
		var model = data.propValues.model;
		var action =  data.propValues.actions.length > 0 ? data.propValues.actions[0] : {};
		
		if (gs.nil(model))
			return;
		
		var resultSysId = this.getResultSysId(model);
		
		this.setValue(global.AISearchConstants.RESULT_SYS_ID, resultSysId);
		this.setValue(global.AISearchConstants.LABEL_DESCRIPTION, this._getLabelDescription(model));	
		
		var srcTable = this.getSourceTable(model);
		
		this.setValue(global.AISearchConstants.SOURCE_TABLE, srcTable);
		this.setValue(global.AISearchConstants.CARD_TYPE,  this._getCardType(model));
		this.setValue(global.AISearchConstants.AIS_DOC_ID, this.getAISDocId(srcTable, resultSysId));		
		this.setValue(global.AISearchConstants.CARD_TYPE, this._getCardType(model));
		this.setValue(global.AISearchConstants.MATCHED_INTENTS_PER_SOURCE, this._getMatchedIntentPerSource(srcTable));
		this.setValue(global.AISearchConstants.AIS_GENIUS_CONFIG_ID, this._getAISGeniusConfigId(model));
	
		if (!gs.nil(action)){
			this.setValue(global.AISearchConstants.ACTION_TYPE, this._getActionType(action));
			this.setValue(global.AISearchConstants.ACTION_ID, this._getActionId(action));
			this.setValue(global.AISearchConstants.ACTION_VALUE, this._getActionValue(action));
		}
	
	},
	
	_getMatchedIntentPerSource: function(srcTable) {
		
		for(var i=0; i<this.intents.length; i++) {
			var intent = this.intents[i];
			
			if (srcTable == this.CATALOG_SOURCE_TABLE && intent.toLowerCase().indexOf('catalog') > -1)
				return this.CATALOG_INTENT;
			else if (srcTable == this.USER_SOURCE_TABLE && intent.toLowerCase().indexOf('person') > -1)
				return this.USER_INTENT;
			
			return '';
		}
	},
	
	_getActionType: function(action) {
		return (!gs.nil(action) && !gs.nil(action.actionType))? action.actionType : '';
	},
	
	_getActionId: function(action) {
		return (!gs.nil(action) && !gs.nil(action.actionType) && !gs.nil(action.assignmentId)) ?  action.assignmentId: '';
	}, 
	
	_getActionValue: function(action) {
		return (!gs.nil(action) && !gs.nil(action.actionType) && !gs.nil(action.label)) ?  action.label: '';
	},
	
	_getLabelDescription: function(model) {
		var desc = model['columns.ai_search_teaser_title'] || model['columns.name'] || model['columns.label'];
		return global.AISearchHelper.stripHighlightTags(desc);
	},

	_getAISGeniusConfigId:function(model) {
		var configId = model[global.AISearchConstants.AIS_GENIUS_CONFIG_ID];
		return !gs.nil(configId)? configId : '';
	},
	
	_getCardType: function(model) {
		return  model.model || ''; // Model is the type of the Genius Card Template
	},
	
	getEventType: function() {
		return global.AISearchConstants.RESULT_EVENT_TYPE_GENIUS;
	},
	
	type: 'AISearchGlideSignalsGeniusResultEvent'
});														   
