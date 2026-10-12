function onBefore(current, previous) {
	var canCreate = new global.GlobalKnowledgeUtil().canCreate(current.getTableName(),'sn_kb_social_qa.max_answers_per_user_daily','Social QandA answers');
    if (!canCreate)
        current.setAbortAction(true);		
}
