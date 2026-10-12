setUpRecord();

function setUpRecord() {
    var short_description = "Performance problems with " + producer.cmdb_ci.getDisplayValue();
    if (producer.transaction == 'specific')
        short_description = "Performance problems with " + producer.specific_transaction;
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
