(function executeRule(current, previous /*null when async*/ ) {

    // Reset duplicate_of state, if CI gets updated
    current.duplicate_of = '';
    current.setWorkflow(false);
    current.update();
    
})(current, previous);
