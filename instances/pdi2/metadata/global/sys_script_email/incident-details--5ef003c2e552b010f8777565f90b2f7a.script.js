(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var inc = current.task_id ? current.task_id.getRefRecord() : current;
    if (!inc.isValidRecord()) return;

    template.print('<div style="font-size:16px;">');
    template.print('<div style="font-size:20px;line-height:30px;font-weight:600; padding-top:32px;">About this incident</div>');
    template.print('<div style="padding-top:16px; padding-bottom:32px;">');

    template.print('Short description: <span style="font-weight:600;">' + inc.short_description + '</span><br/>');
    var comments = inc.close_notes.toString();
    comments = comments.replace(/\n/g, '<br/>');
    if (email_action.sys_name.toString() === 'Incident closed' && !inc.close_notes.nil()) {
        template.print('Closed by: <span style="font-weight:600;">' + inc.closed_by.name + '</span><br/>');
        template.print('Closing notes: <span style="font-weight:600;">' + comments + '</span>');
    } else if (email_action.sys_name.toString() === 'Incident resolved' && !inc.close_notes.nil()) {
        template.print('Resolved by: <span style="font-weight:600;">' + inc.resolved_by.name + '</span><br/>');
        template.print('Resolution notes: <span style="font-weight:600;">' + comments + '</span>');
    }

    template.print('</div>');
})(current, template, email, email_action, event);
