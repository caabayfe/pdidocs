var rosterIds = [parent.getUniqueValue()];
rosterIds = rosterIds.concat(new OnCallMemberUtils().getSimilarRosters(parent.getUniqueValue()));

var uri = action.getGlideURI();
var path = uri.getFileFromPath();
uri.set('sys_id', '-1');
uri.set('sysparm_query', 'rota=' + parent.rota + '^current_roster=' + parent.getUniqueValue() + '^rosters=' + rosterIds);

action.setRedirectURL(uri.toString('on_call_add_member.do'));
