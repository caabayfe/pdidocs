var SNHelpAnswerController = Class.create();
SNHelpAnswerController.prototype = {
	
    initialize: function() {
		
		this._helpConstants = new SNHelpConstantProvider();
		this._dbCtrl = new SNHelpDBController(this._helpConstants.tables.answer);
		this._helpUtil = new SNHelpUtil();
    },
	
	/*
	* Returns answers for the given question id
	* @parms id {question id}
	*/
	getAnswers: function(id) {
		
		var answers; 
		
		if (!id) {
			this._helpUtil.setError(this.type, this._helpConstants.errorMessages.empty_sys_id);
			return null;
		}	
		
		answers = this._dbCtrl.getByEncodedQuery(this._helpConstants.tableColumns.question + "=" +id, this._helpConstants.tableColumns.order);
		
		return answers; 
	},
	
    type: 'SNHelpAnswerController'
};
