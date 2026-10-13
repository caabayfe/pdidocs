function onAfter(current, previous) {
  //This function will be automatically called when this rule is processed.
  //gs.print("group member changed");
	
	var updateHash = true;

	//Don't update the hash if severity is the only important field that had changed
	if (current.isValidField("severity")) {
		if (current.operation() == "update") {
			if (current.getValue("severity") != previous.getValue("severity")) {
				if (current.getValue("busines_criticality") == previous.getValue("busines_criticality")) {
					if (current.getValue("operational_status") == previous.getValue("operational_status")) {
						if (current.getValue("name") == previous.getValue("name")) {
							updateHash = false;
						}
					}
				}			
			}
		}
	}
  
	if (updateHash) {
		var bsManager = new SNC.BusinessServiceManager();	
		bsManager.dashboardStructureHadChange(); 
	}
}
