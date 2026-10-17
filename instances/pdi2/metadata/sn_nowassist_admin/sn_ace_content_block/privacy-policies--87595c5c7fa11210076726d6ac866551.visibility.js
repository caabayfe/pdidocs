var util = new sn_nowassist_admin.NowAssistAdminPluginUtil();
var isRegulatedOrSelfHostedInstance = util.isRegulatedOrSelfHostedInstance();
answer = !isRegulatedOrSelfHostedInstance;
