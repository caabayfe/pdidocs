addMTOM();

function addMTOM() {
  var user_id = current.sys_id;
  var group_id = parent.sys_id;
  var gr = new GlideRecord('sys_user_grmember');
  gr.initialize();
  gr.group = group_id;
  gr.user = user_id;
  gr.insert();
}
