(function executeRule(current, previous /*null when async*/) {

	if (current.operation() === "delete") {
        gs.eventQueue("search_suggestion_blacklist.deleted");
    }

})(current, previous);
