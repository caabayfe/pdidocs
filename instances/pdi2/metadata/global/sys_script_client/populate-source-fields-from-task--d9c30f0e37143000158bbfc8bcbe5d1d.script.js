function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || (g_form.getValue('parent') != '' && g_form.isNewRecord())) {
      return;
   }
   
   if (g_scratchpad.active == undefined || g_scratchpad.active == 'false') {
      g_scratchpad.active = 'true';
      var record = g_form.getReference('task')
      var task = new GlideRecord(record.sys_class_name);
      task.get(record.sys_id);
      
      var ci = new GlideRecord('cmdb_ci');
      ci.get(task.cmdb_ci);
      g_form.setValue('ci', ci.sys_id);
      g_form.setValue('asset', ci.asset);
      g_form.setValue('cost_center', ci.cost_center);
      g_form.setValue('contract', '');
      g_form.setValue('source_id', '');
      
      if (task.caller_id != undefined)
         g_form.setValue('user', task.caller_id);
      else if (task.requested_by != undefined)
         g_form.setValue('user', task.requested_by);
	  else
         g_form.setValue('user', '');
      
      g_scratchpad.active = 'false';
   }
}
