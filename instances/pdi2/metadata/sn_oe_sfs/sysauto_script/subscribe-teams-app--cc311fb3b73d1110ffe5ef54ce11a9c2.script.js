var teamsChannelId = 'a812eaf8c32111100f24c87af040dd59';
var kmfModuleId = '3b16f51f536811101c1addeeff7b1209';

var appInfo = getTeamsAppId(teamsChannelId);
var teamsAppId = appInfo.teamsAppId;
var applicationId = appInfo.applicationId;
var allMembersResource = 'getAllMembers';
var allMessagesResource = 'getAllMessages';

var result = sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.get_chat_subscription', {
		application_id: applicationId
	});
var subscriptions = JSON.parse(result.subscriptions);
var publicToken = getPublicToken();
var publicKeyId = getPublicKeyId();

if (publicToken != null) {
	subscribeOrRenew(allMembersResource);
	subscribeOrRenew(allMessagesResource);
}

function subscribeOrRenew(res) {
	// if there is no subscription for the resource, create a new subscription. Otherwise, renew another 60m.
	var subscription = getSubscription(res);
	if (subscription == null) {
		sn_fd.FlowAPI.executeSubflowQuick('sn_oe_sfs.collab_chat_subscribe_webhook', {
			change_type: res == allMembersResource ? 'created,deleted' :'created,updated,deleted',
			webhook_registry_record_name: 'CollabChatWebhookRegistry',
			resource: res + "?model=B",
			app_id: teamsAppId,
			encryption_certificate: publicToken,
			encryption_certificate_id: publicKeyId
		});
	} else {
		var gtd = new GlideDateTime();
		gtd.addSeconds(3600); // Adding 1h
		var utcDateTime = gtd.getValue();

		sn_fd.FlowAPI.executeActionQuick('sn_oe_sfs.renew_chat_subscription', {
			subscription_id: subscription.id,
			expiration_date_time: utcDateTime,
			encryption_certificate: publicToken,
			encryption_certificate_id: publicKeyId
		});
	}
}
function getSubscription(resource) {
	if (!subscriptions || subscriptions.length == 0)
		return null;

	for(var i=0; i<subscriptions.length; i++) {
		var subscription = subscriptions[i];
		if (subscription.resource.includes(resource))
			return subscription;
	}

	return null;
}
function getTeamsAppId(teamsChannelId) {
	var providerGR = new GlideRecord('sys_cs_collab_provider');
	providerGR.addQuery('channel', teamsChannelId);
	providerGR.addActiveQuery();
	providerGR.query();

	if (providerGR.next()) {
		var providerId = providerGR.getUniqueValue();
		var providerApplicationGR = new GlideRecord('sys_cs_collab_provider_application');
		providerApplicationGR.addQuery('provider', providerId);
		providerApplicationGR.addActiveQuery();
		providerApplicationGR.query();

		if (providerApplicationGR.next()) {
			return {
				'teamsAppId': providerApplicationGR.getValue('app_id'),
				'applicationId': providerApplicationGR.admin_connection.credential.oauth_entity_profile.oauth_entity.client_id
			};
		}
	}

	return null;
}

function getPublicToken() {
	var gr = new GlideRecord('sys_certificate');
	gr.addQuery('name', 'sn_oe_sfs.ms_teams_crypto_publickeywrap');
	gr.addQuery('format', 'pem');
	gr.addActiveQuery();
	gr.query();
	if (gr.next()) {
		var certificate = gr.getValue('pem_certificate');
		return certificate.substring(28, certificate.length-25).trim();
	}
	return null;
}

function getPublicKeyId() {
	var gr = new GlideRecord('sys_kmf_module_key');
	gr.addQuery('key_lifecycle_state', 'active');
	gr.addQuery('crypto_module', kmfModuleId);
	gr.addQuery('key_type', '13e0503bc7103300af4d43c6f09763f0');  //Public Key Wrapping Key
	gr.query();

	if (gr.next())
		return gr.getUniqueValue();

	return null;
}
