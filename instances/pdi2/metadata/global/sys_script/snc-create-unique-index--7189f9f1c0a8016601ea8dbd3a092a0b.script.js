var tableName = current.getValue('name');
var elementName = current.getValue('element');

var success = gs.ensureIndex(tableName, elementName);
if (!success) {
  var reset = new GlideRecord('sys_dictionary');
  reset.get(current.sys_id.toString());
  reset.unique = false;
  reset.setWorkflow(false);
  reset.update();
}
