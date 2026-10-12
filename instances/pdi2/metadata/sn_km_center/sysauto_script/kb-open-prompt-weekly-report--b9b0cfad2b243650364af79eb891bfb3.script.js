gs.info('Starting kb open prompt weekly report job...');
var openPromptUtils = new KMOpenPromptUtils();
openPromptUtils.processGCFMetric();
gs.info('kb open prompt weekly report job completed...');
