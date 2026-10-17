var mid_essentials = ["InstanceInfo", "GetMIDInfo", "MIDAssignedPackages", "MIDFieldForFileProvider", 
					  "MIDFileSyncSnapshot", "MIDServerCheck", "MIDServerFileProvider"];

if (JSUtil.contains(mid_essentials, current.name))
	answer = gs.hasRole("maint");
else
	answer = true; // rely on standard role check
