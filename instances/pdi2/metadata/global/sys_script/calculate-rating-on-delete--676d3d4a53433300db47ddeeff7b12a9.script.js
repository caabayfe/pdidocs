(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue("kb_feedback.rating.deleted",null,current.article,current.sys_id);

})(current, previous);
