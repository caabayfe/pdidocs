(function runMailScript(current, template, email, email_action, event) {
    //Incident task assigned to my group
    if (email_action.name == "Incident task assigned to my group") {
        template.print('<div style="font-size: 16px;"><span style="font-weight: 700; color: #181A1F">${number} </span>');
        template.print('<span style="font-weight: 400;">was recently assigned to </span>');
        template.print('<span style="font-weight: 700;">${assignment_group}</span>');
        template.print('<span style="font-weight: 400;"> group.</span></div>');
    }
    //Incident task assigned to me
    else {
        template.print('<div style="font-size: 16px;" ><span style="font-weight: 700; color: #181A1F;">${number} </span>');
        template.print('<span style="font-weight: 400;">was recently assigned to you.</span></div>');
    }
})(current, template, email, email_action, event);
