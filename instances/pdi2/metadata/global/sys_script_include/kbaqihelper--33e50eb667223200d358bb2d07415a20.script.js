var KBAQIHelper = Class.create();
KBAQIHelper.prototype = {

		//tables
		KB_ARTICLE_CHECKLIST_SUMMARY : "kb_article_checklist_summary",
		KNOWLEDGE_BASE : "kb_knowledge_base",
		KB_KNOWLEDGE : "kb_knowledge",
		KB_CHECKLIST_QUESTION : "kb_checklist_question",
		KB_ARTICLE_CHECKLIST_ANSWER : "kb_article_checklist_answer",
		SYS_USER : "sys_user",
	
		//fields
		SYS_ID : "sys_id",
		DRAFT : "draft",
		IN_PROGRESS : "in_progress",
		PUBLISHED : "published",
		OUTDATED : "outdated",
		SUBMITTED : "submitted",
		ARTICLE : "article",
		CHECKLIST : "checklist",
		QUESTION : "question",
		SUM : "sum",
		WEIGHT : "weight",
		WEIGHTED_SCORE : "weighted_score",
		CHECKLIST_SUMMARY : "checklist_summary",
		AQI_SCORE : "aqi_score",
		LATEST_AQI : "latest_aqi",
		WORKFLOW_STATE : "workflow_state",
		STATE : "state",
		REVIEWER : "reviewer",
		OWNERSHIP_GROUP : "ownership_group",
		AUTHOR : "author",
		SYS_CREATED_ON : "sys_created_on",
		SYS_UPDATED_ON : "sys_updated_on",
		NUMBER : "number",
		DISPLAY_NUMBER : "display_number",
		FIRST_NAME : "first_name",
		NAME : "name",
		REVISED_BY : "revised_by",
		SHORT_DESCRIPTION : "short_description",
		COMMENTS_FOR_AUTHOR_REVISER : "comments_for_author_reviser",
		OWNER : "owner",
		KB_MANAGERS : "kb_managers",
		EMAIL : "email",
		CONTAINS : "CONTAINS",
	
		//User Roles
		KNOWLEDGE_ADMIN: "knowledge_admin",
		KNOWLEDGE_DOMAIN_EXPERT : "knowledge_domain_expert",
		KNOWLEDGE_COACH : "knowledge_coach",
		
		//Notification Event
		NOTIFY_EVENT : "km.notify_about_article_aqied",
	
		//Sys Properties
		PASS_FAIL_SCORE: "glide.knowman.aqi_pass_score",
		ARTICLE_WORKFLOW_STATES: "glide.knowman.aqi.article_workflow_states",
	
		//Properties Value
		ARTICLE_WORKFLOW_STATES_DEFAULT_VALUE : "draft,review,published",
	
		//Par Score
		DEFAULT_PAR_SCORE : "70",
	
	initialize: function() {
		this._knowledgeHelper = new SNC.KnowledgeHelper();
	},
	
	hasAqiRoles: function() {
		if(gs.hasRole(this.KNOWLEDGE_DOMAIN_EXPERT) || gs.hasRole(this.KNOWLEDGE_COACH) || gs.hasRole(this.KNOWLEDGE_ADMIN))
			return true;
		else
			return false;
	},
	
	isAuthorOrReviser: function(current) {
		var user = gs.getUserID();
		return (user == current.author) || (user == current.revised_by);
	},
	
	isManagerOfKb: function(current) {
		var user = gs.getUserID();
		var kbGr = new GlideRecord(this.KNOWLEDGE_BASE);
		kbGr.addQuery(this.SYS_ID,current.kb_knowledge_base);
		var qc = kbGr.addQuery(this.OWNER, this.CONTAINS, user);
		qc.addOrCondition(this.KB_MANAGERS, this.CONTAINS, user);
		kbGr.query();
		return kbGr.hasNext();
	},
	
	canViewAqiFields: function(current){
		if(this.hasAqiRoles())
			return true;
		if(this.isAuthorOrReviser(current))
			return true;
		if(this.isManagerOfKb(current))
			return true;
		return false;
	},
	
	canPerformAqi: function(current) {
		//Do no Support AQI for External Articles.
		if(new KBCommon().isExternalArticle(current))
			return false;
		if(current.kb_knowledge_base.checklist == '')
			return false;
		if(!new KBKnowledge().canRead(current))
			return false;
		if(!this.hasAqiRoles())
			return false;
		
		var workflow_states = gs.getProperty(this.ARTICLE_WORKFLOW_STATES,this.ARTICLE_WORKFLOW_STATES_DEFAULT_VALUE);
		if(!gs.nil(workflow_states)) {
			if(workflow_states.indexOf(current.getValue(this.WORKFLOW_STATE)) == -1)
				return false;
		}
		
		return true;
	},
	
	canSubmitAqi: function(current){
		if(!gs.hasRole(this.KNOWLEDGE_ADMIN) && current.reviewer != gs.getUserID())
			return false;
		
		if(current.state == this.SUBMITTED)
			return false;
		
		return true;
	},
	
	
	submitAqi: function(sys_id,comments){
		var summary_gr = new GlideRecord(this.KB_ARTICLE_CHECKLIST_SUMMARY);
		if(summary_gr.get(sys_id)){
			summary_gr.reviewer = gs.getUserID();
			summary_gr.state = this.SUBMITTED;
			summary_gr.comments_for_author_reviser = comments;
			summary_gr.update();
		}
	},
	
	discardAqi: function(current) {
		var summary_gr = this.getLatestAqiOnArticle(current.sys_id,current.kb_knowledge_base.checklist);
		if(summary_gr.next())
			summary_gr.deleteRecord();
	},
	
	_notifyAuthorOrReviser: function(current){
		var knowledge_article = new GlideRecord(this.KB_KNOWLEDGE);
		var knowledge_obj = {};
		var author_gr,reviser,reviser_gr;
		if(knowledge_article.get(current.article)){
			author_gr = this._getUser(knowledge_article.getValue(this.AUTHOR));
			if(author_gr.getValue('active')){
				knowledge_obj.cc_email = author_gr.getValue(this.EMAIL);
				knowledge_obj.cc_dv = author_gr.getDisplayValue();
			}
			
			reviser = '';
			if(knowledge_article.getValue(this.REVISED_BY)){
				reviser_gr = (this._getUser(knowledge_article.getValue(this.REVISED_BY)));
				reviser = reviser_gr.getValue(this.NAME);
			}
			
			knowledge_obj.sys_id = knowledge_article.getValue(this.SYS_ID);
			knowledge_obj.number = knowledge_article.getValue(this.NUMBER);
			knowledge_obj.display_number = knowledge_article.getValue(this.DISPLAY_NUMBER);
			knowledge_obj.version = knowledge_article.version.version+'';
			knowledge_obj.short_desc = knowledge_article.getValue(this.SHORT_DESCRIPTION);
			knowledge_obj.article_created_on = knowledge_article.getValue(this.SYS_CREATED_ON);
			knowledge_obj.article_last_updated = knowledge_article.getValue(this.SYS_UPDATED_ON);
			
			knowledge_obj.author = author_gr.getValue(this.NAME);
			knowledge_obj.reviser = reviser;
			if(knowledge_article.ownership_group)
				knowledge_obj.ownership_group = knowledge_article.getDisplayValue(this.OWNERSHIP_GROUP);
		}
		knowledge_obj.review_completed_on = new GlideDateTime(current.getValue(this.SYS_UPDATED_ON)).getDate().toString();
		knowledge_obj.reviewer = this._getUser(current.getValue(this.REVIEWER)).getValue(this.NAME);
				
		knowledge_obj.aqi_score = current.getValue(this.AQI_SCORE);
		knowledge_obj.comments = current.getValue(this.COMMENTS_FOR_AUTHOR_REVISER) || gs.getMessage("No Comments");
		var receiver;
		if(reviser_gr){
			knowledge_obj.receiver_full_name = reviser_gr.getValue(this.NAME);
			knowledge_obj.receiver_first_name = reviser_gr.getValue(this.FIRST_NAME);
			receiver = knowledge_article.getValue(this.REVISED_BY);
			if(reviser_gr.sys_id == author_gr.sys_id){
				knowledge_obj.cc_email = '';
				knowledge_obj.cc_dv = '';
			}
		}
		else {
			knowledge_obj.receiver_full_name = author_gr.getValue(this.NAME);
			knowledge_obj.receiver_first_name = author_gr.getValue(this.FIRST_NAME);
			receiver = knowledge_article.getValue(this.AUTHOR);
			knowledge_obj.cc_email = '';
			knowledge_obj.cc_dv = '';
		}
		
		var par_score = gs.getProperty(this.PASS_FAIL_SCORE,this.DEFAULT_PAR_SCORE);
		if(parseInt(knowledge_obj.aqi_score) >= parseInt(par_score))
			knowledge_obj.status = gs.getMessage("Passed");
		else
			knowledge_obj.status = gs.getMessage("Failed");
		
		gs.eventQueue(this.NOTIFY_EVENT,current,receiver,new JSON().encode(knowledge_obj));
	},
	
	createQuestionInstances: function(knowledge_gr) {
		var checklist_summary_id;
		var summary_gr = new GlideRecord(this.KB_ARTICLE_CHECKLIST_SUMMARY);
		summary_gr.initialize();
		summary_gr.article = knowledge_gr.sys_id;
		summary_gr.reviewer = gs.getUserID();
		summary_gr.checklist = knowledge_gr.kb_knowledge_base.checklist;
		summary_gr.version_author = knowledge_gr.author;
		if(knowledge_gr.revised_by)
			summary_gr.version_author = knowledge_gr.revised_by;
		summary_gr.state = this.IN_PROGRESS;
		checklist_summary_id = summary_gr.insert();
		var checklist_items = new GlideRecord(this.KB_CHECKLIST_QUESTION);
		checklist_items.addQuery(this.CHECKLIST,knowledge_gr.kb_knowledge_base.checklist);
		checklist_items.query();
		while(checklist_items.next()) {
			var question_instance = new GlideRecord(this.KB_ARTICLE_CHECKLIST_ANSWER);
			question_instance.initialize();
			question_instance.question = checklist_items.sys_id;
			question_instance.checklist_summary = checklist_summary_id;
			question_instance.insert();
		}
		return checklist_summary_id;
	},

	
	isChecklistAttached: function(checklist) {
		var kb_gr = new GlideRecord(this.KNOWLEDGE_BASE);
		kb_gr.addQuery(this.CHECKLIST,checklist);
		kb_gr.query();
		if(kb_gr.getRowCount() == 0)
			return false;
		else
			return true;
	},
	
	isAqiPendingInChecklist: function(checklist) {
		var summary_gr = new GlideRecord(this.KB_ARTICLE_CHECKLIST_SUMMARY);
		summary_gr.addQuery(this.CHECKLIST,checklist);
		summary_gr.addQuery(this.STATE,'!=',this.SUBMITTED);
		summary_gr.query();
		if(summary_gr.getRowCount() == 0)
			return false;
		else
			return true;
	},
	
	isAQIPendingOnQuestion: function(question_id){
		var checklist_mapping_gr = new GlideRecord(this.KB_CHECKLIST_QUESTION);
		checklist_mapping_gr.addQuery(this.SYS_ID,question_id);
		var grcheckSummary = checklist_mapping_gr.addJoinQuery(this.KB_ARTICLE_CHECKLIST_SUMMARY,this.CHECKLIST,this.CHECKLIST);
		grcheckSummary.addCondition(this.STATE,"!=",this.SUBMITTED);
		checklist_mapping_gr.query();
		if(checklist_mapping_gr.getRowCount() == 0)
			return false;
		else
			return true;
	},
	
	isAqiPendingInKb: function(knowledge_base,checklist) {
		var summary_gr = new GlideRecord(this.KB_ARTICLE_CHECKLIST_SUMMARY);
		var grKB = summary_gr.addJoinQuery(this.KB_KNOWLEDGE,this.ARTICLE,this.SYS_ID);
		summary_gr.addQuery(this.CHECKLIST,checklist);
		summary_gr.addQuery(this.STATE, '!=',this.SUBMITTED);
		grKB.addCondition(this.KNOWLEDGE_BASE,knowledge_base);
		summary_gr.query();
		if(summary_gr.getRowCount() == 0)
			return false;
		else
			return true;
	},
	
	isAqiPendingOnArticle: function(sys_id,checklist_id) {
		var summary_gr = this.getLatestAqiOnArticle(sys_id,checklist_id);
		if(summary_gr.getRowCount() == 0)
			return false;
		else
			return true;
	},
	
	isAqiPendingOnOutdatedArticle: function(current) {
		if(!this.hasAqiRoles())
			return false;
		
		if(current.workflow_state != this.OUTDATED)
			return false;
		
		return this.isAqiPendingOnArticle(current.sys_id,current.kb_knowledge_base.checklist);
	},
	
	_setLatestAqiInArticle: function(current) {
		var knowledge_article = new GlideRecord(this.KB_KNOWLEDGE);
		knowledge_article.addQuery(this.SYS_ID,current.article);
		knowledge_article.query();
		if(knowledge_article.next()){
			knowledge_article.setValue(this.LATEST_AQI,current.sys_id);
			knowledge_article.update();
		}
	},
	
	_getUser: function(sys_id){
		var user = new GlideRecord(this.SYS_USER);
		if(user.get(sys_id)){
			return user;
		}
		else
			return '';
	},
	
	getTotalWeight: function(checklist,exclude_sys_id) {
		var totalWeight = 0;
		var qc_gr = new GlideAggregate(this.KB_CHECKLIST_QUESTION);
		qc_gr.addQuery(this.CHECKLIST,checklist);
		if(exclude_sys_id)
			qc_gr.addQuery(this.SYS_ID,'!=',exclude_sys_id);
		qc_gr.addAggregate(this.SUM,this.WEIGHT);
		qc_gr.setGroup(false);
		qc_gr.query();
		if(qc_gr.next()){
			if(qc_gr.getAggregate(this.SUM,this.WEIGHT)){
				totalWeight = parseInt(qc_gr.getAggregate(this.SUM,this.WEIGHT));
			}
		}
		return totalWeight;
	},
	
	setAqiInChecklistSummary: function(current) {
		var checklist_answers = new GlideAggregate(this.KB_ARTICLE_CHECKLIST_ANSWER);
		checklist_answers.addQuery(this.CHECKLIST_SUMMARY,current.sys_id);
		checklist_answers.addAggregate(this.SUM,this.WEIGHTED_SCORE);
		checklist_answers.setGroup(false);
		checklist_answers.query();
		var total = 0;
		if(checklist_answers.next()){
			if(checklist_answers.getAggregate(this.SUM,this.WEIGHTED_SCORE))
				total = parseInt(checklist_answers.getAggregate(this.SUM,this.WEIGHTED_SCORE));
		}
		current.setValue(this.AQI_SCORE,total);
		current.update();
		this._setLatestAqiInArticle(current);
		this._notifyAuthorOrReviser(current);
	},
	
	getLatestAqiOnArticle: function(sys_id,checklist_id) {
		var summary_gr = new GlideRecord(this.KB_ARTICLE_CHECKLIST_SUMMARY);
		summary_gr.addQuery(this.ARTICLE,sys_id);
		summary_gr.addQuery(this.CHECKLIST,checklist_id);
		summary_gr.addQuery(this.REVIEWER,gs.getUserID());
		summary_gr.addQuery(this.STATE,'!=',this.SUBMITTED);
		summary_gr.query();	
		return summary_gr;
	},
	
		
		type: 'KBAQIHelper'
	};
