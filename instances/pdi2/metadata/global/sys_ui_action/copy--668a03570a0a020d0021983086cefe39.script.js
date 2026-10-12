copySysUISection();

function copySysUISection() {
  current.name = "Copy of " + current.name;
  var oldID = current.sys_id + '';
  var newID = current.insert() + '';
  var gr = new GlideRecord('sys_ui_element');
  gr.addQuery('sys_ui_section', oldID);
  gr.query();
  while (gr.next()) {
     gr.sys_ui_section = newID;
     gr.insert();
  }
}
