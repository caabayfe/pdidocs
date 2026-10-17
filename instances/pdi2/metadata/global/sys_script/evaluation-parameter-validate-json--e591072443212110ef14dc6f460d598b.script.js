(function executeRule(current, previous /*null when async*/) {
	try{
      JSON.parse(current.parameter_values);
    } catch (e){
      gs.addErrorMessage(gs.getMessage("Parameter Values field isn't a valid JSON List"));
      current.setAbortAction(true);
    }
})(current, previous);
