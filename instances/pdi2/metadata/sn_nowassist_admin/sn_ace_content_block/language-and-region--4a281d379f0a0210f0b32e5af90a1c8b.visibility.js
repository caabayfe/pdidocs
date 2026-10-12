var util = new sn_nowassist_admin.NowAssistAdminPluginUtil();
answer = !util.isRegulatedOrSelfHostedInstance() || util.isRegulatedInstanceType("GCC") || util.isRegulatedInstanceType("NSC");
