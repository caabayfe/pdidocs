addMTOM();

function addMTOM() {
  var group_id = current.sys_id;
  var user_id = parent.sys_id;
  var gr = new GlideRecord('sys_user_grmember');
  gr.initialize();
  gr.group = group_id;
  gr.user = user_id;
  gr.insert();
}
