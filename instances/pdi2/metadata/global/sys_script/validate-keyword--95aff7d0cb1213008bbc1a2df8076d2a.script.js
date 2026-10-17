(function executeRule(current, previous /*null when async*/) {
   if (current.getValue("keyword").split(" ").length > 1)
	{
	  gs.addErrorMessage(gs.getMessage('Keyword must be only one word with no spaces!'));
	  current.setAbortAction(true);
   }
})(current, previous);
