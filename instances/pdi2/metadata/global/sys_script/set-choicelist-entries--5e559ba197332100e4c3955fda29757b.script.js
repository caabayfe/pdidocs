var hostChoices = ['CIs', 'Nets', 'IPs'];
var wsChoices = ['Web Service'];
var serviceChoices = ['Service'];
var cloudChoices = ['Cloud'];
var hostlessChoices = ['Hostless'];
var certificateChoices = ['Certificates'];
var nothingToHide = [];

g_scratchpad.discoverChoicesToHide = nothingToHide;

if (!GlidePluginManager.isActive("com.snc.discovery")) {
	g_scratchpad.discoverChoicesToHide = hostChoices;
	g_scratchpad.discoverChoicesToHide.push(cloudChoices);
	g_scratchpad.discoverChoicesToHide.push(hostlessChoices);
}

if (!GlidePluginManager.isActive("com.snc.discovery.web_service.core")) {
	g_scratchpad.discoverChoicesToHide = wsChoices;
}

if (!GlidePluginManager.isActive("com.snc.service-mapping")) {
	g_scratchpad.discoverChoicesToHide.push(serviceChoices);
}

if (!GlidePluginManager.isActive("com.sn_disco_certmgmt")) {
	g_scratchpad.discoverChoicesToHide.push(certificateChoices);
}
