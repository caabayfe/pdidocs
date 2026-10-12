var agent_name = current.name.replace(/'/g, "\\'");
var midmanage = new MIDServerManage();
midmanage.upgrade(agent_name);

action.setRedirectURL(current);
