var KBImportAJAXSNC = Class.create();
KBImportAJAXSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	/**
	This method should perform checkout and processing of attachment and return's sysId of checkouted article
 	**/
	performImportToNewVersion: function(){
		try{
			var fileId = this.getParameter("sysparm_file_id");
			var articleId = this.getParameter("sysparm_article_id");
			var copyAttachments = this.getParameter("sysparm_copy_attachments");
			
			if(gs.nil(copyAttachments))
				copyAttachments = false;
			else
				copyAttachments = copyAttachments == "true" ? true : false;
			
			return this._performImportToNewVersion(fileId, articleId, copyAttachments);
		}catch(e){
			return [];
		}
	},
	
	_performImportToNewVersion: function(fileId, articleId, copyAttachments){
		var passMessage =  gs.getMessage("Article revison successfully created from uploaded file.");
		var failMessage = gs.getMessage("Invalid input data provided.");
		
		if(gs.nil(fileId) || gs.nil(articleId)){
			return this._encode({success: false, message: failMessage});
		}
		
		var kbVersioningObj = new KBVersioning();
		
		if(!kbVersioningObj.isVersioningEnabled())
			return this._encode({success: false, message: failMessage});
		
		var article = new GlideRecord(kbVersioningObj.KB_KNOWLEDGE);
		article.addQuery("sys_id", articleId);
		article.query();

		//if found glide Record
		if(article.next() && article.canRead()) {
			if(!(article.workflow_state == kbVersioningObj.INITIAL_STATE || article.workflow_state == kbVersioningObj.MAJOR_STATE))
				return this._encode({success: false, message: failMessage});
			
			var knowledgeSysId = articleId;
			var articleOldState = article.workflow_state + '';
			var oldAttachments = null;
			
			if(article.workflow_state == kbVersioningObj.MAJOR_STATE){
				var newRecord = kbVersioningObj.checkout(article, !copyAttachments);
				if(gs.nil(newRecord))
					return this._encode({success: false, message: failMessage});
				
				knowledgeSysId = newRecord.getUniqueValue();
			}
			else if(articleOldState == kbVersioningObj.INITIAL_STATE) {
				if(!article.canWrite()){
					return this._encode({success: false, message: failMessage});
				}
			
				if(!copyAttachments){
					var objSysAttachment = new GlideSysAttachment();
					oldAttachments = objSysAttachment.getAttachments(article.sys_class_name, articleId) ;
				}
			}
			
			try{
				var result = new SNC.KnowledgeHelper().processAttachment(fileId, knowledgeSysId);
				if(articleOldState == kbVersioningObj.INITIAL_STATE && !copyAttachments && oldAttachments != null){
					while(oldAttachments.next()){
						objSysAttachment.deleteAttachment(oldAttachments.sys_id);
					}
				}
				return this._encode({success: true, message: passMessage, kbMeta: JSON.parse(result)});
			}
			catch(e){
				return this._encode({success: false, message: e.message});
			}
		}
		else {
			return this._encode({success: false, message: failMessage});
		}
	},
	
	_encode: function(object) {
		return new JSON().encode(object);
	},
	
    type: 'KBImportAJAXSNC'
});
