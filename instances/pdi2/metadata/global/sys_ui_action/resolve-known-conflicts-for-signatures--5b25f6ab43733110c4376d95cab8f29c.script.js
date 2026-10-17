// resolve known conflicts
var message = new CodeSigningUtil().resolveCSKnownConflicts(current.sys_id);

action.setRedirectURL(current);

if(!gs.nil(message))
	gs.addInfoMessage(message);
