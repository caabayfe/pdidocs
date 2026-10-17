var util = new MIDServerSystemCommandUtil();
util.issueSystemCommandToAllMIDs('invalidate_ext_cred_cache', true);
gs.addInfoMessage(gs.getMessage('Invalidating External Credential Cache'));

url = 'discovery_credentials.do?sys_id=' + current.sys_id + '&sysparm_view=external_credential_storage';
action.setRedirectURL(url);
