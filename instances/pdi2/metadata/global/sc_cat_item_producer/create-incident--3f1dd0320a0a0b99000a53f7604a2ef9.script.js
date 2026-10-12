var isMobile = GlideMobileExtensions.getDeviceType() == 'm';
var link = isMobile ? '#/!list/incident/q:active=true%5Ecaller_id=javascript:gs.user_id()%5EEQ' : 'home.do';

var linkLbl = isMobile ? "List" : "Homepage";
var br = '<br/>';
var linkURL = '<a href="' + link + '">' + gs.getMessage(linkLbl) + '</a>';
var msgArgs = [br, linkURL];

var info = gs.getMessage("This incident was opened on your behalf{0}The IT department will contact you if they need any further information{0}You can track status from this {1} {0}", msgArgs);

gs.addInfoMessage(info);
var caller = gs.getUserID();
var parent_table = RP.getParameterValue('sysparm_parent_table');
if (JSUtil.notNil(parent_table)) {
	var parent_map = new GlideRecord('request_parent_mapping');
	parent_map.addQuery('parent_table', parent_table);
	parent_map.query();
	if (parent_map.next())
		var requested_for_field = parent_map.getValue('requested_for_field');
	var parentGR = new GlideRecord(parent_table);
	parentGR.addQuery('sys_id', RP.getParameterValue('sysparm_parent_sys_id'));
	parentGR.query();
	if (parentGR.next())
		caller = parentGR.getValue(requested_for_field);
}
current.contact_type = 'self-service';
current.caller_id = caller;
var prodCommentStr = producer.comments + "";
if (prodCommentStr.length > 80)
	current.short_description = prodCommentStr.substring(0, 80);
else
	current.short_description = prodCommentStr;
current.description = prodCommentStr;

var incRPUtil = new LinkRecordProducerToIncident();
incRPUtil.linkRecordProducerToParentIncident(RP.getParameterValue('sysparm_parent_sys_id'), current);
