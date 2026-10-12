(function executeRule(current, previous /*null when async*/) {

	if (current.operation() === "insert") {
        gs.eventQueue("search_suggestion_blacklist.inserted", current);
    }

})(current, previous);
