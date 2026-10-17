function transform(input) {
	var accessAnalyzerConsumerUtil = new sn_access_analyzer.AccessAnalyzerConsumersUtil();
	return accessAnalyzerConsumerUtil.createHeaderPayload(input);
}
