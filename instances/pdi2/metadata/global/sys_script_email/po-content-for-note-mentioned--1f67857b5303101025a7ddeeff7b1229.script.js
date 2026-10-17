(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var grProject = current.project.getRefRecord();
    var projectLink = grProject.getLink();
    var taggedBy = event.parm2;
    var number = grProject.getValue('number');
    var projectName = grProject.getValue('name');

    email.setSubject("New mention in " + number + " - " + projectName + ", a Process Mining project");

    template.print("New mention by " + taggedBy + " in the Process Mining Project <a href='" + projectLink + "' target='_blank'>" +
        grProject.number + " - " + grProject.name + "</a>.<br/><br/>");

    template.print("<strong>Note:</strong> " + "<br/>");

    template.print(current.getDisplayValue("note") + "<br/>");


})(current, template, email, email_action, event);
