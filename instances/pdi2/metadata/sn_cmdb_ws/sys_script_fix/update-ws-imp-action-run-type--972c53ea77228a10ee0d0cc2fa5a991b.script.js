var impActionUtil = new sn_cmdb_ws.CMDBWSImportantActionsUtil();

var gr = new GlideRecord(impActionUtil.TABLES.SN_CMDB_WS_IMP_ACTION_CARD_CONFIG);
gr.addQuery(impActionUtil.COLS.SYS_ID, impActionUtil.ACTION_CONFIG_DAILY_TYPE_IDS);
gr.query();
while (gr.next()) {
	gr.setValue(impActionUtil.COLS.RUN_TYPE, impActionUtil.RUN_TYPE.DAILY);
	gr.update();
}
