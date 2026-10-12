if (current.operation() == "delete" && cxs_App.getBusiness(current).isOnWizard())
	cxs_App.getBusiness(current).removeFromWizard();
else if (current.operation() == "update" && cxs_App.getBusiness(previous).isOnWizard(true) && current.expert.changes())
	cxs_App.getBusiness(previous).removeFromWizard();
