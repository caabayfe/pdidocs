var url,
	files = [
		'wrapper.log',
		'agent0.log.0',
		'security0.log.0',
		'mid_installer.log.0',
		'mid_installer.log.0.1',
		'dist_upgrade.log.0',
		'FileHandlerReport.txt',
		'../conf/wrapper.conf',
		'../conf/wrapper-override.conf',
		'../conf/wrapper-license.conf',
		'../conf/wrapper-jvm.conf',
		'../properties/glide.properties'
	],
	agent_name = current.name.replace(/'/g, "\\'"),
	midmanage = new MIDServerManage();

midmanage.threaddump(agent_name);
midmanage.grab_logs(agent_name, files.join(','));
midmanage.grab_settings(agent_name);

url = 'ecc_agent.do?sys_id=' + current.sys_id;
action.setRedirectURL(url);
