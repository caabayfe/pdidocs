gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'Started executing Fix script: Deactivate OneExtendUsage records'));
var gr = new GlideRecord('sys_one_extend_usage');
gr.addActiveQuery();
gr.query();
gr.setValue("active", false);
gr.updateMultiple();
gs.info(sn_i18n.Message.getMessage('glide-one-extend', 'Completed executing Fix script: Deactivate OneExtendUsage records'));
