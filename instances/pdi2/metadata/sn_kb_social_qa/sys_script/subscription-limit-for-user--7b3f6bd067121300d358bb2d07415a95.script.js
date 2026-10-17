(function executeRule(current, previous /*null when async*/) {

	var canCreate = new global.GlobalKnowledgeUtil().canCreate(current.getTableName(),'sn_kb_social_qa.max_subscriptions_per_user_daily','Social QandA subscriptions');
    if (!canCreate)
        current.setAbortAction(true);		

})(current, previous);
