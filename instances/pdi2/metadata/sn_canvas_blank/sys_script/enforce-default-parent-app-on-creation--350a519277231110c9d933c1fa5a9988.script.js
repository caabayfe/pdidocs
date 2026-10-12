(function executeRule(current, previous /*null when async*/) {
	var uxrBaseExperienceShellUISysID = "76a83a645b122010b913030a1d81c780";
	var uxrBlankAppShellUISysID = "fee17a0f5b130010b913cbd59b81c7c2";
	var uxrBaseUnifiedAppSysID = "c4b650c2c702201072b211d4d8c260a4";
	var parentAppShellUISysID = findParentAppShellUISysID(retrieveRecord("sys_ux_macroponent", current.root_macroponent), uxrBaseExperienceShellUISysID, uxrBlankAppShellUISysID);

	/*
	  If directly or indirectly using App Shell UI UXR Base Experience Shell and Parent App is empty, set Parent App to
	  UXR Base Experience Shell UI 
	*/
	if(parentAppShellUISysID === uxrBaseExperienceShellUISysID || retrieveRecord("sys_ux_macroponent", parentAppShellUISysID).getValue("extends") === uxrBaseExperienceShellUISysID){
		if(gs.nil(current.parent_app)){
			current.parent_app = uxrBaseUnifiedAppSysID;
		}
	}
	/*
	   If App Shell UI is directly using Blank App Shell, set the App Shell UI to UXR Base Experience Shell UI,
	   and set the Parent App to UXR Base Unified App if the parent app is empty.
	*/
	else if(parentAppShellUISysID === uxrBlankAppShellUISysID){
		current.root_macroponent = uxrBaseExperienceShellUISysID;
		if(gs.nil(current.parent_app)){
			current.parent_app = uxrBaseUnifiedAppSysID;
		}
	}
	/*
	  If App Shell UI is indirectly using Blank App Shell, meaning if it is using some other App Shell which is extending 
	  the Blank App Shell, we then set the very last macroponent extending the Blank App Shell to extend UXR Base Experience
	  shell UI instead. Then set the Parent App to UXR Base Unified App if the parent app is empty
	*/
	else if(retrieveRecord("sys_ux_macroponent", parentAppShellUISysID).getValue("extends") === uxrBlankAppShellUISysID){
		appShell = retrieveRecord("sys_ux_macroponent", parentAppShellUISysID);
		appShell.setValue("extends", uxrBaseExperienceShellUISysID);
		appShell.update();
		if(gs.nil(current.parent_app)){
			current.parent_app = uxrBaseUnifiedAppSysID;
		}
	}

	/*
	   Finds the root parent app shell, or the one right before it if it extends either UXR Blank App Shell or 
	   UXR Base Experience Shell
	*/
	function findParentAppShellUISysID(curr, uxrBaseExperienceShellUISysID, uxrBlankAppShellUISysID){
		if(gs.nil(curr.getValue("extends")) || curr.getValue("extends") === uxrBaseExperienceShellUISysID || curr.getValue("extends") === uxrBlankAppShellUISysID){
			return curr.getValue("sys_id");
		}
		return findParentAppShellUISysID(retrieveRecord("sys_ux_macroponent", curr.getValue("extends")));
	}

	/*
	   Helper function to retrieve a record using GlideRecord API
	*/
	function retrieveRecord(tableName, sysID){
		var gr = new GlideRecord(tableName);
		gr.get(sysID);
		return gr;
	}
})(current, previous);
