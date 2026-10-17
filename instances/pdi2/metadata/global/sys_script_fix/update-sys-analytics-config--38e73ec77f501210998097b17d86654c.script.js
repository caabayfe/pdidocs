
     if (!GlidePluginManager.isZboot()) {

     var table = 'sys_analytics_config';
     var field = 'config';
     var dictEntry = new GlideRecord('sys_dictionary');
     dictEntry.addQuery('name', table);
     dictEntry.addQuery('element', field);
     dictEntry.setLimit(1);
     dictEntry.query();
     if (dictEntry.next()) {
         dictEntry.setValue('internal_type', 'json');
         dictEntry.update();
         gs.info('Updated ' + table + ' ' + field + ' label and type');
     } else {
         gs.info('Did not find the dictionary record for ' + field + ' in ' + table);
     }
 }
   
