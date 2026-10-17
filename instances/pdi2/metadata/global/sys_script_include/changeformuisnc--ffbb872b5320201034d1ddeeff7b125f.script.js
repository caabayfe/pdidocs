var ChangeFormUISNC = Class.create();
ChangeFormUISNC.prototype = {
	initialize: function(_gr, _gs) {
		this._gr = _gr || current;
		this._gs = _gs || gs;
	},

	isAssessAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return changeGr.getValue("on_hold") !== "1" && new ChangeRequest(changeGr).isNextManualState("-4");
		});
	},

	isAuthorizeAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return changeGr.getValue("on_hold") !== "1" &&
				new ChangeRequest(changeGr).isNextManualState("-3") &&
				(changeGr.approval == "not requested" || changeGr.approval == "rejected");
		});
	},
	
	isCancelAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return new ChangeRequest(changeGr).canMoveTo("4");
		});
	},
	
	isCloseAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return changeGr.getValue("on_hold") !== "1"  && new ChangeRequest(changeGr).isNextManualState("3");
		});
	},
	
	isImplementAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return new ChangeRequest(changeGr).isNextManualState("-1");
		});
	},
	
	isReviewAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return new ChangeRequest(changeGr).isNextManualState("0");
		});
	},
	
	// Used for Standard Changes.
	isScheduleAvailable: function() {
		return this._evaluateCondition(function(changeGr) {
			return changeGr.type == "standard" && new ChangeRequest(changeGr).isNextManualState("-2");
		});
	},
	
	_evaluateCondition: function(conditionFunc) {
		if (!this._gr || typeof conditionFunc !== "function")
			return false;
		
		// Lookup persisted record as previous isn't available in a UI Action condition
		var changeGr = this._gr;
		if (this._gr.isActionAborted() && !this._gr.isNewRecord()) {
			changeGr = new GlideRecord(this._gr.getTableName());
			if (!changeGr.get(this._gr.getUniqueValue()))
				return false;
		}
		
		return conditionFunc(changeGr);
	},
	
    type: 'ChangeFormUISNC'
};
