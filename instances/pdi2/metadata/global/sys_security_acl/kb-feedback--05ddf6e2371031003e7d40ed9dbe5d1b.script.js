answer = canEditFeedback();

function canEditFeedback() {
	if(new SNC.KnowledgeHelper().canContribute(current.article.getRefRecord()) || current.sys_created_by == gs.getUserName()) {
		return true;
	}
	return false;
}

    
