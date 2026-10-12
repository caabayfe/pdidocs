var KBVersioningSNC = Class.create();
KBVersioningSNC.prototype = Object.extendsObject(KBCommon, {
	INITIAL_MINOR_VERSION : '0.01',
	INITIAL_MAJOR_VERSION : '1.0',
	OUTDATED_STATE : 'outdated',
	MAJOR_STATE: 'published',
	INITIAL_STATE : 'draft',
	INITIAL_CONFIDENCE : 'work_in_progress',
	RETIRED_STATE: 'retired',
	WORKFLOW_COMPLETED_STATES : ['published','outdated'],
	KB_VERSION : 'kb_version',
	KB_KNOWLEDGE: 'kb_knowledge',
	OWNERSHIP_GROUP : "ownership_group",
	KB_HISTORY: 'm2m_kb_to_block_history',
	LOG_SOURCE : 'KBVersioningSNC',
	SUCCESS: 'SUCCESS',
	FAILED: 'FAILED',
	DEBUG: false,
	OUTDATE_FLOW_NAME: 'knowledge__outdate_article',
	log: function(message){
		if(this.DEBUG)
			gs.log(message,this.LOG_SOURCE);
	},

	initialize: function(){
		this._knowledgeHelper = new SNC.KnowledgeHelper();
	},

	enable: function(){
		this._updateDisplayValueField('kb_knowledge', 'display_number', true);
		this._updateDisplayValueField('kb_knowledge', 'number', false);
	},

	disable: function(){
		this._updateDisplayValueField('kb_knowledge', 'display_number', false);
		this._updateDisplayValueField('kb_knowledge', 'number', true);
	},

	initializeVersion: function(current){
		var nextVersion = this._getInitialVersion(current);
		current.version = this._newVersionRecord(current,nextVersion,true);
		if(current.article_id.nil()){
			current.article_id = current.sys_id;
			current.summary = this._createNewSummaryRecord(current);
			current.latest = true;
		}
		this._performUpdate(current,true);
	},

	/**
 	* Increment the minor version of the article
 	*
 	* @param GlideRecord: current
 	**/
	incrementMinorVersion: function(current){
		var nextVersion;
		if(!current.version.nil())
			nextVersion = this._nextMinorVersion(current.version.version+'');
		else
			nextVersion = this.INITIAL_MINOR_VERSION;
		if(current.article_id.nil()){
			current.article_id = current.sys_id;
			current.summary = this._createNewSummaryRecord(current);
			current.latest = true;
		}
		current.version = this._newVersionRecord(current,nextVersion);
		this._performUpdate(current);
	},

	/**
 	* Increment the major version of the article
 	*
 	* @param GlideRecord: current
 	**/
	incrementMajorVersion: function(current){
		var nextVersion;
		if(!current.version.nil())
			nextVersion = this._nextMajorVersion(current.version.version+'');
		else
			nextVersion = this.INITIAL_MAJOR_VERSION;

		if(current.article_id.nil()){
			current.article_id = current.sys_id;
			current.summary = this._createNewSummaryRecord(current);
			current.latest = true;
		}
		current.version = this._newVersionRecord(current,nextVersion);

		try{
			var prevPublishedArticleViewCount = parseInt(this.outdateOldVersion(current));
			var currentPublishedArticleViewCount = parseInt(this.getStandaloneViewCount(current));
			current.sys_view_count = prevPublishedArticleViewCount + currentPublishedArticleViewCount;
		}
		catch(e) {
			gs.info('Exception occurs while calculating view counts when article is published: ' + e);
		}

		this._performUpdate(current);
	},

	/**
 	* Get total views from kb_use table those will be stanalone views not getting from any of previous versions views
 	*
 	* @param GlideRecord: current
 	**/
	getStandaloneViewCount: function(current) {
        var kbv = new GlideAggregate("kb_use");
        kbv.addQuery("article", current.sys_id);
        kbv.addQuery("viewed", "true");
        kbv.addAggregate("SUM", "times_viewed");
        kbv.query();

        var views = 0;
        if (kbv.next())
            views = kbv.getAggregate("SUM", "times_viewed");
        return views;

    },

	/**
 	* Get latest version of the article this user have access to
 	*
 	* @param String articleNumber
	* @return GlideRecord record
 	**/
	getLatestAccessibleVersion: function(articleNumber, ignoreOutdated){
		articleNumber = this.getCorrectlyPaddedNumber(articleNumber);
        var gr = new GlideRecordSecure(this.KB_KNOWLEDGE);
        gr.addQuery('number', articleNumber);
        if (ignoreOutdated) {
            gr.addQuery('workflow_state', '!=', 'outdated');
        }
        gr.orderByDesc('version.sys_created_on');
        gr.setCategory('homepage');
		gr.query();
        if (gr.next()) {
            var record = new GlideRecord(this.KB_KNOWLEDGE);
            record.get(gr.getUniqueValue());
            return record;
        } else
            return false;
	},
	
	/**
 	* Get latest version of the article else return false if user can't access it.
 	*
 	* @param String articleNumber
	* @return GlideRecord record
 	**/
	getLatestVersionByNumber: function(articleNumber, skipAccessCheck) {
		articleNumber = this.getCorrectlyPaddedNumber(articleNumber);
		var latestKnowledgeGR = new GlideRecord(this.KB_KNOWLEDGE);
        latestKnowledgeGR.addQuery('number', articleNumber);
        latestKnowledgeGR.addQuery('latest', 'true');
		latestKnowledgeGR.setCategory('homepage');
        latestKnowledgeGR.query();

        if(latestKnowledgeGR.next() && (skipAccessCheck ? true : latestKnowledgeGR.canRead())) {
            return latestKnowledgeGR;
        } else {
            return false;
        }
	},

	/**
 	* Get latest version of the article this user have access to
 	*
 	* @param String articleId
	* @return GlideRecord record
 	**/
	getLatestAccessibleVersionFromId: function(articleId){
		var gr = new GlideRecordSecure(this.KB_KNOWLEDGE);
		gr.addQuery('article_id',articleId);
		gr.orderByDesc('version.sys_created_on');
		gr.setCategory('homepage');
		gr.query();
		if(gr.next()){
			var record = new GlideRecord(this.KB_KNOWLEDGE);
			record.get(gr.getUniqueValue());
			return record;
		}
		else
			return false;
	},
	
	/**
 	* Get new published article Ids from article Ids of articles
 	*
 	* @param Array articleIds
	* @return Array articleIds
 	**/
	getLatestArticlesByVersion: function(articleIds){
		var allArticles = new GlideRecord('kb_knowledge');
		allArticles.addQuery('sys_id', 'IN', articleIds);
		allArticles.query();

		var article_ids = [];
		while(allArticles.next())
			article_ids.push(allArticles.getValue('article_id'));
		
		var latestArticles = new GlideRecord('kb_knowledge');
		latestArticles.addQuery('article_id', 'IN', article_ids);
		latestArticles.addQuery('workflow_state','published');
		latestArticles.setWorkflow(false);
		latestArticles.addActiveQuery();
		latestArticles.setCategory('homepage');
		latestArticles.query();
		
		var articleList = [];
		while(latestArticles.next()){
			articleList.push(latestArticles.getUniqueValue());
		}
		return articleList;
	},

	/**
 	* Get article GR from article number and version number
 	*
 	* @param String articleNumber
	* @param String version
	* @return GlideRecord record
 	**/
	getArticleVersion: function(articleNumber,versionNumber){
		var versionGr = this._getVersionRecord(articleNumber,versionNumber);
		if(versionGr)
			return this.getArticleGRFromVersionRecord(versionGr);
		else
			return false;
	},


	/**
 	* Get article GR from article id and version number
 	*
 	* @param String articleId
	* @param String version
	* @return GlideRecord record
 	**/
	getArticleVersionFromId: function(articleId,versionNumber){
		var versionGr = this._getVersionRecordFromId(articleId,versionNumber);
		if(versionGr)
			return this.getArticleGRFromVersionRecord(versionGr);
		else
			return false;
	},


	/**
 	* Get article GR from article number and date
 	*
 	* @param {String} viewOnDate
	* @param {String} articleNumber
	* @param {String} validTo
	* @param {String} workflow
	* @return GlideRecord record
 	**/
	getArticleOnDate: function(viewOnDate,articleNumber,validTo, workflow){
		var articleGr = this._getRecordOnDate(viewOnDate,articleNumber,validTo, workflow);
		if(articleGr)
			return articleGr;
		else
			return null;
	},


	/**
 	* Get Article GR with the version record
 	*
 	*
 	* @param articleId
	* @param versionNumber
 	**/
	getArticleGRFromVersionRecord: function(versionGr){
		// If not a physical record, rollback to the snapshot
		if(!this.isPhysicalRecord(versionGr)){
			var oldGr = this._knowledgeHelper.rollback(versionGr.knowledge.getRefRecord(),versionGr.snapshot);
			//Because version field changes are not included in audits
			oldGr.setValue('version',versionGr.sys_id+'');
			oldGr.setValue('latest',false);
			return oldGr;
		}
		else
			return versionGr.knowledge.getRefRecord();
	},

	/**
 	* Check if a given version has a physical GlideRecord available
 	*
 	*
 	* @param versionGr
	* 
 	**/
	isPhysicalRecord: function(versionGr) {
		var knowledge = versionGr.knowledge.getRefRecord();
		return (knowledge.getValue('version') == versionGr.sys_id);
	},

	/**
 	* Mark existing published version as old
 	*
 	* @param GlideRecord: current
 	**/
	outdateOldVersion: function(current) {
	    if (current.article_id.nil())
	        return;
		// Check if the knowledge base is using flows.
		var knowledgeUIActionAPI = new global.KnowledgeUIAction();
		var shouldTriggerFlow = knowledgeUIActionAPI.checkIfFlowFieldExists(current, knowledgeUIActionAPI.PUBLISH_FLOW);

	    var gr = new GlideRecord(this.KB_KNOWLEDGE);
	    gr.setWorkflow(false);
	    gr.setSystem(true);
	    gr.addQuery('article_id', current.article_id);
	    gr.addQuery('sys_id', '!=', current.sys_id + '');
	    gr.addQuery('workflow_state', this.MAJOR_STATE);
	    gr.query();
	    var prevPublishedArticleViewCount = 0;
	    while (gr.next()) {
	        prevPublishedArticleViewCount = gr.getValue("sys_view_count");
            // Trigger flow to update the stage if KB uses flows
            // Flow will set the proper stage that displays in list view
            if (shouldTriggerFlow) {
                this._triggerOutdatedFlow(gr);
            } else {
                gr.workflow_state = this.OUTDATED_STATE;
                gr.update();
            }
	    }
	    return prevPublishedArticleViewCount;
	},

	/**
	 * Trigger flow to update stage when article is marked as outdated.
	 * This method should only be called if the KB is configured to use flows.
	 * The flow contains stage configuration that properly updates the stage field.
	 * 
	 * @param GlideRecord: gr - The knowledge record that was marked as outdated
	 **/
	_triggerOutdatedFlow: function(gr) {
		try {
			if (!gr || !gr.isValidRecord()) {
				gs.warn('_triggerOutdatedFlow called with invalid GlideRecord');
				return;
			}

			sn_flow_trigger.FlowTriggerAPI.fireKnowledgeTrigger(
				this.OUTDATE_FLOW_NAME,
				gr
			);

			this.log(
				'Triggered outdated flow: ' + 
				this.OUTDATE_FLOW_NAME + 
				' for article: ' + 
				gr.number
			);
		} catch (err) {
			gs.error(
				'KBVersioningSNC._triggerOutdatedFlow failed: ' + 
				err.message
			);
		}
	},

	/**
 	* Update current versions snapshot to latest sys_mod_count
 	*
 	* @param GlideRecord: current
 	**/
	updateVersionSnapshot: function(current){
		if(!current.version.nil()){
			var version = new GlideRecord(this.KB_VERSION);
			if(version.get(current.version.sys_id+'')){
				version.snapshot = current.getValue('sys_mod_count');
				version.modified_by = gs.getUserID();
				version.modified_on = new GlideDateTime();
				version.update();
			}
		}
	},
	/**
 	* Recalls the article back to draft state from workflow
 	*
 	* @param GlideRecord: current
 	* 
 	**/
	recall: function(current){
		var workflowContextGR = new GlideRecord('wf_context');
		workflowContextGR.addActiveQuery();
		workflowContextGR.addQuery("id", current.getUniqueValue());
		workflowContextGR.query();

		if (workflowContextGR.next()) {
			try {
				new Workflow().cancel(current, current.sys_class_name);
			} catch (err) {
				gs.error("Error in canceling workflow context: " + JSON.stringify(err));
			}
		} else {
			var flowContextGR = new GlideRecord("sys_flow_context");
			flowContextGR.addQuery("state", "WAITING");
			flowContextGR.addQuery("source_record", current.getUniqueValue());
			flowContextGR.query();

			if (flowContextGR.next()) {
				try {
					sn_fd.FlowAPI.cancel(flowContextGR.getUniqueValue(), 'Canceling Knowledge Flow on recall');
					this.cancelApprovals(current);
				} catch (err) {
					gs.error("Error in canceling flow context: " + JSON.stringify(err));
				}
			}
		}
		current.workflow_state = this.INITIAL_STATE;
		current.update();

	},

	/**
 	* Cancels approval record after flow is cancelled
 	*
 	* @param GlideRecord: current
 	**/
	cancelApprovals: function(current)
	{
		var approvalGR = new GlideRecord("sysapproval_approver");
		approvalGR.addQuery("document_id", current.getUniqueValue());
		approvalGR.addQuery("state","requested");
		approvalGR.query();
		approvalGR.state = 'cancelled';
		approvalGR.updateMultiple();

	},


	/**
 	* Checkout a latest published article to create a new version
 	*
 	* @param GlideRecord: current
 	* @param Boolean: ignoreAttachments (Whether to copy attachments to new record by default or not)
 	* @return GlideRecord: newRecord
 	**/
	checkout: function(current, ignoreAttachments){	
		if(this.canCheckout(current)){
			return this._performCheckout(current, ignoreAttachments);
		}
		return false;
	},


	/**
 	* Checkout a outdated article to create a new version
 	*
 	* @param GlideRecord: current
 	* @return GlideRecord: newRecord
 	**/
	makeThisCurrent: function(current){
		if(this.canMakeThisCurrent(current)){
			return this._performCheckout(current);
		}
		return false;
	},


	/**
 	* Checks whether checkeout can be done by this user, from this record
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canCheckout: function(current){	
		if(gs.getProperty('glide.knowman.allow_edit_global_articles')=='false' && this.isArticleReadOnlyBasedOnDomain(current))
			return false;
		if(this.isExternalArticle(current))
			return false;
		if(!this._isValidVersion(current))
			return false;
		if(current.workflow_state!=this.MAJOR_STATE)
			return false;
		if(this._getCheckedoutRecord(current))
			return false;
		//If Ownership Group exist but user is not a member
		if(this.isValidFieldWithValue(current,this.OWNERSHIP_GROUP)){
			if(this.hasAnyElevatedAccess(current) || this.isGroupMemberOrManager(current[this.OWNERSHIP_GROUP]))
				return true;
			else if(gs.getProperty("glide.knowman.ownership_group.override", "false") == "true" && this.isAuthorOrReviser(current) && this.safeExecute(this._knowledgeHelper.canContribute, current))
				return true;
			return false;
		}else if(!this.hasAnyElevatedAccess(current) && !this.safeExecute(this._knowledgeHelper.canContribute, current))
			return false;

		return true;
	},

	/**
 	* Checks whether Related list mapping (Taxonomy) can be done by this user, from this record
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canCreateRListMappingOnVersionedArticle: function(current){
		if(gs.getProperty('glide.knowman.allow_edit_global_articles')=='false' && this.isArticleReadOnlyBasedOnDomain(current))
			return false;
		if(this.isExternalArticle(current))
			return false;
		if(!this._isValidVersion(current))
			return false;
		if(current.workflow_state!=this.MAJOR_STATE)
			return false;
		//If Ownership Group exist but user is not a member
		if(this.isValidFieldWithValue(current,this.OWNERSHIP_GROUP)){
			if(this.hasAnyElevatedAccess(current) || this.isGroupMemberOrManager(current[this.OWNERSHIP_GROUP]))
				return true;
			else if(gs.getProperty("glide.knowman.ownership_group.override", "false") == "true" && this.isAuthorOrReviser(current) && this.safeExecute(this._knowledgeHelper.canContribute, current))
				return true;
			return false;
		}else if(!this.hasAnyElevatedAccess(current) && !this.safeExecute(this._knowledgeHelper.canContribute, current))
			return false;

		return true;
	},

	/**
 	* Checks whether makeThisCurrent can be done by this user, from this record
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canMakeThisCurrent: function(current){	
		if(this.isExternalArticle(current))
			return false;
		if(!this._isValidVersion(current))
			return false;
		if(current.workflow_state!=this.OUTDATED_STATE)
			return false;
		if(this.isLinkedToWordDocument(current))
			return false;
		if(!this.hasAnyElevatedAccess(current) && !this.isMemberOfValidGroup(current,this.OWNERSHIP_GROUP))
			return false;
		if(this._getCheckedoutRecord(current))
			return false;
		return true;
	},

	/**
 	* Checks whether this record can be published by the user
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canPublish: function(current){
		if(current.workflow_state!='draft')
			return false;
		if(this.isOwnerOrAdmin(current)) //Knowledge base owner or admin can publish
			return true;
		if(this._isReviser(current) && this.safeExecute(this._knowledgeHelper.canContribute, current))// Reviser with contribute access can publish
			return true;
		if(this.isMemberOfValidGroup(current,this.OWNERSHIP_GROUP))//Ownership group member can publish
			return true;

		return false;
	},

	/**
 	* Checks whether this record can be recalled to editable state.
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canRecall: function(current){
        if(!(current.workflow_state =='review'|| current.workflow_state=='scheduled_publish'))
            return false;
        if(this.isOwnerOrAdmin(current))
            return true;
        if(this.isMemberOfValidGroup(current,this.OWNERSHIP_GROUP))//Ownership group member can recall
            return true;
		
		var canContributeToArticle = this.safeExecute(this._knowledgeHelper.canContribute, current);
        if(current.workflow_state =='review'){
            if(this._isReviser(current) && canContributeToArticle)// Reviser with contribute access can recall
				return true;
        }
        else if(current.workflow_state =='scheduled_publish'){
            if(!this.isValidFieldWithValue(current,this.OWNERSHIP_GROUP) || gs.getProperty("glide.knowman.ownership_group.override", "false") == "true")
				if(this._isReviser(current) && canContributeToArticle)
					return true;
        }
        return false;
    },

	/**
 	* Checks whether this record can be deletedy by the user
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canDelete: function(current){
		if(current.workflow_state!='draft')
			return false;
		if(this.isOwnerOrAdmin(current))
			return true;
		if(this._isReviser(current) && this.safeExecute(this._knowledgeHelper.canContribute, current))// Reviser with contribute access can delete
			return true;
		if(this.isMemberOfValidGroup(current,this.OWNERSHIP_GROUP))//Ownership group member can delete
			return true;
		
		return false;
	},

	/**
 	* Checks whether this record can be retired by this user
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canRetire: function(current){
		if(!this.isLatestVersion(current))
			return false;
		if (current.workflow_state != "published")
			return false;
		if(this.hasAnyElevatedAccess(current))
			return true;
		if(this.isValidFieldWithValue(current,this.OWNERSHIP_GROUP)){
			if(this.isGroupMemberOrManager(current[this.OWNERSHIP_GROUP]))
				return true;
			else if(gs.getProperty("glide.knowman.ownership_group.override", "false") == "true" && this.isAuthorOrReviser(current) && this.safeExecute(this._knowledgeHelper.canContribute, current))
				return true;
			return false;
		} else if((this._isReviser(current) || this._isAuthor(current)) && this.safeExecute(this._knowledgeHelper.canContribute, current))
			return true;

		return false;
	},
	
	/**
 	* Checks whether the user can upload new version
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canUploadNewVersion: function(current) {
		return !(new KBCommon().isStackNameDialog()) && (new KBCommon().isVersioningEnabled()) 
		&& (this.canCheckout(current) || current.workflow_state ==  'draft') 
		&& current.sys_class_name == 'kb_knowledge' && current.article_type== 'text' && !current.office_doc_url;
	},
	
	/**
  	* republishes the record
  	*
  	* @param GlideRecord: current
  	* @return GlideRecord
 	*
  	**/
	republish: function(current){

		if(this.canRepublishKnowledge(current) && this.isLatestVersion(current)){

			var gr = new GlideRecord('kb_knowledge');
			gr.setWorkflow(false);
			gr.addQuery('article_id',current.article_id);
			gr.addQuery('sys_id',"!=",current.sys_id);
			gr.addQuery('workflow_state',this.RETIRED_STATE);
			gr.query();
			while(gr.next()){
				gr.workflow_state = this.OUTDATED_STATE;
				gr.update();
			}
			current.workflow_state = this.MAJOR_STATE;
			current.published = new GlideDate();
			current.retired= "";
			current.update();
			return current;
		}
		return false;
	},

	/**
 	* Checks whether this record is a revised version
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	isRevised: function(current){
		return (!current.revised_by.nil() || !current.base_version.nil());
	},


	/**
 	* Can the user edit the current record, based on the state and roles
 	*
 	* @param GlideRecord: current
 	* @return Boolean
 	**/
	canWrite: function(current){

		// Only latest version can be modified by anyone.
		if(!this.isLatestVersion(current))
			return false;

		switch(current.workflow_state+''){
			case 'draft':
				// Allow write for admin/owner/reviser
				return (this.isOwnerOrAdmin(current) || (this._isReviser(current) 
														 && this.safeExecute(this._knowledgeHelper.canContribute, current)) 
						|| this.isMemberOfValidGroup(current,this.OWNERSHIP_GROUP));

			case 'scheduled_publish':
					return false;
			case 'review':
			case 'pending_retirement':
				// Allow write for admin/owner/approver
				return (this.isOwnerOrAdmin(current) || (this.isValidFieldWithValue(current,this.OWNERSHIP_GROUP) ? this.isGroupMemberOrManager(current[this.OWNERSHIP_GROUP]) : (this.safeExecute(this._knowledgeHelper.canContribute, current) && this._isApprover(current))));

			case 'retired':
			case 'outdated':
				// No modifications to retired/outdated
				return false;

			case 'published':
				// Allow write for admin,manager and owner so that we can handle the field level permissions
				// based on the property value using UI policy.
				return ((this.hasAnyElevatedAccess(current) || this.isMemberOfValidGroup(current,this.OWNERSHIP_GROUP)) && this.getEditableFields()!='');

			default:
				// Any additional state of the article will be writable to canContribute users by default
				return true;
		}
	},

	/**
 	* Checks whether the given version record can be seen by the user
 	*
 	* @param GlideRecord : versionGr
 	* @return Boolean
 	**/

	canReadVersion: function(versionGr){
		var articleGr = versionGr.knowledge.getRefRecord();
		if(this.safeExecute(this._knowledgeHelper.canContribute, articleGr))
			return true;
		if(articleGr && new KBKnowledge().canRead(articleGr)){
			return (articleGr.getValue('version')==versionGr.sys_id);
		}
		return false;
	},

	/**
 	* Checks whether the given GlideRecord is the latest version
 	*
 	* @param GlideRecord : current
 	* @return Boolean
 	**/
	isLatestVersion: function(current){
		return (current.latest.nil() || current.latest);
	},

	/**
 	* Returns the message to be displayed in the view pages
 	*
 	* @param GlideRecord : current
	* @param String : navigateTo (which view page link to use for navigation - Any of (kb_knowledge.do,kb_view.do))
	*
 	* @return String
 	**/
	getWarningMessage: function(current,urlPrefix){
		var recordClass = current.sys_class_name;
		if(current.article_id.nil())
			return '';

		var latest = this.getLatestAccessibleVersionFromId(current.article_id);
		var workflowState = current.workflow_state;
		var reviser = current.revised_by;
		if(latest && latest.sys_id!=current.sys_id){
			var link = urlPrefix + latest.sys_id;
			if(latest.canWrite() || this.canCheckout(latest))
				if(recordClass == 'kb_knowledge_block'){
					link=link+"&amp;sysparm_class_name="+current.sys_class_name;
					return gs.getMessage("<a href='{0}'>An updated version of this block is available</a>. You can only edit the latest version of the block",link);
				}	
				else
					return gs.getMessage("<a href='{0}'>An updated version of this article is available</a>. You can only edit the latest version of the article",link);
			else
				if(recordClass == 'kb_knowledge_block')
					return gs.getMessage("<a href='{0}'>An updated version of this block is available</a>",link);
			else
				return gs.getMessage("<a href='{0}'>An updated version of this article is available</a>",link);
		}
		else if((workflowState=="draft" || workflowState=="review") && !gs.nil(reviser) && this._isAuthor(current) && !current.canWrite()){
			var reviserName = "another contributor";
			if(reviser.name)
				reviserName = reviser.name+"";
			if(recordClass == 'kb_knowledge_block')
				return gs.getMessage("This block cannot be edited, since it is already checked out by {0}.", reviserName);
			else
				return gs.getMessage("This article cannot be edited, since it is already checked out by {0}.", reviserName);
		}
		return '';
	},

	/**
 	* Fetches the latest version of a given article
 	*
 	* @param String : articleId
 	* @return Boolean
 	**/
	getLatestVersion: function(articleId){
		var gr = new GlideRecord(this.KB_KNOWLEDGE);
		gr.addQuery('article_id',articleId);
		gr.orderByDesc('sys_created_on');
		gr.setLimit(1);
		gr.query();
		if(gr.next())
			return gr;
		else
			return false;
	},

	/**
 	* Returns the list of editable fields (comma separated) on published article.
 	*
 	* @return Boolean
 	**/
	getEditableFields: function(){
		if(gs.getProperty('glide.knowman.versioning.enable_minor_edits','false')=='true')
			return gs.getProperty('glide.knowman.versioning.minor_edit_fields','');
		return '';
	},

	/**
 	* Checks if the logged in user is knowledge_admin or owner of the KB
 	* @param GlideRecord : current
 	* @return Boolean
 	**/
	isOwnerOrAdmin: function(current){
		if (this.isAdminUser(current))
			return true;
		if (this.isKnowledgeBaseOwner(current,"kb_knowledge_base.owner"))
			return true;
		return false;
	},

	/**
 	* Checks whether the logged in user is any of knowledge_admin,
 	* managers,owner of the knowledge base
 	*
 	* @param GlideRecord : current
 	* @return Boolean
 	**/
	hasAnyElevatedAccess: function(current){
		var PATH_TO_OWNER = "kb_knowledge_base.owner";
		var PATH_TO_MANAGERS =  "kb_knowledge_base.kb_managers";
		if (this.isAdminUser(current))
			return true;

		if (this.isKnowledgeBaseOwner(current, PATH_TO_OWNER))
			return true;

		if (this.isKnowledgeBaseManager(current,PATH_TO_MANAGERS))
			return true;

		return false;
	},

	/**
 	* Get the comma separated sys_ids of the approvers in the
 	* 'requested state' from the approval table
 	* @param GlideRecord current
 	* @return String
 	**/
	getCurrentApprovers: function(current){
		var approvalGr = new GlideRecord('sysapproval_approver');
		approvalGr.addQuery('state', 'requested');
		approvalGr.addQuery('document_id',current.sys_id+'');
		approvalGr.query();
		var list = [];
		while(approvalGr.next()){
			list.push(approvalGr.getValue('approver'));
		}
		return list.join(',');
	},
	
	isAuthorOrReviser: function(gr) {
		return (this._isAuthor(gr) || this._isReviser(gr));
	},

	/**
 	* Get version record with the article number and version number
 	*
 	*
 	* @param article number
	* @param versionNumber
 	**/
	_getVersionRecord: function(articleNumber,versionNumber){
		articleNumber = this.getCorrectlyPaddedNumber(articleNumber);
		var version = new GlideRecord(this.KB_VERSION);
		version.addQuery('knowledge.number',articleNumber);
		version.addQuery('version',versionNumber);
		version.setCategory('homepage');
		version.query();
		while(version.next()){
			if(version.canRead())
				return version;
		}
		return false;
	},

	//Returns the date on which first version with block was published for the article
	_getFirstPublishedDateWithBlocks: function(articleNumber){

		var article = new GlideRecord('m2m_kb_to_block_history');
		article.addQuery('knowledge.number',articleNumber);
		article.addNotNullQuery('article_published');
		article.orderBy('article_published');
		article.setCategory('homepage');
		article.query();
		if(article.next())
			return article.article_published.getValue();
		return null;
	},

	/**
	* Get view on date which depends on article's retired date if retired and valid_to date
	* @param {String} viewOnDate view article as on date input by user in user format and timezone(can be in future even beyond article valid to date)
	* @param {String} articleNumber article number
	* @param {String} validTo article valid to date in utc format and timezone
	* @param {String} workflow workflow state of article
	* @return {GlideDateTime} View On date as GlideDateTime object
	*/
	_getViewOnDate: function(viewOnDate, articleNumber,validTo, workflow){
		if(workflow=='retired'){
			var retireDate = new KBViewModel().getArticleValidDate(articleNumber);
			if(new GlideDateTime(retireDate).before(new GlideDateTime(validTo)))
				validTo = retireDate;
		}
		var viewOnDateGdt = new GlideDateTime() ;
		viewOnDateGdt.setDisplayValue(viewOnDate,gs.getDateTimeFormat());
		var arValidToDateGdt = new GlideDateTime(validTo);
		if(arValidToDateGdt.isValid() && viewOnDateGdt.after(arValidToDateGdt))
			return arValidToDateGdt;
		else
			return viewOnDateGdt;
	},
	
	/**
 	* Get version record with the article number and view On Date
 	* @param {String} viewOnDate
	* @param {String} articleNumber
	* @param {String} validTo
	* @param {String} workflow
 	**/
	_getRecordOnDate: function(viewOnDate,articleNumber,validTo, workflow){
		articleNumber = this.getCorrectlyPaddedNumber(articleNumber);
		//Initializing blocksObj with dummy value, because when call happens to substituteBlock, the argument blocksArray will be empty while previewing draft without date, and it will contain this dummy element when article being previewed on a date doesn't have blocks.
		var blocksObj = [-1];
		var gdt = this._getViewOnDate(viewOnDate, articleNumber,validTo, workflow);
		var firstPublishedDateWithBlocks = this._getFirstPublishedDateWithBlocks(articleNumber);
		var firstPublishedDateWithBlocksgdt = new GlideDateTime(firstPublishedDateWithBlocks);
		var result = {};
		if(gdt.onOrAfter(firstPublishedDateWithBlocksgdt)){
			result =this.getBlocksOnDate(gdt,articleNumber);
			if(!gs.nil(result.article)){
				return result;
			}
		}
		//If input date is before the published date of the first version which has blocks, or if there are no valid blocks on the article on a input date, then get the correct version to be previewed from kb_version table.
		var knowledgegr = new GlideRecord(this.KB_VERSION);
		knowledgegr.addQuery('knowledge.number',articleNumber);
		knowledgegr.addActiveQuery();
		knowledgegr.addNotNullQuery('knowledge.published');
		knowledgegr.addQuery('sys_created_on','<=',gdt);
		knowledgegr.orderByDesc('sys_created_on');
		knowledgegr.setCategory('homepage');
		knowledgegr.query();
		var article;
		while(knowledgegr.next()){
			if(this.isMajorVersion(knowledgegr.version)){
				article = knowledgegr;
				break;
			}
		}
		result = {"article":article.knowledge.getRefRecord(),"blocks":blocksObj};
		return result;
	},

	/**
 	* Get blocks of an article on a particular Date
 	*
 	* @param article number
	* @param viewOnDate GlideDateTime
 	**/
	getBlocksOnDate: function(viewOnDate,articleNumber){
		var result={};
		var blocksObj =[];
		var grHistoryMapping = new GlideRecord('m2m_kb_to_block_history');
		grHistoryMapping.addQuery('knowledge.number',articleNumber);
		grHistoryMapping.addNotNullQuery('article_published');
		grHistoryMapping.addQuery('article_published','<=',viewOnDate);
		grHistoryMapping.addQuery('knowledge.active','true');
		grHistoryMapping.addQuery('block_published','<=',viewOnDate);
		//Fetching the article version which is yet not outdated or outdated after the date for which user wants to see the article
		var isOutdated = grHistoryMapping.addNullQuery('article_outdated');
		isOutdated.addOrCondition('article_outdated','>',viewOnDate);
		//Fetching the block version which is yet not outdated or outdated after the date for which user wants to see the article
		var isBlockOutDated = grHistoryMapping.addNullQuery('block_outdated');
		isBlockOutDated.addOrCondition('block_outdated','>',viewOnDate);
		//Fetching the block version which is yet not retired or retired after the date for which user wants to see the article
		var isBlockRetired = grHistoryMapping.addNullQuery('block_retired');
		isBlockRetired.addOrCondition('block_retired','>',viewOnDate);
		//Fetching the block version which is still valid
		grHistoryMapping.addQuery('knowledge_block.valid_to','>=',viewOnDate.toString().substring(0,10));
		grHistoryMapping.addQuery('article_state','published');
		grHistoryMapping.setCategory('homepage');
		grHistoryMapping.query();
		if(grHistoryMapping.next()){
			var article  = grHistoryMapping;
			blocksObj.push(grHistoryMapping.knowledge_block.sys_id);
			while(grHistoryMapping.next())
				blocksObj.push(grHistoryMapping.knowledge_block.sys_id);
			result = {"article":article.knowledge.getRefRecord(),"blocks":blocksObj};
		}
		return result;
	},

	/**
 	* Get version record with the article id and version number
 	*
 	*
 	* @param articleId
	* @param versionNumber
 	**/
	_getVersionRecordFromId: function(articleId,versionNumber){
		var version = new GlideRecord(this.KB_VERSION);
		version.addQuery('knowledge.article_id',articleId);
		version.addQuery('version',versionNumber);
		version.setCategory('homepage');
		version.query();
		while(version.next()){
			if(version.canRead())
				return version;
		}
		return false;
	},


	/**
 	* Performs update operation on GR disabling BRs
 	*
 	*
 	* @param GlideRecord: current
	* @param boolean : disableAutoSys
 	**/
	_performUpdate: function(current,disableAutoSys){
		var runWorkflow = current.isWorkflow();
		if(disableAutoSys)
			current.autoSysFields(false);
		current.setWorkflow(false);
		// Disable business rule to avoid recursive BRs.
		current.update();
		current.setWorkflow(runWorkflow);	
	},

	/**
 	* Checks if the version field is valid
 	*
 	* @Param GlideRecord : current
 	* @return Boolean
 	*/
	_isValidVersion: function(current){
		var version = !current.version.nil()?current.version.version+'':'';
		if(!version)
			return false;
		else
			return true;
	},

	/** Checks if the logged in user is the reviser/author
 	*
 	* @Param GlideRecord current
 	* @return boolean
 	**/
	_isReviser: function(current){
		var reviser = current.revised_by.nil()?current.getValue('author'):current.getValue('revised_by');
		if(gs.getUserID()===reviser)
			return true;
		else
			return false;
	},
	
	/** Checks if the logged in user is the author of the article
 	*
 	* @Param GlideRecord current
 	* @return boolean
 	**/
	_isAuthor: function(current){
		if(current.author && gs.getUserID() === current.getValue('author'))
			return true;
		else
			return false;
	},

	/** Checks if the logged in user is the approver
	*
	* @Param GlideRecord current
	* @return boolean
	**/
	_isApprover: function(current) {
		var approvers = this.getCurrentApprovers(current);
		return approvers && (approvers.indexOf(gs.getUserID()) >= 0);
	},

	/**
 	* Perform checkout with given new version
 	*
 	* @param GlideRecord : Base version from which checkout happens
 	* @return GlideRecord : newly created record
 	**/
	_performCheckout: function(current, ignoreAttachments){
		var oldSysId = current.sys_id+'';
		var currentLatest = this.getLatestVersion(current.article_id);
		this._resetFieldsForCheckout(current,currentLatest);
		var newSysId = current.insert();
		if(newSysId){
			this._markCurrentLatestAsOld(current);
			var newVersion = this._nextMinorVersion(currentLatest.version.version+'');
			current.version = this._newVersionRecord(current,newVersion);
			
			if(gs.nil(ignoreAttachments))
				ignoreAttachments = false;	
			
			if(ignoreAttachments == false){
			var attachIds = GlideSysAttachment.copy(current.sys_class_name, oldSysId, current.sys_class_name, newSysId);
			this._updateAttachmentLinks(attachIds, current);
			}
			
			if(this.isDefaultValidToSet() && parseInt(current.kb_knowledge_base.article_validity) > 0)
				this._setDefaultValidToDate(current);
				
			current.update();
			this._copyTranslatedValues(oldSysId,newSysId);
			this._copyFuncFromSourceToTargetArticle(oldSysId, newSysId, current);
			if (pm.isActive("com.snc.knowledge_blocks")) {
				new KBBlockSNC().removeRetiredBlock(oldSysId, current);
			}
		}
		return current;
	},

	_copyFuncFromSourceToTargetArticle: function(sourceSysId, targetSysId, targetRecord){
		this._copyPinnedKeywords(sourceSysId,targetSysId);
		this._copyAffectedProducts(sourceSysId,targetSysId);
		this._copyTags(sourceSysId,targetRecord);
		this._copyRelatedArticles(sourceSysId,targetRecord);
		this._copyRelatedCatalogItems(sourceSysId,targetRecord);
	},
	
	/**
 	* Update the latest flag to false for old versions
 	*
 	* @param GlideRecord : Latest version that's newly created
 	* 
 	**/
	_markCurrentLatestAsOld: function(newVersion){
		var gr = new GlideRecord(this.KB_KNOWLEDGE);
		gr.addQuery('article_id',newVersion.article_id);
		// We need to cover the case where latest field is empty as well.
		gr.addQuery('latest','!=',false);
		gr.addQuery('sys_id','!=',newVersion.sys_id);
		gr.query();
		while(gr.next()){	
			gr.setWorkflow(false);
			gr.autoSysFields(false);
			gr.latest = false;
			gr.update();
		}
	},


	/**
 	* Get appropriate initial version number according to workflow state
 	*
 	*
 	* @param GlideRecord: current
 	* @return String
 	**/
	_getInitialVersion: function(current){
		if(current.workflow_state=='published' || current.workflow_state=='retired')
			return this.INITIAL_MAJOR_VERSION;
		else if(current.workflow_state=='pending_retirement'){
			var prevState = this._getPreviousWorkflowState(current);
			if(prevState=='published')
				return this.INITIAL_MAJOR_VERSION;
			else
				return this.INITIAL_MINOR_VERSION;
		}
		else
			return this.INITIAL_MINOR_VERSION;
	},

	/**
 	* Copy featured contents of a record for a new record
 	*
 	*
 	* @param String oldSysId
	* @param String newSysId
 	* 
 	**/
	_copyPinnedKeywords: function(oldSysId,newSysId){
		var keywords = new GlideRecord('kb_knowledge_keyword');
		keywords.addQuery('knowledge',oldSysId);
		keywords.query();
		var newKeyword = new GlideRecord('kb_knowledge_keyword');
		while (keywords.next()){
			newKeyword.initialize();
			newKeyword.knowledge = newSysId;
			newKeyword.keywords = keywords.keywords;
			newKeyword.insert();
		}
	},

	_copyAffectedProducts: function(oldSysId,newSysId){
		var products = new GlideRecord('m2m_kb_ci');
		products.addQuery('kb_knowledge',oldSysId);
		products.query();
		while(products.next()){
			var newRel = new GlideRecord('m2m_kb_ci');
			newRel.initialize();
			newRel.kb_knowledge = newSysId;
			newRel.cmdb_ci = products.cmdb_ci;
			newRel.insert();
		}
	},

	_copyTags: function(oldSysId,current){
		var tags = new GlideRecord('label_entry');
		tags.addNotNullQuery('table_key');
		tags.addQuery('table_key',oldSysId);	
		tags.query();
		while(tags.next()){
			var newRel = new GlideRecord('label_entry');
			newRel.initialize();
			newRel.table = current.sys_class_name;
			newRel.table_key = current.sys_id;
			newRel.label = tags.label;
			newRel.read = tags.read;
			newRel.title = current.getDisplayValue("sys_class_name") + " - " + current.getDisplayValue();
			newRel.url = "kb_knowledge.do?sys_id="+current.sys_id;
			newRel.insert();
		}
	},

	/**
 	* Copy translated field values
 	*
 	*
 	* @param String oldSysId
	* @param String newSysId
 	* 
 	**/
	_copyTranslatedValues: function(oldSysId,newSysId){
		var texts = new GlideRecord('sys_translated_text');
		texts.addQuery('tablename','kb_knowledge');
		texts.addQuery('documentkey',oldSysId);
		texts.query();
		var newText = new GlideRecord('sys_translated_text');
		while (texts.next()){
			var translationGr = this._getTranslationEntry(newSysId,texts.language,texts.fieldname);
			if(translationGr){
				translationGr.value = texts.value;
				translationGr.update();
			}
			else
				this._copyTranslationEntry(texts,newSysId);
		}
	},

	_copyTranslationEntry: function(translationGr,newSysId){
		var translation = new GlideRecord('sys_translated_text');
		translation.initialize();
		translation.documentkey = newSysId;
		translation.tablename = translationGr.tablename;
		translation.fieldname = translationGr.fieldname;
		translation.value = translationGr.value;
		translation.language = translationGr.language;
		translation.insert();
	},

	_getTranslationEntry: function(sysId,language,field){
		var translation = new GlideRecord('sys_translated_text');
		translation.addQuery('tablename','kb_knowledge');
		translation.addQuery('documentkey',sysId);
		translation.addQuery('fieldname',field);
		translation.addQuery('language',language);
		translation.query();
		if(translation.next())
			return translation;
		else
			return false;

	},


	/**
 	* Get previous state of an article in pending_retirement workflow
 	*
 	*
 	* @param GlideRecord: current
 	* @return String
 	**/
	_getPreviousWorkflowState:function(current){
		var workflow = new Workflow();
		var state = '';
		var context = workflow.getRunningFlows(current);
		while (context.next()) {
			state = context.scratchpad.initial_workflow_state;
			if(state)
				break;
		}
		return state;
	},

	/**
 	* Check and return if there is another version of the record active
 	* For eg:- workflow_state=draft/review
 	*
 	* @param GlideRecord: current
 	* @return GlideRecord
 	**/
	_getCheckedoutRecord: function(current){
		var gr = new GlideRecord(this.KB_KNOWLEDGE);
		gr.addQuery('article_id',current.article_id);
		gr.addQuery('sys_id','!=',current.sys_id+'');
		gr.addQuery('workflow_state','NOT IN',this.WORKFLOW_COMPLETED_STATES.join(','));
		gr.setLimit(1);
		gr.query();
		if(gr.next())
			return gr;
		else
			return false;
	},

	_createNewSummaryRecord: function(current){
		var summary = new GlideRecord('kb_knowledge_summary');
		summary.initialize();
		summary.number = current.number;
		return summary.insert();
	},


	/**
 	* Create a new version record in the version table
 	*
 	* @param GlideRecord: current
	* @param String version
	* @param boolean initial
 	**/
	_newVersionRecord: function(current,version,initial){
		var newVersion = new GlideRecord(this.KB_VERSION);
		if(initial){
			// When initializing non-versioned articles, pull revision information from the record itself
			newVersion.modified_by = this._getLastUpdatedUser(current);
			newVersion.modified_on = current.sys_updated_on;
		}
		else {
			newVersion.modified_by = gs.getUserID();
			newVersion.modified_on = new GlideDateTime();
		}
		newVersion.knowledge = current.sys_id+'';
		newVersion.version = version;
		newVersion.snapshot = current.getValue('sys_mod_count');
		return newVersion.insert();
	},



	/**
 	* Resets some of the fields for a checked out record
 	*
 	* @param GlideRecord: current
 	*
 	**/
	_resetFieldsForCheckout: function(current,currentLatest){
		current.version = '';
		current.base_version = current.sys_id+'';
		current.revised_by = gs.getUserID();
		current.number = current.number;
		current.latest = true;
		current.workflow_state = this.INITIAL_STATE;
		current.flagged = false;
		// Denormalized feedback values needs to come from latest version
		current.sys_view_count = currentLatest.sys_view_count;
		current.use_count = currentLatest.use_count;
		current.helpful_count = currentLatest.helpful_count;
		current.rating = currentLatest.rating;
		current.latest_aqi = '';
		current.published = '';
		current.confidence = this.INITIAL_CONFIDENCE;
	},


	/**
 	* Get user who last updated the record 
 	*
 	* @param GlideRecord: current
 	* @return String user
 	**/
	_getLastUpdatedUser: function(current){
		var userName = current.sys_updated_by+'';
		var user = new GlideRecord('sys_user');
		if(user.get('user_name',userName))
			return user.sys_id;
		else
			return '';
	},

	/**
 	* Find out the very next minor version from the existing versions
 	*
 	* @param GlideRecord: current
 	* @return String newVersion
 	*
 	**/
	_getNextMinorVersionOfArticle: function(articleId){
		var currentLatest = this.getLatestVersion(articleId);
		if(!currentLatest.version.nil()){
			return this._nextMinorVersion(currentLatest.version.version+'');
		}
		else
			return false;
	},


	/**
 	* Get next major version from the given version
 	*
 	* @param String: version
 	* @return String
 	**/
	_nextMajorVersion: function(currentVersion){
		var versionObj = this._getVersionObject(currentVersion);
		versionObj.major_version = versionObj.major_version+1;
		versionObj.minor_version = 0;
		return this._versionToString(versionObj);
	},

	/**
 	* Get next minor version from the given version
 	*
 	* @param String: version
 	* @return String
 	**/
	_nextMinorVersion: function(currentVersion){
		var versionObj = this._getVersionObject(currentVersion);
		versionObj.minor_version = versionObj.minor_version+1;
		return this._versionToString(versionObj);
	},


	/**
 	* Convert version string into an object
 	*
 	* @param String: version
 	* @return Object : versionObj
 	**/
	_getVersionObject: function(version){
		var versionObj = {
			minor_version : 0,
			major_version : 0
		};
		var numbers = version.split('.');
		if(numbers[0])
			versionObj.major_version = parseInt(numbers[0],10);
		if(numbers[1])
			versionObj.minor_version = parseInt(numbers[1],10);
		return versionObj;
	},

	isMajorVersion: function(version){
		var versionObj = this._getVersionObject(version);
		return (versionObj.minor_version == 0? true: false);
	},

	/**
 	* Converts the version object to string
 	*
 	* @param Object: versionObj
 	* @return String : eg:- '1.0'
 	**/
	_versionToString: function(versionObj){
		var minorString = versionObj.minor_version.toString();
		if(versionObj.minor_version>0 && versionObj.minor_version<10){
			minorString = "0"+minorString;
		}
		return versionObj.major_version+'.'+minorString;
	},


	_updateDisplayValueField : function(tableName, fieldName, display) {
		var elementGr = new GlideRecord('sys_dictionary');
		elementGr.addQuery('name', tableName);
		elementGr.addQuery('element', fieldName);
		elementGr.query();
		if (elementGr.next()) {
			elementGr.display = display;
			elementGr.update();
		}
	},

	/**
	 * Attachment Links in checked out article will still point to attachments
	 * of the old version instead of copied attachments of the checked out version.
	 * This function takes care of replacing sys_ids in article with new attachment
	 * sys_ids.
	 */
	_updateAttachmentLinks: function(OldNewAttachIds, articleRecord) {
		if(OldNewAttachIds && articleRecord) {
			OldNewAttachIds = OldNewAttachIds.toArray();
			if(OldNewAttachIds && OldNewAttachIds.length > 0) {
				var fields = this.getArticleFields(articleRecord);
				for (var i = 0; i < fields.length; i++) {
					var fieldName = fields[i];
					if(!gs.nil(fieldName)) {
						var fieldUpdated = false;
						var fieldValue = articleRecord.getValue(fieldName);
						if(fieldValue)
							fieldValue = fieldValue.toString();
						for (var j = 0; j < OldNewAttachIds.length; j++) {
							if(!gs.nil(OldNewAttachIds[j])) {
								var oldNew = OldNewAttachIds[j].split(',');
								if(oldNew && !gs.nil(oldNew[0]) && !gs.nil(oldNew[1]) && 
								   fieldValue && fieldValue.indexOf(oldNew[0]) > -1 ) {
									fieldValue = fieldValue.replaceAll(oldNew[0],oldNew[1]);
									fieldUpdated = true;
								}
							}
						}
						if(fieldUpdated) {
							articleRecord.setValue(fieldName, fieldValue);
						}
					}
				}
			}
		}
	},

	/**
	 * Returns fields of an article that makes up the article content.
	 */
	getArticleFields: function(articleRecord) {
		var fields = [];
		if(articleRecord) {
			//Fetch HTML fields of this article.
			var atd = new GlideRecord('sys_dictionary');
			atd.addQuery('name', 'IN', SNC.TableEditor.getTableAncestors(articleRecord.sys_class_name));
			atd.addQuery('internal_type', 'IN', 'translated_html,html,wiki_text,user_image');
			atd.orderBy('element');
			atd.query();
			while(atd.next()) {
				fields.push(atd.element + '');
			}
		}
		return fields;
	},

	/**
	* returns Article fields required for Translation of selected source.
	*/
	getArticleFieldsForTranslation: function(articleRecord) {
		var fields = [];
		if(articleRecord) {
			var articleFields = new GlideRecord('sys_dictionary');
			articleFields.addQuery('name', SNC.TableEditor.getTableAncestors(articleRecord.sys_class_name));
			articleFields.addQuery('internal_type', 'IN', 'html,translated_html,string,translated_text,markdown');
			articleFields.addEncodedQuery('choiceISEMPTY^ORchoice=0');
			var ignoredFields = 'article_id,language,topic,number,meta_description,display_number,sys_created_by,sys_updated_by';
			if(new KBViewModel().isArticleTemplate(articleRecord.sys_class_name)){
				ignoredFields += ',text';
			}
			articleFields.addQuery('element','NOT IN',ignoredFields);
			articleFields.orderBy('element');
			articleFields.query();
			var isMarkdownArticle = articleRecord.article_type == 'markdown';
			while(articleFields.next()) {
				var internalType = articleFields.internal_type + '';
				if(internalType == 'markdown' && !isMarkdownArticle)
					continue;
				if((internalType == 'html' || internalType == 'translated_html') && isMarkdownArticle)
					continue;
				fields.push(articleFields.element + '');
			}
		}
		return fields;
	},
	
	/**
	* Create or checkout an article for given language
	**/
	createOrCheckout: function(source_article, translated_language, translationObj, fromTask, fromLFAPI) {
		var newRecord = false;
		var translation = new KBTranslationTask().getTranslatedArticleForLanguage(source_article.article_id, source_article.sys_class_name, translated_language);
		if(!translation.isValidRecord() || translation.workflow_state == 'retired'){
			newRecord = this.createTranslation(source_article, translated_language, translationObj, fromLFAPI);
		}else if(translation.workflow_state == this.MAJOR_STATE){
			newRecord = this.checkout(translation);
			if(!newRecord){
				var msg = gs.getMessage('Insufficient permissions to create or edit an article. Please contact knowledge admin or manager. Task assignee does not have access to checkout translation.');
				if (fromLFAPI)
					return this._getStatusObject(this.FAILED, msg);
				else
					gs.addErrorMessage(msg);
			}else{
				this.updateTranslationRecord(newRecord,translationObj);
				newRecord.update();
				}
				}else{
			if (fromTask || fromLFAPI) {
				var requestMode = 'pf';
				if (fromTask)
					requestMode = gs.action.getGlideURI().toString().indexOf('api/now') == -1 ? 'pf' : 'ws';
				var errMsg = '';
				if (requestMode == 'pf') {
					var messageArgs = [];
					messageArgs.push(gs.getUser().getUserByID(translation.sys_created_by).getName());
					messageArgs.push(translation.sys_class_name+'.do?sys_id='+translation.sys_id);
					errMsg = gs.getMessage("<a href='{1}'>This article</a> is checked out by '{0}'. Please wait for it to be published.", messageArgs);
					if (fromLFAPI) 
						return this._getStatusObject(this.FAILED, errMsg);
					else
						gs.addErrorMessage(errMsg);
				}
			}else{
				this.updateTranslationRecord(translation,translationObj);
				translation.update();
				newRecord =	translation;
			}
				}
		if (fromLFAPI) 
			return this._getStatusObject(this.SUCCESS, '');

		return newRecord;

	},
	/*
	* For LF Translation, error message needs to be returned.
	*/
	_getStatusObject: function(status, errMessage) {
		return {
			status: status,
			errorMessage: errMessage
		};
	},

	/**
	* Creates or Checkouts an article from Translation Task.
	* @param GlideRecord: Translation Task record.
	*/
	createOrCheckOutFromTask: function(translationTaskRecord, translationObj){
		var translatedArticle;
		var source_article = translationTaskRecord.source_article.getRefRecord();
		if (translationTaskRecord.state == this.TRANSLATION_TASK_NEW) {
			translatedArticle = this.createOrCheckout(source_article, translationTaskRecord.translated_language, translationObj, true);
			if (translatedArticle.isValidRecord()) {
				translationTaskRecord.translated_article = translatedArticle.sys_id;
				translationTaskRecord.state = this.TRANSLAITON_TASK_IN_PROGRESS;
				translationTaskRecord.update();
			}
			return translatedArticle;
		}  
		
		if (translationTaskRecord.state == this.TRANSLAITON_TASK_IN_PROGRESS) {
			translatedArticle = translationTaskRecord.translated_article.getRefRecord();
			if (translatedArticle.isValidRecord()) {
				this.updateTranslationRecord(translatedArticle, translationObj);
				translatedArticle.update();
			} else {
				translatedArticle = this.createOrCheckout(source_article, translationTaskRecord.translated_language, translationObj, true);
				if (translatedArticle.isValidRecord()) {
					translationTaskRecord.translated_article = translatedArticle.sys_id;
				translationTaskRecord.update();
				}
			}
			return translatedArticle;
		}
	},
	
	/**
	* Creates a new translated article for given language in Task.
	* @param GlideRecord: Translation task
	*/
	createTranslation: function(source_article,translated_language,translationObj, fromLFAPI){
		var sourceSysId = source_article.sys_id+'';
		var translation = source_article;
		this.updateTranslationRecord(translation, translationObj);
		this._resetFieldsForTranslation(translation, fromLFAPI);
		translation.language = translated_language;
		translation.parent = source_article.article_id;
		translation.office_doc_url = '';
		translation.article_id='';
		var translationSysId = translation.insert();
		this._copyFuncFromSourceToTargetArticle(sourceSysId, translationSysId, translation);

		var attachIds = GlideSysAttachment.copy(source_article.sys_class_name, sourceSysId, translation.sys_class_name, translationSysId);
		this._updateAttachmentLinks(attachIds, translation);
		return translation;
	},
	
	/**
	* resets the fields listed in the property while creating translation
	*/
	_resetFieldsForTranslation: function(translationRecord, fromLFAPI) {
		var skipFields = gs.getProperty('glide.knowman.translation.skip_fields','');
		if (skipFields != '') {
			var skipFieldArray = skipFields.split(',');
			for (var i = 0; i<skipFieldArray.length; i++) {
				var field = skipFieldArray[i].toString();
				if (translationRecord.isValidField(field)) {
					translationRecord[field] = '';
				}
			}
		}
		translationRecord.published = '';
		translationRecord.use_count = 0;
		translationRecord.sys_view_count = 0;
		translationRecord.helpful_count = 0;
		var nm = new NumberManager(translationRecord.sys_class_name);
		translationRecord.number = nm.getNextObjNumberPadded();
		//When the translation from LF, the translation article's author is same as Orignal article's author
		if(!fromLFAPI)
			translationRecord.author = gs.getUserID();
	},
	
	/**
	* updates translation record with new field values from translation object
	*/
	updateTranslationRecord: function(translationRecord, translationObj){
		var htmlFieldArray = translationObj['htmlFieldArray'];
		for(var i = 0;i < htmlFieldArray.length;i++){
			var htmlFieldObj = htmlFieldArray[i];
			translationRecord[htmlFieldArray[i].name] = htmlFieldArray[i].value;
		}
		var stringFieldArray = translationObj['stringFieldArray'];
		for(i = 0;i < stringFieldArray.length;i++){
			translationRecord[stringFieldArray[i].name] = stringFieldArray[i].value;
		}
	},
	
	/**
 	* Copy Related Articles to new version
 	*
 	*
 	* @param String oldSysId
	* @param String newSysId
 	* 
 	**/
	_copyRelatedArticles: function(oldSysId,current){
		var gr = new GlideRecord('kb_2_kb');
		gr.addQuery('active', 'true');
		gr.addQuery('kb_knowledge', oldSysId);
		gr.query();
		while (gr.next()){
			var newgr = new GlideRecord('kb_2_kb');
			newgr.initialize();
			newgr.setValue('kb_knowledge',current.getUniqueValue());
			newgr.setValue('related_kb_knowledge',gr.related_kb_knowledge);
			newgr.setValue('active','true');
			newgr.setValue('order',gr.order);
			newgr.insert();
		}
	},
	
	/**
 	* Copy Related Catalog Items to new version
 	*
 	*
 	* @param String oldSysId
	* @param String newSysId
 	* 
 	**/
	_copyRelatedCatalogItems: function(oldSysId,current){
		var gr = new GlideRecord('kb_2_sc');
		gr.addQuery('active', 'true');
		gr.addQuery('kb_knowledge', oldSysId);
		gr.query();
		while (gr.next()){
			var newgr = new GlideRecord('kb_2_sc');
			newgr.initialize();
			newgr.setValue('kb_knowledge',current.getUniqueValue());
			newgr.setValue('sc_cat_item',gr.sc_cat_item);
			newgr.setValue('active','true');
			newgr.setValue('order',gr.order);
			newgr.insert();
		}	
	},
	
	_setDefaultValidToDate: function(current) {
		var date = new GlideDate();
		date.setValue(current.sys_created_on);
		current.valid_to = this.getDefaultValidToDateFromDate(current.kb_knowledge_base, date);
	},

	//check if Article is in Published version
    isPublished: function(sys_kb_id){
		var articleGr = new GlideRecord('kb_knowledge');
		articleGr.addQuery('sys_id',sys_kb_id);
		articleGr.addQuery('workflow_state','published');
		articleGr.addNotNullQuery('published');
		articleGr.query();
		if(articleGr.next())
			return true;
		return false;
	},

	type: 'KBVersioningSNC'
});
