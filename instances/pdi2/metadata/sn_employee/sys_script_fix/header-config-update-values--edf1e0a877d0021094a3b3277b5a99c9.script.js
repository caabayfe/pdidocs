updateHeaderConfig();

function getActionGroup() {
  try {
    var gr = new GlideRecord("sp_instance");
    gr.addQuery("sp_widget", "67863c0d073330108d6d78e99cd30080");
    gr.orderByDesc("sys_created_on");
    gr.query();

    if (gr.next()) {
      return global.JSON.parse(gr.widget_parameters).action_group.value;
    }
  }catch(err){
    gs.info(err)
    return;
  }
}

function checkIfDefaultHeaderExists() {
  var headeConifgGR = new GlideRecord(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.NAME);
  headeConifgGR.addQuery("default", true);
  headeConifgGR.query();
  return headeConifgGR.next();
}

function updateHeaderConfig() {
  if(checkIfDefaultHeaderExists())
    return;

    var headeConifgGR = new GlideRecord(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.NAME);
    headeConifgGR.addActiveQuery();
    headeConifgGR.addQuery("default", false);
    headeConifgGR.orderByDesc("sys_created_on");
    headeConifgGR.query();
    if (headeConifgGR.next()) {
        var actionGroup = getActionGroup() || sn_employee.ep_Constants.OOB_DEFAULT_ACTION_GROUP;
        headeConifgGR.actions= actionGroup;
        headeConifgGR.setValue(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.FIELDS.BG_IMAGE, true);
        headeConifgGR.setValue(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.FIELDS.DISABLE_LINKS, false);
        headeConifgGR.setValue(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.FIELDS.DEFAULT, true);
        headeConifgGR.setValue(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.FIELDS.EDIT_IMAGES, true);
        headeConifgGR.setValue(sn_employee.ep_Constants.TABLES.EP_HEADER_CONFIG.FIELDS.SHOW_PRONOUN, true);
        headeConifgGR.update();
    }
}
