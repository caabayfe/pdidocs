class BuildAgentByokCredentialUtil {
	/**
	 * Decrypts an api_key_credentials record (Azure OpenAI BYOK).
	 * @param {string} credentialId - api_key_credentials sys_id
	 * @returns {{apiKey: string}|null} Decrypted attributes, or null on any resolution failure
	 */
	getApiKeyCredentialAttributes(credentialId) {
		var gr = new GlideRecordSecure('api_key_credentials');
		if (!gr.get(credentialId)) {
			gs.error('[BYOKCredentialUtil] Unable to load api_key_credentials record: ' + credentialId);
			return null;
		}
		var apiKeyElement = gr.getElement('api_key');
		var apiKey = apiKeyElement ? apiKeyElement.getDecryptedValue() : null;
		if (gs.nil(apiKey)) {
			gs.error('[BYOKCredentialUtil] Unable to decrypt api_key for credential: ' + credentialId);
			return null;
		}
		return { apiKey: apiKey };
	}

	/**
	 * Decrypts an aws_credentials record (Amazon Bedrock BYOK).
	 * @param {string} credentialId - aws_credentials sys_id
	 * @returns {{awsAccessKey: string, awsSecretKey: string}|null} Decrypted attributes, or null on any resolution failure
	 */
	getAwsCredentialAttributes(credentialId) {
		var gr = new GlideRecordSecure('aws_credentials');
		if (!gr.get(credentialId)) {
			gs.error('[BYOKCredentialUtil] Unable to load aws_credentials record: ' + credentialId);
			return null;
		}
		var accessKey = gr.getValue('access_key');
		var provider = new sn_cc.StandardCredentialsProvider();
		var credential = provider.getCredentialByID(credentialId);
		var secretKey = credential ? credential.getAttribute('secret_key') : null;
		if (gs.nil(accessKey) || gs.nil(secretKey)) {
			gs.error('[BYOKCredentialUtil] Unable to resolve AWS credentials for: ' + credentialId);
			return null;
		}
		return { awsAccessKey: accessKey, awsSecretKey: secretKey };
	}
}
