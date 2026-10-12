(function runMailScript(current, template, email, email_action, event) {
    var emailParams = {};
    emailParams = JSON.parse(event.parm2);

    var jobLink       = emailParams.jobLink;
    var executionDate = emailParams.executionDate;
    var executionTime = emailParams.executionTime;
    var totalDeleted  = emailParams.totalDeleted;

    var message = "";

    message += gs.getMessage("This is to inform you that during the recent ");
    message += "<a href='" + jobLink + "' style='color: #3C59E7; text-decoration: none;'>" 
             + gs.getMessage("Automated Outdated Connected Content Cleanup") + "</a> ";
    message += gs.getMessage("scheduled job run on") + " <span style='font-weight: 600;'>" 
             + executionDate + "</span> ";
    message += gs.getMessage("at") + " <span style='font-weight: 600;'>" 
             + executionTime + "</span>, ";
    message += gs.getMessage("outdated connected content items were automatically removed ");
    message += gs.getMessage("from the connected content list as per the configured settings.");
    message += "</div>";

    template.print(message);
})(current, template, email, email_action, event);
