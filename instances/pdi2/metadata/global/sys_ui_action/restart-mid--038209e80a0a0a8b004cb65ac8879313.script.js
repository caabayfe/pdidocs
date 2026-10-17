var agent_name = current.name.replace(/'/g, "\\'");
var midmanage = new MIDServerManage();
midmanage.restartService(agent_name);
midmanage.system_msg(agent_name, 'load_ip_access');
gs.addInfoMessage(gs.getMessage('Syncing IP access rules with MID server: {0}', agent_name));

action.setRedirectURL(current);
