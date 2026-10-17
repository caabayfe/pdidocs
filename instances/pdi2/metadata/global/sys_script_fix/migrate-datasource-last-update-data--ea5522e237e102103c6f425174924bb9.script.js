
  var g = new GlideRecord('cmdb_datasource_last_update');
  g.addNullQuery('cmdb_ci'); //invalid records
  g.deleteMultiple();

  var scheduledRecord = new GlideRecord('sysauto_script');
  // SysId of the daily scheduled job 'Copy values for cmdb_datasource_last_update'
  scheduledRecord.get('0b5ca1e0eb13111007d5a1c628522893');
  if(scheduledRecord.getValue('active') != 'true') {
    scheduledRecord.setValue('active', 'true');
    scheduledRecord.update();
  }
