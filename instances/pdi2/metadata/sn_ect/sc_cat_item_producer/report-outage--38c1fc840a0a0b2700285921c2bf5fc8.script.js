setUpRecord();

function setUpRecord() {
   var short_description = "Outage on application " + producer.cmdb_ci.getDisplayValue();
   var notes = "";
   if (producer.error_message != '')
      notes = "Error Message : " + producer.error_message;
   if (producer.outage_start != '')
      short_description = short_description + " beginning at " + producer.outage_start.getDisplayValue();

   current.comments = notes; // assignment to current.comments does NOT replace existing values

   current.short_description = short_description;
   current.description = current.short_description;
   current.caller_id = gs.getUserID();
}

var isMobile = GlideMobileExtensions.getDeviceType() == 'm';
var link = isMobile ? '#/!list/incident/q:active=true%5Ecaller_id=javascript:gs.user_id()%5EEQ' : 'home.do';

var s = 'This incident was opened for your request<br/>';
s += 'The IT department will contact you if they need any further information<br/>';
if (isMobile)
	s += 'You can track status from this <a href="' + link + '">List</a> <br/>';
else
	s += 'You can track status from the <a href="' + link + '">Homepage</a> <br/>';
gs.addInfoMessage(s);

var incRPUtil = new LinkRecordProducerToIncident();
incRPUtil.linkRecordProducerToParentIncident(RP.getParameterValue('sysparm_parent_sys_id'), current);
