function runFix() {
    if (!pm.isZboot()) {
      // find 'now-filter' component in previous 'sn-component-filter' scope and remove it
      var oldScope = '87f745a49f471a5ac8f5832fd3af649a';
      var gr = new GlideRecord('sys_ux_lib_component');
      if (gr.get('8c35b0a3e06259fbd60c761b6f59cc29') && gr.getValue('sys_scope') === oldScope) {
        gs.info('Found ' + gr.getValue('tag') + ' component definition in outdated scope. We\'re addressing it promptly.');
        gs.info('Removing ' + gr.getValue('tag') + ' from sys_ux_lib_component');
        gr.deleteRecord();
      }

      gr = new GlideRecord('sys_ux_macroponent');
      if (gr.get('3a258764f3c0eff24169f03511509673') && gr.getValue('sys_scope') === oldScope) {
        gs.info('Removing ' + gr.getValue('name') + ' from sys_ux_macroponent');
        gr.deleteRecord();
      }

      gs.info('Done removing now-filter in outdated scope. It will be recreated in latest scope when corresponding plugin activates.');
    }
}

runFix();
