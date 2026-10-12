var notes = "Please contact customer with new password via: " + producer.contact_me;
notes += "\nCaller : " + producer.caller_id.getDisplayValue();
notes += "\nSystem : " + producer.cmdb_ci.getDisplayValue();
notes += "\nContact : " + producer.contact_me;
current.work_notes = notes;
current.short_description = "Reset the password for " + producer.caller_id.getDisplayValue() + " on " + producer.cmdb_ci.getDisplayValue();
current.description = current.short_description;

var isMobile = GlideMobileExtensions.getDeviceType() == 'm';
var link = isMobile ? '#/!list/incident/q:active=true%5Ecaller_id=javascript:gs.user_id()%5EEQ' : 'home.do';

var s = 'This incident was opened for your request<br/>';
s += 'The IT department will contact you when the password is reset or for further information<br/>';
if (isMobile)
	s += 'You can track status from this <a href="' + link + '">List</a> <br/>';
else
	s += 'You can track status from the <a href="' + link + '">Homepage</a> <br/>';
gs.addInfoMessage(s);

var incRPUtil = new LinkRecordProducerToIncident();
incRPUtil.linkRecordProducerToParentIncident(RP.getParameterValue('sysparm_parent_sys_id'), current);
