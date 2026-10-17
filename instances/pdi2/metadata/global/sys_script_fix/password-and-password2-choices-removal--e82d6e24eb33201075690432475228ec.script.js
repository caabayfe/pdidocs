gs.log('Password and password2 fix script: Started');
gs.log('Remove password and password2 choices for property type in sa_metric_property table');

var gr = new GlideRecord('sys_choice');
gr.addQuery('name', 'sa_metric_property');
gr.addQuery('element', 'type');

var passwords = ['password', 'password2'];
gr.addQuery('value', 'IN', passwords);

gr.query();

if (gr.next()) {
  var count = gr.getRowCount();
  gr.deleteMultiple(); 
  gs.log('Password and password2 fix script: ' + count + ' records removed. Finished');
} else {
  gs.log('Password and password2 fix script: no relevant records found. Finished');
}
