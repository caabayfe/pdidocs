function transform(input) { 
	
	var payload = [
		{
			id : "com.glide.cs.chatbot",
			displayName : "Virtual Agent",
			name : "Glide Virtual Agent",
			isInstalled : "",
			isPlugin : true,
			isStoreApp : false,
			appLink : "/now/app-manager/home/search/com.glide.cs.chatbot"
		},
		{
			id : "com.glide.interaction.awa",
			displayName : "Agent Chat",
			name : "Agent Chat",
			isInstalled : "",
			isPlugin : true,
			isStoreApp : false,
			appLink : "/now/app-manager/home/search/com.glide.interaction.awa"
		},
		{
			id : "sn_ci_analytics",
			displayName : "Conversational Analytics",
			name : "Conversational Analytics",
			isInstalled : "",
			isPlugin : false,
			isStoreApp : true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/c53ca02a73c310108564b17afef6a7c0"
		},
		{
			id : "com.snc.va_topic_recommender",
			displayName : "Topic Recommendations",
			name : "Virtual Agent Topic Recommendations",
			isInstalled : "",
			isPlugin : false,
			isStoreApp : true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/87c995fd53d21010a813ddeeff7b12e1"
		},
		{
			id : "com.snc.itsm.virtualagent",
			displayName : "ITSM Virtual Agent Conversations",
			name : "ITSM Virtual Agent Conversations",
			isInstalled : "",
			isPlugin : false,
			isStoreApp : true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/134450a0b3781300787162ac16a8dc1e"
		},
		{
			id : "com.sn_csm.virtualagent",
			displayName : "Customer Service Virtual Agent Conversations",
			name : "Customer Service Virtual Agent Conversations",
			isInstalled : "",
			isPlugin:true,
			isStoreApp: false,
			appLink : "/now/app-manager/home/search/com.sn_csm.virtualagent"
		},
		{
			id : "com.sn_hr_virtual_agent",
			displayName : "HR Scoped App: Virtual Agent Conversations",
			name : "HR Service Delivery Virtual Agent conversations",
			isInstalled : "",
			isPlugin:false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/c8c5545573d8130000e588e54cf6a71a"
		},
		{
			id : "com.snc.universal_request.va",
			displayName : "Universal Request: Virtual Agent Conversations",
			name : "Universal Request: Virtual Agent Conversations",
			isInstalled : "",
			isPlugin: true,
			isStoreApp: false,
			appLink : "/now/app-manager/home/search/com.snc.universal_request.va"
		},
		{
			id : "com.sn_fsm.virtualagent",
			displayName : "Field Service Management Virtual Agent Conversations",
			name : "Field Service Virtual Agent Conversations",
			isInstalled : "",
			isPlugin:false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/b7d7aa2ab7ae10105f48228dce11a9d5"
		},
		{
			id : "com.snc.ppm_virtualagent",
			displayName : "Virtual Agent for PPM",
			name : "Virtual Agent for PPM",
			isInstalled : "",
			isPlugin:false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/1fc89d065321101023beddeeff7b123c"
		},
		{
			id : "com.glide.isc_virtualagent",
			displayName : "ISC Virtual Agent Conversations",
			name : "ISC Virtual Agent Conversations",
			isInstalled : "",
			isPlugin: true,
			isStoreApp: false,
			appLink : "/now/app-manager/home/search/com.glide.isc_virtualagent"
		},
		{
			id : "com.glide.awa.agent_affinity",
			displayName : "Agent Affinity",
			name : "Advanced Work Assignment - Agent Affinity",
			isInstalled : "",
			isPlugin: true,
			isStoreApp: false,
			appLink : "/now/app-manager/home/search/com.glide.awa.agent_affinity"
		},
		{
			id : "com.glide.messaging.awa",
			displayName : "Conversational Messaging",
			name : "Conversational Messaging",
			isInstalled : "",
			isPlugin: true,
			isStoreApp: false,
			appLink : "/now/app-manager/home/search/com.glide.messaging.awa"
		},
		{
			id : "com.snc.pa.awa",
			displayName : "Performance Analytics Content Pack for AWA",
			name : "Performance Analytics - Content Pack - Advanced Work Assignment",
			isInstalled : "",
			isPlugin: true,
			isStoreApp: false,
			appLink : "/now/app-manager/home/search/com.snc.pa.awa"
		},
		{
			id : "com.sn.va.profanity",
			displayName : "Profanity filter for agent chat",
			name : "Profanity filter for agent chat",
			isInstalled : "",
			isPlugin: false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/77d07c3b7352201076d81f8afaf6a7bb"
		},
		{
			id : "com.snc.data_privacy_ux",
			displayName : "Data Privacy",
			name : "Data Privacy",
			isInstalled : "",
			isPlugin: false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/5e75a761c313011077cafcf9f040ddb2"
		},
		{
			id : "com.sn_va_appt_scheduler",
			displayName : "Conversational Appointment Booking",
			name : "Conversational Appointment Booking",
			isInstalled : "",
			isPlugin: false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/94cbb983db2e2010a59666041b961964"
		},
		{
			id : "com.snc.csm.engagement_center",
			displayName : "Engagement Messenger",
			name : "Engagement Messenger",
			isInstalled : "",
			isPlugin: false,
			isStoreApp: true,
			appLink : "https://store.servicenow.com/sn_appstore_store.do#!/store/application/85cc1c10872a1010fb4b3a0548cb0bf2"
		}
	];
	
	var result = {
		availablePlugins: [],
		installedPlugins: []
	};
	
	for(var i=0; i<payload.length; i++) {
		var link = {
			"label": "",
			"value": {
				"href": ""
			},
			"type": "external"
		};
		link.label = payload[i].displayName;
		link.value.href = payload[i].appLink;
		payload[i].isInstalled = GlidePluginManager.isActive(payload[i].id);
		if(payload[i].isInstalled)
			result.installedPlugins.push(link);
		else
			result.availablePlugins.push(link);
	}
	
	return result;
	
}
