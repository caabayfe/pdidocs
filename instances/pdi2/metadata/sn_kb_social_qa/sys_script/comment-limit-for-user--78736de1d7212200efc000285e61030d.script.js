function onBefore(current, previous) {
	var canCreate = new global.GlobalKnowledgeUtil().canCreate(current.getTableName(),'sn_kb_social_qa.max_comments_per_user_daily','Social QandA comments');
    if (!canCreate)
        current.setAbortAction(true);		
}
