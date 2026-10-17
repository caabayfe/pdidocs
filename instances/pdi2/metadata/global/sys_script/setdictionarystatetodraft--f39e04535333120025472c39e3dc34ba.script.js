(function executeRule(current, previous /*null when async*/) {	
	if('draft' != String(current.dictionary.state) && !current.dictionary.state.nil() ){
	   var gr = current.dictionary.getRefRecord();
	   gr.state = 'draft';
	   gr.update();
	}
})(current, previous);
