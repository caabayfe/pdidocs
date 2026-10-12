// create the URL for the syslog_list to display the log in last 30 days
var source = "ProposedChangesVerification";
var change = current.getValue('number');

var url = "proposed_change_verification_log_list.do?";
url += "sysparm_query=source%3D"+source;
url += "%5EmessageLIKE"+change;
url += "%5Esys_created_onONLast%202%20days%40javascript%3Ags.daysAgoStart(2)%40javascript%3Ags.daysAgoEnd(0)";
url += "%5EORDERBYDESCsys_created_on";

gs.setRedirect(url);
