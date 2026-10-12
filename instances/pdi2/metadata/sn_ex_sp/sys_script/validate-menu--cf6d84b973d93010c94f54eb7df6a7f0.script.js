(function executeRule(current, previous /*null when async*/ ) {

     var errorMesg = gs.getMessage('Duplicate menu cannot be associated to footer.');
     gs.addErrorMessage(errorMesg);
     current.setAbortAction(true);
     

})(current, previous);
