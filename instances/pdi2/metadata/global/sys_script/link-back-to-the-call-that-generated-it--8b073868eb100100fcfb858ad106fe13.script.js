var full_text = current.special_instructions;
var call_id = full_text.substring(13,45); //Extract the call_id
var real_desc = full_text.substring(46,full_text.length);  //Extract the actual message

current.special_instructions = real_desc;

var cal = new GlideRecord("new_call");
cal.get(call_id);
cal.transferred_to = current.sys_id;
cal.update();

// update taks work notes
var callerName = cal.caller.name;
var taskType = cal.call_type.getDisplayValue();
var currentLink = "[code]<a href='" + cal.getLink() + "'>" + cal.number + "</a>[/code]";
var journalEntry = gs.getMessage("This {0} was raised on behalf of {1} from {2}", [taskType, callerName, currentLink]);
current.work_notes = journalEntry;

if (GlidePluginManager.isRegistered('com.glide.domain'))
	current.sys_domain =  getDomain();

var call_url = 'new_call.do?sys_id=' + call_id;
var requ_url = 'sc_request.do?sys_id=' + current.sys_id;
var msg_cal_number = "<a href='" + call_url + "'>" +cal.number + "</a>";
var msg_cur_number = "<a href='" + requ_url + "'>" +current.number + "</a>"
gs.addInfoMessage(gs.getMessage("{0} transferred to : {1}", [msg_cal_number, msg_cur_number]));

function getDomain(){
	// only set the domain if the requested_for has a domain that is not global
	if (JSUtil.notNil(current.requested_for) && JSUtil.notNil(current.requested_for.sys_domain) && current.requested_for.sys_domain.getDisplayValue() != 'global') 
		return current.requested_for.sys_domain;
	else
		return getDefaultDomain();
}
