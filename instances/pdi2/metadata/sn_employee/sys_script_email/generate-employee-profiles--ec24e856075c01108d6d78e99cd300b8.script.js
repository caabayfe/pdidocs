(function runMailScript(current, template, email, email_action, event) {

    var eventParameters = event.parm1 ? JSON.parse(event.parm1) : "";

    var recipient = eventParameters? eventParameters.firstName : '';
    var profileCount = eventParameters? eventParameters.count : 0;
    var profileUrl = gs.getProperty('glide.servlet.uri') + "sn_employee_profile_list.do";
    var profileUrlTxt = "<a href='" + profileUrl + "' style='color: #1955BE;'>view all employee profile records</a>";

    template.print(gs.getMessage("Dear {0},", recipient));
    template.print("<br/><br/>");
    template.print(gs.getMessage("We've finished creating {0} employee profiles for your organization. You can now {1} within the Employee Profile table.", [profileCount, profileUrlTxt]));

})(current, template, email, email_action, event);
