(function(finding) {
    var pluginList = [{
            name: "Adaptive Authentication",
            id: "com.snc.adaptive_authentication",
			desc: "Use the Adaptive authentication policy framework to enforce contextual authentication controls to the right users at the right time.",
			docs: "https://docs.servicenow.com/csh?topicname=adaptive-authentication.html",
        },
        {
            name: "Processor access policy",
            id: "com.glide.processor.policy",
			desc: "This plugin provides the ability for System/Export Processors to leverage processor access policy to secure all the export endpoints.",
			docs: "https://docs.servicenow.com/csh?topicname=api-auth-policy-export-processors.html",
        },
        {
            name: "REST API access policy",
            id: "com.glide.rest.policy",
			desc: "REST API access policies allow you to restrict access to inbound REST APIs based on the authentication type and the specified filter criteria of the access policy.",
			docs: "https://docs.servicenow.com/csh?topicname=inbound-authentication-profile.html",
        },
        {
            name: "SOAP API access policy",
            id: "com.glide.soap.policy",
			desc: "SOAP API access policies allow you to restrict access to inbound SOAP APIs based on the authentication type and the specified filter criteria of the access policy.",
			docs: "https://docs.servicenow.com/csh?topicname=soap-api-access-policies.html", 
		},
		{
			name: "IP Range Based Authentication",
            id: "com.snc.ipauthenticator",
			desc: "Apply an IP access control to outbound traffic, inbound traffic, or bidirectional traffic.",
			docs: "https://docs.servicenow.com/csh?topicname=c_IPRangeBasedAuthentication.html", 
		}
    ];

    var pgm = GlidePluginManager();
    for (var i = 0; i < pluginList.length; i++) {
        pluginList[i].active = pgm.isActive(pluginList[i].id);
        if (!pluginList[i].active) {
            var gr = new GlideRecord('v_plugin');
            gr.query('id', pluginList[i].id);
            gr.setLimit(1);

            if (gr.next()) {
                finding.setCurrentSource(gr);
                finding.setValue('finding_details', 
					'Please only install this plugin if you have a valid use case for it; otherwise, "mute" this finding.' +
					'\n\nThe "' + pluginList[i].name + '" plugin is not active on your instance. ' + 
					pluginList[i].desc +
					' For more details on this plugin, see: ' + pluginList[i].docs);
                finding.increment();
            }
        }
    }
})(finding);
