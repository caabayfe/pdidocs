(function executeRule(current, previous /*null when async*/) {

	if(gs.getProperty('glide.knowman.enable_km_subscription', 'true') == 'false') 
		return;
	
	if(current.workflow_state == "published") {
		var knowledge = new GlideRecord('kb_knowledge');
		knowledge.addActiveQuery();
		knowledge.setWorkflow(false);
		knowledge.addQuery('article_id',current.article_id);
		knowledge.orderByDesc('sys_created_on');
		knowledge.query();
		if(knowledge.next()) {
			var users;
			var subscription_gr = new GlideRecord('sn_actsub_subobject_stream');
			subscription_gr.addQuery('sub_obj_id',current.sys_id);
			subscription_gr.query();
			subscription_gr.getRowCount();
			while(subscription_gr.next()){
				if(users)
					users += "," + subscription_gr.subscriber_id.document;
				else
					users = subscription_gr.subscriber_id.document;
			}
			new ActivitySubscriptionContext().getSubscriptionService().subscribeUsers("7d8f537453003200fa9bd7b08cc5872c",knowledge.sys_id,users);
		}
		new ActivitySubscriptionContext().getSubscriptionService().unSubscribeUsers(current.sys_id);
	}
	else {
		new ActivitySubscriptionContext().getSubscriptionService().unSubscribeUsers(current.sys_id);
	}

})(current, previous);
