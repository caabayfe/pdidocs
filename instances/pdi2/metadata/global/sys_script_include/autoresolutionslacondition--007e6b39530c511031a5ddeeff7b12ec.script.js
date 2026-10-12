var AutoResolutionSLACondition = Class.create();
AutoResolutionSLACondition.prototype = Object.extendsObject(SLAConditionBase, {
    
	cancel: function() {
		this.lu.logInfo('AutoResolutionSLACondition.cancel called');
		if (SLAConditionBase.prototype.cancel.call(this)) {
			//If cancel condition matches, set IAR context to inactive. 
			this._markContextInactive(AutoResolutionConstants.SLA_STATE.CANCELED);
			return true;
		}
		return false;
	},
	
	complete: function() {
		this.lu.logInfo('AutoResolutionSLACondition.complete called');
		if (SLAConditionBase.prototype.complete.call(this)) {
			//If complete condition matches, set IAR context to inactive. 
			this._markContextInactive(AutoResolutionConstants.SLA_STATE.COMPLETED);
			return true;
		}
		return false;		
	},
	
	_markContextInactive: function(contextSLAState) {
		var contextGr = new GlideRecord(AutoResolutionConstants.CONTEXT_TABLE_NAME);
			contextGr.addActiveQuery();
			contextGr.addQuery(AutoResolutionConstants.CONTEXT_TASK_SLA_FIELD_NAME, this.taskSLA.getUniqueValue());
			contextGr.query();
			contextGr.next();
			if(contextGr.isValidRecord()) {
				contextGr.setValue(AutoResolutionConstants.ACTIVE_FIELD_NAME, false);
				contextGr.setValue(AutoResolutionConstants.CONTEXT_SLA_STATE_FIELD_NAME , contextSLAState);
				contextGr.update();
			}
	},
	
    type: 'AutoResolutionSLACondition'
});
