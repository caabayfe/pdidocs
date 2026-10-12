(function executeRule(current, previous /*null when async*/) {

	if (current.operation() === "update" &&
		(current.active != previous.active || current.phrase != previous.phrase 
		|| current.language != previous.language || current.type != previous.type)) {
        gs.eventQueue("search_suggestion_blacklist.deleted", current, current.sys_id);
		
		if (current.active) {
			gs.eventQueue("search_suggestion_blacklist.inserted", current);
		}
    }

})(current, previous);
