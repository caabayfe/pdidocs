function transform(input) {
	const properties = JSON.parse(input.properties);
	const appId = input.appId;
	const configId = input.configId;
	const configUtils = new CmdbWsConfigUtils();
	const configProp = configUtils.getApplicationConfigProp({
		[configUtils.PARAM_PROPERTIES]: properties,
		[configUtils.PARAM_APP_ID]: appId,
		[configUtils.PARAM_CONFIG_ID]: configId
	});

	return configProp;
}
