var SlackMessageValidator = Class.create();
SlackMessageValidator.prototype = {
    initialize: function() {
    },
	validateInboundMessage: function(headers, payload) {
		try {
			return this.__validate(headers, payload);
		} catch (e) {
			gs.error('SlackMessageValidator | validation errored: ' + e);
			return;
		}
	},
	__validate: function(headers, payload) {
		var LOGGER = new sn_oe_sfs.SidebarLogger().withName('SlackMessageValidator').createLogger();
		
		var slackSignature = headers['x-slack-signature'];
		var timestamp = headers['x-slack-request-timestamp'];
		if (!slackSignature || !timestamp) {
			LOGGER.debug('SlackMessageValidator | Missing Slack signature headers');
			return;
		}
		if (!this.__isRecentRequest(timestamp)) {
			LOGGER.debug('SlackMessageValidator | Timestamp outside the 5 minute window');
			return;
		}

		var signingSecret = this.__getSigningSecret();
		if (!signingSecret) {
			LOGGER.error('SlackMessageValidator | No Slack signing secret configured - rejecting inbound message');
			return;
		}

		var globalUtils = new global.CollabSlackUtil();
		// payload may be the raw body (string) or a parsed object depending on the caller.
		// Slack signs the raw bytes, so use them unchanged when we are given them.
		var body = (typeof payload === 'string') ? payload : JSON.stringify(payload);
		var mac = new CertificateEncryption().generateMac(
			globalUtils.base64Encode(signingSecret), 'HmacSHA256', 'v0:' + timestamp + ':' + body);
		
		if ('v0=' + globalUtils.toHexString(mac) !== slackSignature) {
			LOGGER.debug('SlackMessageValidator | Signature mismatch');
			return;
		}
		return 'SUCCESS';
	},
	__getSigningSecret: function() {
		var gr = new GlideRecord('sys_cs_collab_provider_application');
		gr.addActiveQuery();
		gr.addQuery('provider', '1f2e35d1a3f382106cdec213d51e61ae'); // Slack Provider
		gr.query();
		if (gr.next()) {
			return gr.signing_secret.getDecryptedValue();
		}
	},
	__isRecentRequest: function(timestamp) {
		var gdt = new GlideDateTime();
		gdt.subtract(300000); // 5 mins
		return gdt.getNumericValue()/ 1000 < timestamp;
	},
    type: 'SlackMessageValidator'
};
