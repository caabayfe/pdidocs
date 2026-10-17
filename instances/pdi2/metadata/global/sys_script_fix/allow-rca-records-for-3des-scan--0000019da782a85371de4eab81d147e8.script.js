if (!GlidePluginManager.isZboot()) {
    gs.info("AllowRCAfor3DESscan: Updating RCA records for 3DES scan script include to Allowed status");

    var gr = new GlideRecord('sys_restricted_caller_access');
    if(!gr.isValid()){
      gs.info("AllowRCAfor3DESscan: " + gr.getTableName() + " table is not valid");
    } else {
      gr.addEncodedQuery('source=8beb4bb8ff942210a9b0ffffffffffaa^status!=2^ORstatus=NULL');
      gr.setValue('status', 2);
      gr.setWorkflow(false);
      gr.autoSysFields(false);
      gr.updateMultiple();
      gs.info("AllowRCAfor3DESscan: Updated " + gr.getRowCount() + " RCA records to Allowed status");
    }
}
