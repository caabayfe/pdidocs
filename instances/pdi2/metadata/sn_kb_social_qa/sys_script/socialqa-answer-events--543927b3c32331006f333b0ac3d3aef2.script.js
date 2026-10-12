function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
	var parm2 = gs.getProperty('glide.servlet.uri');
    var community_kb = gs.getProperty('sn_communities.knowledge_base_id');		
	if(current.question.kb_knowledge_base != community_kb){
		if(current.operation() == 'insert') {
			var subscribers = new SocialQAQuestion().getSubscribersToQuestion(current.question);
			gs.eventQueue('sn_kb_social_qa.answer.posted', current, subscribers, parm2);
		}else if(current.accepted == '1') {
			var subscribers = new SocialQAQuestion().getSubscribersToQuestion(current.question);
			var userId = current.profile.document.toString();
			var profileIndex = subscribers.indexOf(userId);
			if(profileIndex != -1) {
				//Remove user who posted the answer as it's handled directly by notification
				var subscribersList = subscribers.split(",");
				var idPosition = new global.ArrayUtil().indexOf(subscribersList, userId);
				subscribersList.splice(idPosition, 1);
				subscribers = subscribersList.join(',');
			}
			gs.eventQueue('sn_kb_social_qa.answer.accepted', current, subscribers, parm2);
		}
	}
}
