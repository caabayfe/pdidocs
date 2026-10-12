//Get task record data
var gr = new GlideRecord('vtb_task');
gr.addQuery('number', current.getDisplayValue("task"));
gr.query();
while (gr.next()) {

    template.print('<b>State:</b> ' + gr.getDisplayValue("state") + '<br/>');
    if (gr.priority) {
        template.print('<b>Priority:</b> ' + gr.getDisplayValue("priority") + '<br/>');
    }
    template.print('<b>Opened by:</b> ' + gr.getDisplayValue("opened_by") + '<br/>');
    template.print('<b>Assigned to:</b> ');
    if (gr.assigned_to) {
        template.print(gr.getDisplayValue("assigned_to") + '<br/>');
    } else {
        template.print('unassigned<br/>');
    }
    if (gr.additional_assignee_list) {
        template.print('<b>Additional assignees:</b> ' + gr.getDisplayValue("additional_assignee_list") + '<br/>');
        //for each additional assigneed, check if member of this board, if so add as CC
        var additionalAssignees = gr.additional_assignee_list.split(",");

        //get user records
        var user = new GlideRecord("sys_user");
        user.addQuery("sys_id", additionalAssignees);
        user.addQuery("notification", 2); //email
        user.addQuery("email", "!=", "");
        user.query();

        while (user.next()) {
            if (new VTBBoardSecurity().canUserAccess(current.board, user.sys_id)) {
                //add to cc list
                email.addAddress("cc", user.email, user.getDisplayValue());
            }
        }
    }
    if (gr.description) {
        template.print('<p><b>Description:</b><br/>');
        template.print(gr.getDisplayValue("description") + '</p>');
    }
    if (gr.comments_and_work_notes) {
        template.print('<p><b>Comments and Work notes:</b><br/>');
        template.print(gr.getDisplayValue("comments_and_work_notes") + '</p>');
    }

}
