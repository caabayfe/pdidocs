if (current.content.changes()) {
	var currentContent = current.getDisplayValue('content').replace(/\s/g, "").replace(/(<([^>]+)>)/ig, "");
	var previousContent = previous.getDisplayValue('content').replace(/\s/g, "").replace(/(<([^>]+)>)/ig, "");		
    
	if (currentContent !== previousContent) {
          gs.addErrorMessage(gs.getMessage('Cannot update when ServiceNow Help is checked. Embedded Help record can be de-activated.'));
          current.setAbortAction(true);      
	}     
}
else {
     gs.addErrorMessage(gs.getMessage('Cannot update when ServiceNow Help is checked. Embedded Help record can be de-activated.'));
     current.setAbortAction(true);
}
