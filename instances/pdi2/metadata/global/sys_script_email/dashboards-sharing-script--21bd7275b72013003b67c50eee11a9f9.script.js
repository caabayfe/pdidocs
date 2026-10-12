// Get necessary data from param2 for displaying the default sharing message
var json = new JSON();
var invitationDetails = json.decode(event.parm2);
var inviteMessage = invitationDetails.inviteMessage; // message added by the user in the Share panel
var senderFullName = invitationDetails.senderFullName;
var restrictedRecipient = invitationDetails.restrictedRecipient; // is TRUE if user has all the required roles to see the dashboard, FALSE otherwise
var dashboardName = invitationDetails.dashboardName;
var dashboardSysId = invitationDetails.dashboardSysId;
var restrictedToRoles = invitationDetails.restrictedToRoles;
var dashboardLink = gs.getProperty('glide.servlet.uri') + "$dashboards.do?sysparm_dashboard=" + dashboardSysId;
 
 
template.print(gs.getMessage('"{0}" dashboard has been shared with you by {1}.', [dashboardName, senderFullName]));
 
// Include message added by the user in the sharing panel
if (inviteMessage.length > 0) {
	template.print("<br><br>");
	template.print(SNC.GlideHTMLSanitizer.sanitize(inviteMessage));
}
 
// For users that don't have all the roles needed to see the dashboard, adjust the default sharing message
if (restrictedRecipient) {
	template.print("<br><br>");
	template.print(gs.getMessage("ATTENTION - To access the dashboard you are required to have one of the following roles: {0}.", restrictedToRoles));
}
 
// Add link to view dashboard
template.print("<br><br><a href='" + dashboardLink + "'>" + gs.getMessage("View dashboard") + "</a>");
