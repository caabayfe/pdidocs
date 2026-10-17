(function() {
	answer = current.insert();
	var collection = 'sys_notification';
	var collectionId = current.getUniqueValue();

	var stack = gs.getSession().getStack();
	stack.pop();
	stack.push(collection + '.do?sys_id=' + collectionId);
	action.setNoPop(true);
	
	action.setRedirectURL('sys_notification_common_content.do?sysparm_collection=' + collection + '&sysparm_collectionID=' + collectionId);
})();
