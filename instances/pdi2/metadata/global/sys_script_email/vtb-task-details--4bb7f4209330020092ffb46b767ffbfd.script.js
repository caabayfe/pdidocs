
template.print('<b>State:</b> ' + current.getDisplayValue("state") + '<br />');
if (current.priority) {
	template.print('<b>Priority:</b> ' + current.getDisplayValue("priority") + '<br />');
}
template.print('<b>Opened by:</b> ' + current.getDisplayValue("opened_by") + '<br />');
template.print('<b>Assigned to:</b> ');
if (current.assigned_to) {
	template.print(current.getDisplayValue("assigned_to") + '<br />');
} else {
	template.print('unassigned<br />');
}
if (current.additional_assignee_list) {
	template.print('<b>Additional assignees:</b> ' + current.getDisplayValue("additional_assignee_list") + '<br />');
}
if (current.description) {
	template.print('<p><b>Description:</b><br />');
	template.print(current.getDisplayValue("description") + '</p>');
}
if (current.comments_and_work_notes) {
	template.print('<p><b>Comments and Work notes:</b><br />');
	template.print(current.getDisplayValue("comments_and_work_notes") + '</p>');
}
