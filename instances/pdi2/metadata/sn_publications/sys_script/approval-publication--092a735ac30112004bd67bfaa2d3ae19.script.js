(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('sn_publications_publication');
	if(gr.get(current.document_id)){
		var start = (new GlideDateTime(gr.getValue("publish_date"))).getNumericValue();  
		var now = new GlideDateTime().getNumericValue();

		if(now >= start){
              gs.addErrorMessage(gs.getMessage('You are not able to approve because you missed the publish date.'));
			  current.setAbortAction(true);

		  }

	}
})(current, previous);
