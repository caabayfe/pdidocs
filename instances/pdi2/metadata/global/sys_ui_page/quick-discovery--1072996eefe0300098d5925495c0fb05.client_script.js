function chooseMIDServer() {
  var agent_name = gel('sys_display.ecc_agent').value;
  if (agent_name)
	  return;

  var target = gel('srcip').value;
  target = target.replace(/'/g, "\\'");

  if (!validIP(target))
	  return;

  var ga = new GlideAjax('DiscoveryAjax');
  ga.addParam('sysparm_name', 'MIDServerFinderByIP');
  ga.addParam('sysparm_target', target);
  ga.addParam('sysparm_app_name', 'Discovery');
  ga.getXMLWait();

  var sys_id = ga.getAnswer();

  var gr = new GlideRecord('ecc_agent');
  if (gr.get(sys_id)) {
	midName = gr.name;
    gel('sys_display.ecc_agent').value = midName;
	gel('ecc_agent').value = sys_id;
  }
}

function actionOK() {
  var target = gel('srcip').value;
  var agent_name = gel('sys_display.ecc_agent').value;
  var agent_sysId = gel('ecc_agent').value;

  target = target.replace(/'/g, "\\'");
  agent_name = agent_name.replace(/'/g, "\\'");

  if (!validIP(target)) {
	notificationMessage("Please enter a valid IP address");
	return;
  }

  var ga = new GlideAjax('DiscoveryAjax');
  ga.addParam('sysparm_name', 'quickDiscovery');
  ga.addParam('sysparm_agent_name', agent_name);
  ga.addParam('sysparm_agent_sysId', agent_sysId);
  ga.addParam('sysparm_target', target);
  ga.getXMLWait();

  var sys_id = ga.getAnswer();
  if (sys_id) {
    self.location = "discovery_status_list.do?sysparm_query=sys_id=" + sys_id;
	GlideDialogWindow.get().destroy();
  } else
    notificationMessage("Unable to find a proper MID server for discovering " + target);

}

function validIP(target) {
	if (!target)
		return false;

    // strip off any IPv6 zone index
    var percentIndex = target.indexOf('%');
    if (percentIndex != -1)
        target = target.substring(0, percentIndex);

	// Matches IPV4 dotted decimal or IPv6 mapped IPv4
	var regex= /^([0:]+:ffff:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
		match = regex.exec(target);

	if (match) {
		if (!match[1])
			return true;
		// If we get here it's a v4 mapped address.  We captured the non-dotted decimal part.  Add
		// the proper number of groups for what we removed and then validate as IPv6
		target = match[1] + '0:0';
	}

	// The simplest way I could think of to validate an IPv6 address.
	if (target.match(/[0-9a-f]{5}/i) || target.includes(':::'))
		return false;
	var colons = target.split(/[0-9a-f]{1,4}/i).join('');  // Remove all groups of hex digits
	if (!colons.match(/^:{2,8}$/))                         // Make sure only 2 to 8 colons are left
		return false;
	// Now make sure '::' was used properly.
	var doubles = target.split('::');
	if (doubles[0].startsWith(':') || doubles[doubles.length-1].endsWith(':'))
		return false;
	if (doubles.length == 1)
		return colons.length == 7;
	// We want a valid IPv6 address, not necessarily a canonical address.
	return doubles.length == 2;
}

function notificationMessage(msg) {
   var options = {};
   options.text = "<b style='color:red;'>" + msg + "</b>";
   options.fadeIn = 0;
   options.fadeOut = 500;
   options.closeDelay = 5000;
   options.sticky = false;
   options.type = "warn";

   new NotificationMessage(options);
}
