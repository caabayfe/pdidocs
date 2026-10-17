var KBFanoutManagerSNC = Class.create();

KBFanoutManagerSNC.prototype = {
	
    notifyAuthorReviser: function(obj,event_name,current) {

		if(obj.class_name == 'kb_knowledge_block') return;
		var author_reviser = [];
		var knowledge_gr = new GlideRecord('kb_knowledge');
		knowledge_gr.addActiveQuery();
		knowledge_gr.setWorkflow(false);
		if(current.object_id.article_id.nil())
			knowledge_gr.addQuery('sys_id',current.object_id.sys_id);
		else
			knowledge_gr.addQuery('article_id',current.object_id.article_id);

		knowledge_gr.query();
		while(knowledge_gr.next()) {
			if(knowledge_gr.revised_by && knowledge_gr.revised_by != current.actor_id && new ArrayUtil().indexOf(author_reviser,knowledge_gr.revised_by) == -1 ) {
				if(!this.canNotify(knowledge_gr.revised_by,current))
					continue;
				obj.receiver = knowledge_gr.revised_by.first_name+'';
				gs.eventQueue(event_name,current,knowledge_gr.revised_by,new JSON().encode(obj));
				author_reviser.push(knowledge_gr.revised_by+'');	
			}
			else if(!knowledge_gr.revised_by && knowledge_gr.author != current.actor_id && new ArrayUtil().indexOf(author_reviser,knowledge_gr.author) == -1) {
				if(!this.canNotify(knowledge_gr.author,current))
					continue;
				obj.receiver = knowledge_gr.author.first_name+'';
				gs.eventQueue(event_name,current,knowledge_gr.author,new JSON().encode(obj));
				author_reviser.push(knowledge_gr.author+'');
			}
		}
	},
	
	canNotify: function(user,current) {
		var live_profile = this.getLiveProfileId(user);
		//check for users notification preference for the stream
		var userStream = new ActivitySubscriptionContext().getSubscriptionService().getUserStream(live_profile, 'Notification', true);
		if(userStream && userStream.name == 'Notification' && !userStream.fanout_to_stream)
			return false;

		if(new ActivitySubscriptionContext().getSubscriptionService().isSubscribed(current.object_id.sys_id,live_profile).subscriptionId) {
			var pref = new ActivitySubscriptionContext().getSubscriptionService().getPreferences(live_profile,'7d8f537453003200fa9bd7b08cc5872c');
			return this.checkPrefCode(pref.preferences.activities,current);
		}
		return false;
	},
	
	getLiveProfileId: function(userId){
		var live_profile = new GlideRecordSecure("live_profile");
		live_profile.addQuery("document", userId);
		live_profile.query();
		var profile_id;
		if(live_profile.next())
			profile_id = live_profile.getUniqueValue();
		return profile_id;
	},
	
	checkPrefCode: function(activities,current) {
		for(var i=0; i< activities.length; i++) {
			if(current.activity_type_id == activities[i].activity_type_id) {
				if (activities[i].pref_code.user_default == 1)
					return true;
				else return false;
			}
		}
	},
	
	checkPreferences: function(user,event_name,current) {
		var live_profile = this.getLiveProfileId(user);
		var art_pref = new ActivitySubscriptionContext().getSubscriptionService().getPreferences(live_profile,'7d8f537453003200fa9bd7b08cc5872c');
		var kb_pref = new ActivitySubscriptionContext().getSubscriptionService().getPreferences(live_profile,'722d67c367003200d358bb2d07415a9c');
		var kb_pref_val = this.checkPrefCode(kb_pref.preferences.activities,current);
		var art_pref_val = this.checkPrefCode(art_pref.preferences.activities,current);
		if(event_name == "sn_actsub.notify_about_article_revise_kb")
			return kb_pref_val;
		else if(event_name == "sn_actsub.notify_about_article_revised")
			return art_pref_val;
		else
			return kb_pref_val;
	},
	
	checkUserAccess: function(user_id, record_id) {
	    var gr = new GlideRecord('sys_user');
	    if(gs.nil(user_id) || !gr.get(user_id))
	        return false;
		var script = new KBDiagnostics(true, user_id, record_id);
		var summary = script.getDiagnostics().summary;
		return summary == 0 || summary == 1 || summary == 2;
	},
	
	notifySubscribers: function(subscribers,knowledge_obj,event_name,current) {
	
		if(knowledge_obj.class_name == 'kb_knowledge_block') return;
		
		for(var i=0;i<subscribers.length;i++) {
			if(!this.checkPreferences(subscribers[i],event_name,current))
				continue;

			if(!this.checkUserAccess(subscribers[i], knowledge_obj.sys_id))
				continue;

			knowledge_obj.receiver = this.getSubscriberName(subscribers[i]);
			if(current.activity_type_id.verb == "posted")
				gs.eventQueue(event_name,current,subscribers[i],new JSON().encode(knowledge_obj));
			else if(current.activity_type_id.verb == "revised")
				gs.eventQueue(event_name,current,subscribers[i],new JSON().encode(knowledge_obj));
		}
	},
	
	getSubscriberName: function(subscriber_id) {
		var gr = new GlideRecord('sys_user');
		gr.addQuery('sys_id',subscriber_id);
		gr.query();
		if(gr.next())
			return gr.first_name+'';
		else
			return '';
	},
	
	getLatestVersion: function(gr1) {
		var version_obj = {};
		version_obj.version = '';
		version_obj.id = '';
		var gr = new GlideRecord('kb_knowledge');
		gr.addActiveQuery();
		if(gr1.article_id.nil()) {
			gr.addQuery('sys_id',gr1.sys_id);
		}
		else {
			gr.addQuery('article_id',gr1.article_id);
		}
		gr.addQuery('workflow_state','published');
		gr.query();
		if(gr.next()) {
			version_obj.version = gr.version.version+'';
			version_obj.id = gr.sys_id+'';
		}
		return version_obj;
	},
	
	getKnowledgeObject: function(current) {
		var gr = new GlideRecord('kb_knowledge');
		var knowledge_obj = {};
		if(gr.get(current.object_id)){
			knowledge_obj.sys_id = gr.getValue('sys_id');
			knowledge_obj.number = gr.getValue('number');
			knowledge_obj.knowledge_base = gr.kb_knowledge_base.getDisplayValue();
			knowledge_obj.short_desc = gr.getValue("short_description");
			knowledge_obj.created_on = gr.sys_created_on.getDisplayValue();
			knowledge_obj.updated_on = gr.sys_updated_on.getDisplayValue();
			knowledge_obj.author = gr.author.getDisplayValue();
			knowledge_obj.revised_by = gr.revised_by.getDisplayValue();
			knowledge_obj.ownership_group = gr.getValue("ownership_group");
			knowledge_obj.ownership_group_name = gr.getDisplayValue('ownership_group');
			knowledge_obj.latest_version = this.getLatestVersion(gr).version;
			knowledge_obj.class_name = gr.getValue("sys_class_name");
		}
		return knowledge_obj;
	},
	
	getFeedbackObject: function(current) {
		var gr = new GlideRecord('kb_feedback');
		var feedback_obj = {};
		if(gr.get(current.additional_field1)){
			var extentionPoint = new GlideScriptedExtensionPoint().getExtensions("global.KMFeedbackObject");
			var versionId = this.getLatestVersion(gr.article).id;
			for(var i = 0; i < extentionPoint.length; ++i){
				var extPointImplementation = extentionPoint[i];
				extPointImplementation.getFeedbackObject(gr, feedback_obj, versionId);				 
			}
		}
		return feedback_obj;
	},
	
	getSubscribers: function(sub_objects,current) {
		var obj = new ActivitySubscriptionContext().getSubscriptionService().getSubObjSubscribers(sub_objects,this.getLiveProfileId(current.actor_id));
		return obj.subscribers;
	},
	
	fanout: function(current){

		var subscribers,event_name,sub_objects;
		var knowledge_obj,feedback_obj;
		
		if(current.activity_type_id.verb == "commented") {
			feedback_obj = this.getFeedbackObject(current);

			if(feedback_obj.ownership_group){
				gs.eventQueue("sn_actsub.notify_group_article_commented",current,feedback_obj.ownership_group,new JSON().encode(feedback_obj));
			}

			if(Object.keys(feedback_obj).length != 0)
				this.notifyAuthorReviser(feedback_obj,"sn_actsub.notify_about_article_commented",current);
		}
		else if(current.activity_type_id.verb == "checkedout") {
			knowledge_obj = this.getKnowledgeObject(current);

			if(knowledge_obj.ownership_group){
				gs.eventQueue("sn_actsub.notify_group_article_checkout",current,knowledge_obj.ownership_group,new JSON().encode(knowledge_obj));
			}

			if(Object.keys(knowledge_obj).length != 0)
				this.notifyAuthorReviser(knowledge_obj,"sn_actsub.notify_about_article_checkout",current);
		}
		else if(current.activity_type_id.verb == "posted" ) {
			knowledge_obj = this.getKnowledgeObject(current);
			sub_objects = current.object_id+','+current.target_id;
			if(current.additional_field1)sub_objects += ','+current.additional_field1;
			subscribers = this.getSubscribers(sub_objects,current);
			if(subscribers.length != 0 && Object.keys(knowledge_obj).length != 0){
				this.notifySubscribers(subscribers,knowledge_obj,"sn_actsub.notify_about_article_published",current);
			}
		}
		else if(current.activity_type_id.verb == "revised") {
			knowledge_obj = this.getKnowledgeObject(current);
			sub_objects = current.object_id;
			subscribers = this.getSubscribers(sub_objects,current);
			if(subscribers.length != 0 && Object.keys(knowledge_obj).length != 0){
				this.notifySubscribers(subscribers,knowledge_obj,"sn_actsub.notify_about_article_revised",current);
			}

			sub_objects = current.target_id;
			subscribers = this.getSubscribers(sub_objects,current);
			if(subscribers.length != 0 && Object.keys(knowledge_obj).length != 0){
				this.notifySubscribers(subscribers,knowledge_obj,"sn_actsub.notify_about_article_revise_kb",current);
			}
		}
	},
	
    type: 'KBFanoutManagerSNC'
};
