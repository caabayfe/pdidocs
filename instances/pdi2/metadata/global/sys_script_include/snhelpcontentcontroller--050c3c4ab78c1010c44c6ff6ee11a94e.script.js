var SNHelpContentController = Class.create();
SNHelpContentController.prototype = {
    initialize: function() {
		
		this._helpConstants = new SNHelpConstantProvider();
		this._questionCtrl = new SNHelpQuestionController();
		this._dbCtrl = new SNHelpDBController(this._helpConstants.tables.content);
		this._helpUtil = new SNHelpUtil();
    },
			
    getContent: function(step_sysid,layout, fields) {
		
		var contents;
		
		if (!step_sysid || !layout) {
			this._helpUtil.setError(this.type,this._helpConstants.errorMessages.empty_sys_id);
			return null;
		}
		
		contents = this._dbCtrl.getByEncodedQuery(this._helpConstants.tableColumns.guidance_step +'='+ step_sysid + "^default_content=true", null, fields);
		
		if (!contents ) {
			this._helpUtil.setError(this.type, this._helpConstants.errorMessages.no_records, step_sysid);
			return null; 
		}
		
		if (Array.isArray(contents) && contents.length > 0 && (layout === this._helpConstants.stepLayout.QUESTION
|| layout === this._helpConstants.stepLayout.IMAGE_QUESTION) ) 
			contents[0].questions = this._questionCtrl.getQuestions(contents[0].sys_id) || [];
		
		return contents;
	},
	
	getRelatedContent : function(related_content) {
		return this._dbCtrl.getByEncodedQuery("sys_idIN" + related_content, null, this._helpConstants.restAPIKeys.related_content);
		
	},
	
    type: 'SNHelpContentController'
};
