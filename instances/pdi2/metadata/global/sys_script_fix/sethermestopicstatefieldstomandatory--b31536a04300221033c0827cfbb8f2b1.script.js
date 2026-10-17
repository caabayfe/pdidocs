(function() {
  var tableName = 'hermes_topics_state';

  // List of field names to update
  var fieldNames = ['topic_name', 'service_id', 'bootstrap_hash'];

  for (var i = 0; i < fieldNames.length; i++) {
    var gr = new GlideRecord('sys_dictionary');
    // Query the dictionary records for this table and field
    gr.addQuery('name', tableName);
    gr.addQuery('element', fieldNames[i]);
    gr.query();
    while (gr.next()) {
      // Set the field to mandatory
      gr.mandatory = true;
      gr.update();
      gs.print('sys_script_fix_b31536a04300221033c0827cfbb8f2b1: Updated ' + tableName + '.' + fieldNames[i] + ' to be mandatory.');
    }
  }
})();
