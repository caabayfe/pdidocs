function runFix() {
    if (!pm.isZboot()) {
      // find API resources in previous 'sn-par-filter-config-panel' scope and remove them
      gs.info('Checking for Filter Hierarchy API resources. If existing, they will be deleted.');
      var gr = new GlideRecord('sys_ws_definition');
      if (gr.get('bf0ee3e4e6de42adb29a9b9b5e178b66')) {
        gs.info('Removing "' + gr.getValue('service_id') + '" from sys_ws_definition');
        gr.deleteRecord();
      }

      gr = new GlideRecord('sys_ws_operation');
      if (gr.get('9413c6d67f6b4368806037f67669d82a')) {
        gs.info('Removing "' + gr.getValue('name') + '" from sys_ws_operation');
        gr.deleteRecord();
      }

      gr = new GlideRecord('sys_ws_query_parameter');
      if (gr.get('690f664755a14cbab8117233a23fc225')) {
        gs.info('Removing "' + gr.getValue('short_description') + '" from sys_ws_query_parameter');
        gr.deleteRecord();
      }

      gs.info('Done checking and removing for Filter Hierarchy API resources.');
    }
}

runFix();
