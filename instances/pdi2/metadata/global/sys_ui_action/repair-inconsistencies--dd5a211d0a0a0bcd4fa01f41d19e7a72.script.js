var hatr = new SncHATableRepair(current.table_name, current.sys_id);
if(hatr.fixAllInconsistencies())
  hatr.markTableRepaired();
