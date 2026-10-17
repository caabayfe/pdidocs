(function executeRule(current, previous /*null when async*/) {
	
	if(gs.getProperty('glide.knowman.enable_km_subscription', 'true') == 'false') 
		return;
		
	var context = new ActivitySubscriptionContext();
	if(!current.article_id.nil()) {
		var knowledge_gr = new GlideRecord('kb_knowledge');
		knowledge_gr.addActiveQuery();
		knowledge_gr.setWorkflow(false);
		knowledge_gr.addQuery('article_id',current.article_id);
		knowledge_gr.orderByDesc('sys_created_on');
		knowledge_gr.query();
		if(knowledge_gr.next()){
			var subscription_gr = new GlideRecord('sn_actsub_subobject_stream');
			subscription_gr.addQuery('sub_obj_id',knowledge_gr.sys_id);
			subscription_gr.query();
			while(subscription_gr.next()) {
					context.getSubscriptionService().subscribeUser('7d8f537453003200fa9bd7b08cc5872c',current.sys_id,subscription_gr.subscriber_id.document);	
			}
			context.getSubscriptionService().subscribeUser('7d8f537453003200fa9bd7b08cc5872c',current.sys_id,current.revised_by);
		}
	}
	else {
		// for the newly created articles
		context.getSubscriptionService().subscribeUser('7d8f537453003200fa9bd7b08cc5872c',current.sys_id,current.author);
	}

})(current, previous);
