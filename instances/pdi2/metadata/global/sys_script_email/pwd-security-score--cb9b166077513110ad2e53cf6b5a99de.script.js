(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    email.setReplyTo(event.parm1);
    var processOwner = event.parm1;
    var gr = new GlideRecord("sys_user");
    if (gr.get(event.parm1)) {
        processOwner = gr.getValue("name");
    }
    var processOwnerName = processOwner.split("@")[0];
    var instanceUrl = gs.getProperty('glide.servlet.uri') + "nav_to.do?uri=";
    var processes = JSON.parse(event.parm2);
    var contentHTML = "<p style='line-height: 1.5;'>Dear " + processOwnerName + ",<br><br>Here're the latest security scores for your password processes on the instance <strong>" + gs.getProperty('instance_name') + "</strong>.<br><br>Here’s a list of recommendations that might help you improve the security and overall score of your process. To make the appropriate changes, navigate to the process record. To know more about these recommendations, see <a href='https://docs.servicenow.com/?context=pwd-reset-process-recommend&version=latest'>Password Reset documentation.</a></p>";
    var tableHTML = "<style>#processes {border-collapse: collapse;width: 100%;}, #processes th {border: 1px solid #ddd;padding: 8px;}#processes th { padding-top: 12px;padding-bottom: 12px;text-align: center;}tr { padding-top: 12px;padding-bottom: 12px;text-align: center;}</style>";
    tableHTML += "<table style='border: 1px solid black;' id='processes' >";
    var rowHeadings = ["Process Name", "Current Security Score", "Current Security Level", "Recommendations"];
    // insert row of headings
    tableHTML += "<tr>";
    for (var i = 0; i < rowHeadings.length; i++) {
        tableHTML += "<th style='border: 1px solid black;'>" + rowHeadings[i] + "</th>";
    }
    tableHTML += "</tr>";
    var formattedSuggestions = "";
    for (var j = 0; j < processes.length; j++) {
        tableHTML += "<tr>";
        var url = instanceUrl + gs.generateURL("pwd_process", processes[j].processID);
        tableHTML += "<td style='border: 1px solid black;'> <a href=" + url + ">" + processes[j].processName + "</a></td>";
        tableHTML += "<td style='border: 1px solid black;'>" + processes[j].securityScore + "/100 </td>";
        var currentSecurityLevel = processes[j].securityScore < 41 ? 'Low' : (processes[j].securityScore < 76 ? 'Medium' : 'High');
        tableHTML += "<td style='border: 1px solid black;'>" + currentSecurityLevel + "</td>";
        var currentProcessSuggestions = processes[j].suggestions;
        for (var k = 0; k < currentProcessSuggestions.length; k++) {
            formattedSuggestions += (k + 1) + ". " + currentProcessSuggestions[k] + "<br>";
        }
        tableHTML += "<td style='border: 1px solid black; text-align:left;'>" + formattedSuggestions + "</td>";
        formattedSuggestions = "";
    }
    // end of table
    tableHTML += "</table>";
    template.print(contentHTML + tableHTML);

})(current, template, email, email_action, event);
