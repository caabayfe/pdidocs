var SNHelpQuestionController = Class.create();
SNHelpQuestionController.prototype = {
	
    initialize: function() {
		
		this._helpConstants = new SNHelpConstantProvider();
		this._dbCtrl = new SNHelpDBController(this._helpConstants.tables.question);
		this._answerCtrl = new SNHelpAnswerController();
		this._helpUtil = new SNHelpUtil();
    },
	
	/*
	* Retuns questions for the content id
	* @param id {content id}
	*/
	getQuestions: function(id) {
		
		var questions, mapPayload, i;
		
		if (!id) {
			this._helpUtil.setError(this.type,this._helpConstants.errorMessages.empty_sys_id);
			return null;
		}
		
		questions = this._dbCtrl.getByEncodedQuery(this._helpConstants.tableColumns.content +"="+ id, this._helpConstants.tableColumns.order);
		
		if (!questions) {
			this._helpUtil.setError(this.type, this._helpConstants.errorMessages.no_records, id);
			return null;
		}
		
		for (i= 0; i< questions.length; i++) {
			questions[i].answers = this._answerCtrl.getAnswers(questions[i].sys_id) || [];
		}
		return questions;
	},
	
    type: 'SNHelpQuestionController'
};
