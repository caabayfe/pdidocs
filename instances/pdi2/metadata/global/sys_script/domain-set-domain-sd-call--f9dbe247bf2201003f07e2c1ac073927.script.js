// only set the domain if the user has a domain that is not global
var usr = new GlideRecord('sys_user');
usr.get(gs.getUserID());

var dom = usr.sys_domain;
if (dom && dom != 'global') 
	current.sys_domain = dom;
else
	current.sys_domain = getDefaultDomain();
