var mid_essentials = ["InstanceInfo", "GetMIDInfo", "MIDAssignedPackages", "MIDFieldForFileProvider", 
					  "MIDFileSyncSnapshot", "MIDServerCheck", "MIDServerFileProvider"];

if (current.web_service && JSUtil.contains(mid_essentials, current.web_service.getDisplayValue()))
	answer = gs.hasRole("maint");
else
	answer = true; // rely on standard role check
