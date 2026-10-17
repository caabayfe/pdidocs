var AISearchGlideSignalsSearchResultEvent = Class.create();

AISearchGlideSignalsSearchResultEvent.prototype = Object.extendsObject(global.AISearchGlideSignalsEvent, {
	
	initialize: function(searchResultMetadata, paramBag) {
		global.AISearchGlideSignalsEvent.prototype.initialize.call(this, searchResultMetadata, paramBag);
	},
	
	buildPayload: function(data, signalType, signalValue) {
		
		if (gs.nil(data))
			return;
		
		var propValues = data.propValues;
		var model = propValues.model;
		
		if (gs.nil(model))
			return;
		
		var resultSysId = this.getResultSysId(model);
		this.setValue(global.AISearchConstants.RESULT_SYS_ID, resultSysId);
		this.setValue(global.AISearchConstants.LABEL_DESCRIPTION, this._getLabelDescription(model));
		var srcTable = this.getSourceTable(model);
		this.setValue(global.AISearchConstants.SOURCE_TABLE, srcTable);
		this.setValue(global.AISearchConstants.SIGNAL_TYPE, signalType);
		this.setValue(global.AISearchConstants.SIGNAL_VALUE, signalValue);
		this.setValue(global.AISearchConstants.SOURCE_URL, global.AISearchHelper.getSourceURLFromModel(model));
		this.setValue(global.AISearchConstants.AIS_DOC_ID, this.getAISDocId(srcTable, resultSysId));
	},
	
	_getLabelDescription:function(model) {
		
		if(model.table == global.AISearchConstants.CATALOG_SOURCE_TABLE)
			return model.name;
		
		return model['short_description'] || model['description'] || model['name'] || model['file_name']||'';
	},
	
	getEventType: function() {
		return global.AISearchConstants.RESULT_EVENT_TYPE_SEARCH;
	},
	
	type: 'AISearchGlideSignalsSearchResultEvent'
});														   
