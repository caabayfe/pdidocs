var KnowledgeUIActionSNC = Class.create();
KnowledgeUIActionSNC.prototype = {
    initialize: function() {
		this.PUBLISH_WORKFLOW = "workflow";
		this.RETIRE_WORKFLOW = "retire_workflow";
		this.PUBLISH_FLOW = "kb_publish_flow";
		this.RETIRE_FLOW = "kb_retire_flow";
		this.KB_MERGE_ARTICLE_SOURCE = "kb_merge_article_source";
		this.SOURCE_ARTICLE = "source_article";
		this.MERGED_ARTICLE = "merged_article";
    },
	
	getEditableFields: function() {
		return new KBVersioning().getEditableFields();
	},
	
	articleExistsForSource: function(sourceId) {
		var gr = new GlideRecord("kb_knowledge");
		if(sourceId) {
			gr.addQuery("source",sourceId);
			gr.query();
			if(gr.next())
				return true;
		}
		return false;
	},

	tableMapExists: function(source,mapName) {
		if(source) {
			var mapUtil = new CSMTableMapUtil(source);
			if(mapName && mapName != '')
				return (mapUtil.findMapByName(mapName) && new KBKnowledge().canCreate());
		}
		return false;
	},

	showTemplateSelector: function() {
            	if(new KBViewModel().isVersioningInstalled()) 
                   	if(new ArticleTemplateUtil().canContributeToTemplates())
                            	return true;
            	return false;
       	},
	createKnowledgeAnyTemplateOnCase: function(){
		return gs.getProperty("sn_customerservice.enable_knowledge_kcs") == 'true' && gs.getProperty("sn_customerservice.kcs.enable_template_on_case_workspace") == 'true' && !(this.articleExistsForSource(current.sys_id)) ;
	},
	
	/**
	* publishes an article given article id and tablename
	*/
	publishArticleById: function(tableName, articleId){	
		if(gs.nil(tableName) || gs.nil(articleId))
			return false;
		var articleGr = new GlideRecord(tableName);
		if(!articleGr.get(articleId))
            return false;
        return this.publish(articleGr);
    },

    /**
     * publishes an article given article Gliderecord
     */
    publish: function(articleGr) {
        if (!gs.nil(articleGr.scheduled_publish_date) && articleGr.scheduled_publish_date.changes()) {
            if (new KBCommon().validateScheduledPublishDate(current)) {
                gs.addErrorMessage(gs.getMessage("The Scheduled Publish Date must be set at least 24 hr after the current date."));
                articleGr.setAbortAction(true);
				return ;
            }
        }
        var prevValue = articleGr.workflow_state + '';
		if(!(new KBKnowledge().canPublish(articleGr)))
            return false;
		if(articleGr.getTableName() != articleGr.sys_class_name){
            //update current to point to the table extended from kb_knowledge with specified sys_id.
			articleGr  = new GlideRecordUtil().getGR("kb_knowledge", articleGr.getUniqueValue());
        }
        var workflowFieldExists = this.checkIfWorkflowFieldExists(articleGr, this.PUBLISH_WORKFLOW);
        var flowFieldExists = this.checkIfFlowFieldExists(articleGr, this.PUBLISH_FLOW);

        if (articleGr.kb_knowledge_base.kb_version == "3" &&
            (workflowFieldExists || flowFieldExists) &&
            (workflowFieldExists ? new KBWorkflow().startWorkflow(articleGr, this.PUBLISH_WORKFLOW) : new KBFlow().startFlow(articleGr, this.PUBLISH_FLOW))) {

            /*Unlike workflows that update the record that triggered them, Flow doesn't necessarily update the same record object. 
            Instead, Flow queries the provided GlideRecord reference from the database and updates it. 
            As a result, the articleGr object may not be updated with the latest version information, 
            since the business rule triggered by the flow hasn't modified the articleGr object. 
            To prevent stale data, we query the database after the Flow execution to ensure we retrieve 
            the correct, up-to-date information about the knowledge record.
            This might be a temporary fix until we get a better way of handling it from flow itself.*/

            var articleGrCopy = new GlideRecord("kb_knowledge");
            articleGrCopy.get(articleGr.sys_id);
            // If publish sub workflow is completed, workflow engine would have already done current.update()
            if (articleGr.workflow_state != 'published') {
                if (articleGr.version != articleGrCopy.version) {
                    articleGr.version = articleGrCopy.version;
                }
                articleGr.update();
            }   

            var knowledge = new GlideRecord("kb_knowledge");
            if (knowledge.get(articleGr.sys_id) && prevValue != knowledge.getValue("workflow_state")) {
                var stateMessage = knowledge.sys_class_name == 'kb_knowledge_block' ?
                    new KBBlock().getStateMessage(knowledge.getValue("workflow_state")) :
                    new KBKnowledge().getStateMessage(knowledge.getValue("workflow_state"));

                gs.addInfoMessage(stateMessage);
            }
        } else if (articleGr.kb_knowledge_base.kb_version == "2") {
            articleGr.workflow_state = 'published';
            articleGr.update();
            gs.addInfoMessage(new KBKnowledge().getStateMessage(articleGr.getValue("workflow_state")));
        }
        //Check plugin is active
        if (GlidePluginManager.isActive('sn_km_gen_ai')) {
            new sn_km_gen_ai.KnowledgeGenAIUtils().updateGenAIFeedback(articleGr);
        }
        return true;
    },

	showModal: function(articleGr){
		if(articleGr.sys_class_name != 'kb_knowledge_block' &&  new KBCommon().checkGuestUserHasAccess(articleGr.getUniqueValue()))
            return true;
        return false;
    },

    /**
     * Retires a knowledge record 
     * @param GlideRecord kb_knowledge record that has been sent for retire
     */
    retireKnowledgeRecord: function(articleGr) {
        var workflowFieldExists = this.checkIfWorkflowFieldExists(articleGr, this.RETIRE_WORKFLOW);
        var flowFieldExists = this.checkIfFlowFieldExists(articleGr, this.RETIRE_FLOW);

        if (articleGr.kb_knowledge_base.kb_version == "3" && (workflowFieldExists || flowFieldExists) &&
            (workflowFieldExists) ? new KBWorkflow().startWorkflow(articleGr, this.RETIRE_WORKFLOW) : new KBFlow().startFlow(articleGr, this.RETIRE_FLOW)) {
            if (articleGr.workflow_state != 'retired')
                articleGr.update();

            var knowledge = new GlideRecord("kb_knowledge");
            if (knowledge.get(articleGr.sys_id)) {
                var stateMessage = knowledge.sys_class_name == 'kb_knowledge_block' ?
                    new KBBlock().getStateMessage(knowledge.getValue("workflow_state")) :
                    new KBKnowledge().getStateMessage(knowledge.getValue("workflow_state"));

                gs.addInfoMessage(stateMessage);
            }
        } else if (articleGr.kb_knowledge_base.kb_version == "2") {
            current.workflow_state = 'retired';
            current.update();
            gs.addInfoMessage(new KBKnowledge().getStateMessage(current.getValue("workflow_state")));
        }
        return true;
    },

    isKBWorkflowFieldActive : function(field){
		try{
			var gr = new GlideRecord('kb_knowledge_base');
			field = field ? field : 'workflow';
			return gr.getElement(field).getED().isActive();
		}catch(err){
			gs.error('KM: KnowledgeUIActionSNC.isKBWorkflowFieldActive error: ' + JSON.stringify(err));
		}
		return false;
	},

    /**
     * checks if field on a table is active 
     * @param GlideRecord kb_knowledge_base record
     * @param String field on the kb_knowledge_base.
     * @return Boolean true if field is active
     */
    isFieldActive: function(gr, field) {
        if (JSUtil.nil(gr))
            return false;
        var active = false;
        try {
            active = gr.getElement(field).getED().isActive();
        } catch (err) {
            gs.error('KnowledgeUIActionSNC: isFieldActive error: ' + JSON.stringify(err));
        }

        return active;
    },

    /**
    * checks if workflow fields "workflow" and "retire_workflow" is present and has value
    * @param GlideRecord kb_knowledge_base record
    * @param String workflowField on the kb_knowledge_base.
    * @return Boolean true if field is present and has value
    */
    checkIfWorkflowFieldExists: function(articleGr, workflowField) {
        var knowledgeBaseSysId = articleGr.kb_knowledge_base;
        var gr = new GlideRecord('kb_knowledge_base');
        if (gr.get(knowledgeBaseSysId)) {
            if (!this.isFieldActive(gr, workflowField))
                return false;
            if (workflowField == this.PUBLISH_WORKFLOW)
                return (gr.isValidField(this.PUBLISH_WORKFLOW) && !(JSUtil.nil(gr.workflow)));
            else if (workflowField == this.RETIRE_WORKFLOW)
                return (gr.isValidField(this.RETIRE_WORKFLOW) && !(JSUtil.nil(gr.retire_workflow)));
        } else
            return false;
    },

    /**
    * checks if flow fields "kb_publish_flow" and "kb_retire_flow" is present and has value
    * @param GlideRecord kb_knowledge_base record
    * @param String flowField on the kb_knowledge_base.
    * @return Boolean true if field is present and has value
    */
    checkIfFlowFieldExists: function(articleGr, flowField) {
        var knowledgeBaseSysId = articleGr.kb_knowledge_base;
        var gr = new GlideRecord('kb_knowledge_base');
        if (gr.get(knowledgeBaseSysId)) {
            if (!this.isFieldActive(gr, flowField))
                return false;
            if (flowField == this.PUBLISH_FLOW)
                return (gr.isValidField(this.PUBLISH_FLOW) && !(JSUtil.nil(gr.kb_publish_flow)));
            else if (flowField == this.RETIRE_FLOW)
                return (gr.isValidField(this.RETIRE_FLOW) && !(JSUtil.nil(gr.kb_retire_flow)));
        } else
            return false;
    },

    /**
     * checks if duplicates exist in KB_MERGE_ARTICLE_SOURCE
     * @param GlideRecord kb_knowledge record
     * @return Boolean true if duplicates exist in KB_MERGE_ARTICLE_SOURCE for the given record
     */
    checkDuplicateExists: function(articleId) {
        if (gs.nil(articleId))
            return false;

        var gr = new GlideRecord(this.KB_MERGE_ARTICLE_SOURCE);

        if (!gr.isValid())
            return false;

        gr.addQuery(this.MERGED_ARTICLE, articleId);
        gr.setLimit(1);
        gr.query();

        return gr.hasNext();
	},

    /**
     * checks if DA shows confirm publish modal and manage duplicates modal
     * @param GlideRecord kb_knowledge record
     * @param boolean field if we want to show confirm publish modal
     * @return Boolean true if DA should be shown
     */
    showPublishModals: function(articleGr, showConfirmPublishModal, showManageDuplicateModal) {
        var isDuplicateExists = this.checkDuplicateExists(articleGr.getUniqueValue());
        var shouldShowConfirmPublishModal = this.showModal(articleGr);
        if (showConfirmPublishModal && showManageDuplicateModal) {
            return isDuplicateExists && shouldShowConfirmPublishModal;
        } else if (!showConfirmPublishModal && showManageDuplicateModal) {
            return isDuplicateExists && !shouldShowConfirmPublishModal;
        } else if (showConfirmPublishModal && !showManageDuplicateModal) {
            return !isDuplicateExists && shouldShowConfirmPublishModal;
        } else {
            return !isDuplicateExists && !shouldShowConfirmPublishModal;
        }
    },

    type: 'KnowledgeUIActionSNC'
};
