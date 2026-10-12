(function executeRule(current, previous /*null when async*/) {

	if(gs.getProperty('glide.knowman.enable_km_subscription', 'true') == 'true' && current.workflow_state == 'published' && previous.workflow_state != "published" && previous.workflow_state != "pending_retirement") {
		if(!current.article_id.nil()) {
			var knowledge_gr = new GlideRecord('kb_knowledge');
			knowledge_gr.addActiveQuery();
			knowledge_gr.setWorkflow(false);
			knowledge_gr.addQuery('sys_id','!=',current.sys_id);
			knowledge_gr.addQuery('article_id',current.article_id);
			knowledge_gr.orderByDesc('sys_created_on');
			knowledge_gr.query();
			if(knowledge_gr.next()){
				var subscription_gr = new GlideRecord('sn_actsub_subobject_stream');
				subscription_gr.addQuery('sub_obj_id',knowledge_gr.sys_id);
				subscription_gr.query();
				while(subscription_gr.next()) {
					new ActivitySubscriptionContext().getSubscriptionService().subscribeUser('7d8f537453003200fa9bd7b08cc5872c',current.sys_id,subscription_gr.subscriber_id.document);
				}
			}
		}
		new ActivitySubscriptionContext().getSubscriptionService().subscribeUser('7d8f537453003200fa9bd7b08cc5872c',current.sys_id,current.kb_knowledge_base.owner);
		if(current.revised_by)
			new ActivitySubscriptionContext().getActivityService().createActivity(current,"revised");
		else
			new ActivitySubscriptionContext().getActivityService().createActivity(current,"posted");
		
		gs.eventQueue("sn_actsub.create_activity",current,"skip","");
	}


})(current, previous);
