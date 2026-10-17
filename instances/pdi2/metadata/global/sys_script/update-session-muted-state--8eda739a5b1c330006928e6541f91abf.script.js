(function executeRule(current, previous /*null when async*/) {
    // Add your code here
    current.setValue('muted', false);
	current.setValue('expelled', false);
    current.update();
    
})(current, previous);
