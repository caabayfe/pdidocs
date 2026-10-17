function onLoad() {
   //Type appropriate comment here, and begin script below
   var grp = gel("notify_participant.group_label");
	if (grp && grp.value != "") {
		var formatter = gel("notify_participant_group_macro");
		if (formatter) {
			formatter.parentElement.style.visibility = "hidden";
			formatter.parentElement.style.display="none";
		}
	}
}
