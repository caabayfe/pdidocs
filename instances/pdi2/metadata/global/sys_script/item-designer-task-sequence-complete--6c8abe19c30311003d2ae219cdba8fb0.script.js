if (current.state >=3 && previous.state < 3) 
	sc_ic_Factory.wrap(current.request_item.getRefRecord()).sendTaskCompleteWorkflowEvent();
