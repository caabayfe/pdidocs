removeBlock();
function removeBlock() {
  var gr = new GlideRecord('sys_portal_preferences');
  gr.addQuery('name', 'sys_id');
  gr.addQuery('value', current.sys_id);
  gr.query();
  var toKill = new Array();
  while(gr.next()) {
    toKill.push(gr.portal_section + '');
    if (toKill.length == 100) {
       deletePages(toKill);
       toKill = new Array();
    }
    deletePages(toKill);
  }
}

function deletePages(toKill) {
  if (toKill.length == 0)
      return;
  var gr = new GlideRecord('sys_portal');
  gr.addQuery('sys_id', toKill);
  gr.deleteMultiple();
}
