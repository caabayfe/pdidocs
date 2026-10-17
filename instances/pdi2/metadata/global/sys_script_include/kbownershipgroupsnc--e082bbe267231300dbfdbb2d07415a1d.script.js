var KBOwnershipGroupSNC = Class.create();
KBOwnershipGroupSNC.prototype = Object.extendsObject(KBCommon, {

	SYS_USER : "sys_user",
	SYS_USER_GRMEMBER : "sys_user_grmember",
	OWNERSHIP_GROUP : "ownership_group",

	initialize: function() {
		this._knowledgeHelper = new SNC.KnowledgeHelper();
	},

	/**
 	* Check whether the ownership group is present in the knowledge record or not
 	*
 	* @param GlideRecord: current
 	**/
	isOwnershipGroupPresent: function(current){
		return this.isValidFieldWithValue(current,this.OWNERSHIP_GROUP);
	},

	/**
 	* Check whether the the current user is OwnershipGroup manager or not
 	*
 	* @param GlideRecord: current
 	**/
	isOwnershipGroupManager: function(current, userId){
		return current.ownership_group.manager == userId;
	},

	/**
 	* Get the members of the current article ownership group associated to the article
 	*
 	* @param GlideRecord: current
 	**/
	getOwnershipGroupMembers: function(current){
		var users = [];
		if(this.isOwnershipGroupPresent(current)) {
			var gr = new GlideRecord(this.SYS_USER_GRMEMBER);
			gr.addQuery('group',current.ownership_group);
			gr.query();
			while(gr.next()){
				users.push(gr.getValue("user"));
			}
			if(current.ownership_group.manager && users.indexOf(current.ownership_group.manager+'') == -1) {
				users.push(current.ownership_group.manager+'');
			}
		}
		return users;
	},

	/**
 	* Check if OwnershipGroup is present and the logged in user is part of it
 	*
 	* @param GlideRecord: current
 	**/
	isMemberOfValidOwnershipGroup: function(current){

		if(this.isOwnershipGroupPresent(current)) {
			return this.isGroupMemberOrManager(current[this.OWNERSHIP_GROUP]);
		}
		return false;
	},

	/**
 	* Get the assignee to whom feedback task can be assigned
 	*
 	* @param GlideRecord: current
 	**/
	getFeedbackTaskAssignee: function(current){
		var users = [];
		if(pm.isActive("com.snc.knowledge_advanced") && current.assignment_group){
			var groupId = current.assignment_group;
			var groupManager = current.assignment_group.manager;
			var gr = new GlideRecord(this.SYS_USER_GRMEMBER);
			gr.addQuery('group',groupId);
			gr.query();
			while(gr.next()){
				users.push(gr.getValue("user"));
			}
			if(groupManager && users.indexOf(groupManager+'') == -1) {
				users.push(groupManager);
			}
			if(gs.getProperty("glide.knowman.ownership_group.override", "false") == "true" && current.feedback && current.feedback.article) {
				var latestArticle = new KBVersioning().getLatestVersionByNumber(current.feedback.article.number);
 				if(latestArticle.revised_by && latestArticle.revised_by != "")
 					users.push(latestArticle.revised_by);
				users.push(current.feedback.article.author);
			}
		}
		if(users.length == 0)
			return "sys_class_name=sys_user";

		return "sys_idIN"+users.join();
	},

	canEditOwnershipGroup : function(){
		var sys_usrgroup = new GlideRecord("sys_user_group");
		sys_usrgroup.addQuery("manager",gs.getUser().getID());
		sys_usrgroup.addQuery("type","CONTAINS","458de4f067671300dbfdbb2d07415ad6");//Knowledge Type
		sys_usrgroup.query();
		if(sys_usrgroup.hasNext()){
			return true;
		}else{
			return false;
		}
	},

	getKnowledgeOwnershipGroups : function(){
		var groups = [];
		var groupGr = new GlideRecord("sys_user_group");
		groupGr.addQuery("type","CONTAINS","458de4f067671300dbfdbb2d07415ad6"); //knowledge type groups
		if(!gs.getUser().hasRole("knowledge_admin")){
			groupGr.addQuery("manager",gs.getUser().getID());
		}
		groupGr.query();
		while(groupGr.next()){
			groups.push(groupGr.getUniqueValue());
		}
		if(groups.length>0)
			return "sys_idIN"+groups.join();
		else
			return "sys_id=-1";
	},

	type: 'KBOwnershipGroupSNC'
});
