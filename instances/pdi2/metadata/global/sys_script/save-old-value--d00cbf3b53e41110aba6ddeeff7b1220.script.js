(function executeRule(current, previous /*null when async*/) {

    //Fix for DEF0311646
	g_scratchpad.current_value = current.value;

})(current, previous);
