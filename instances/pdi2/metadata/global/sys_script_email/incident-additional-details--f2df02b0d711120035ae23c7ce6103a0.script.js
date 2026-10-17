(function runMailScript(current, template, email, email_action, event) {

    template.print('<h2 style="font-size: 20px; padding-bottom: 16px; line-height: 30px; font-weight:600; margin:0;">About this incident</h2>');
    template.print('<div style="font-size: 16px;"><span style="font-weight: 400;">' + gs.getMessage('Short description: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${short_description}') + '</span></div>');
    template.print('<div style="font size:16px; color:#161B1C; face-family:lato";><span style=" font-weight:400;" >' + gs.getMessage('Caller: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${caller_id}') + '</span><br>');
    template.print('<span style=" font-weight:400;" >' + gs.getMessage('Category: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${category}') + '</span><br>');
    template.print('<span style=" font-weight:400;" >' + gs.getMessage('Urgency: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${urgency}') + '</span><br>');
    template.print('<span style=" font-weight:400;" >' + gs.getMessage('Priority: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${priority}') + '</span><br></div');

})(current, template, email, email_action, event);
