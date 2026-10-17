(function runMailScript(current, template, email, email_action, event) {
    template.print('<div style="font-size: 20px; padding-bottom: 16px; line-height: 30px;"><span style="font-weight:600;">About this incident task</span></div>');
    template.print('<div style="font-size: 16px;"><span style="font-weight: 400;">' + gs.getMessage('Short description: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${short_description}') + '</span></div>');
    if (email_action.name != "Incident task Priority raised") {
        template.print('<span style=" font-weight:400;" >' + gs.getMessage('Opened by: ') + '</span>');
        template.print('<span style="font-weight: 600;">' + gs.getMessage('${opened_by}') + '</span><br>');
        template.print('<span style=" font-weight:400;" >' + gs.getMessage('State: ') + '</span>');
        template.print('<span style="font-weight: 600;">' + gs.getMessage('${state}') + '</span><br>');
    }
    template.print('<span style=" font-weight:400;" >' + gs.getMessage('Priority: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${priority}') + '</span><br>');
    if (email_action.name == "Incident task closed") {
        template.print('<span style=" font-weight:400;" >' + gs.getMessage('Close notes: ') + '</span>');
        template.print('<span style="font-weight: 600;">' + gs.getMessage('${close_notes}') + '</span><br></div');
    }
    if (email_action.name == "Incident task state changed") {
        template.print('<span style=" font-weight:400;" >' + gs.getMessage('Work notes: ') + '</span>');
        template.print('<span style="font-weight: 600;">' + gs.getMessage('${work_notes:1}') + '</span><br></div');
    }
    if (current && current.incident) {
        var link = new EmailNotificationRedirection().getLink("incident", current.getValue("incident"));
        template.print('<span style=" font-weight:400;" >' + gs.getMessage('Incident: ') + '</span>');
        template.print('<span style="font-weight: 600;">' + gs.getMessage('<a href="' + link + '" target="_blank">' + '${incident}' + '</a>') + '</span><br>');
    }
})(current, template, email, email_action, event);
