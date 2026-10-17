(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */

    data.isMWPluginActive = new GlidePluginManager().isActive("sn_ex_mw_chat_int");
    data.isMWChatEnabled = gs.getProperty("sn_ex_mw_chat_int.webchat.enabled",false);

    if (input && input.action == "loadData") {
        data.footer = new sn_ex_sp.EmployeeCenterFooterUtil().getFooterDetails($sp);
        data.isFooterFixed = new sn_ex_sp.EmployeeCenterFooterUtil().isFooterFixed($sp.getPortalRecord().sys_id + '');
  }
})();
