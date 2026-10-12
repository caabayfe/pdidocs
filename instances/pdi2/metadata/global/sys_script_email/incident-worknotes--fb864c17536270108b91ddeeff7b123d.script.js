(function runMailScript(current, template, email, email_action, event) {

    template.print('<div style="font-size: 16px; padding-bottom: 16px;"><span style="font-weight: 400;">' + gs.getMessage('Work notes: ') + '</span>');
    template.print('<span style="font-weight: 600;">' + gs.getMessage('${work_notes}') + '</span></div>');

})(current, template, email, email_action, event);
