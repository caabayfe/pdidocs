// is there any temporary table that expires today?
var ga = new GlideAggregate('sys_report_import_table');
ga.addAggregate('COUNT');
ga.addQuery('active','true');
ga.addQuery('expire_on_date', '<=' , new GlideDateTime().getDate());
ga.query();
ga.next();
ga.getAggregate('COUNT') !== '0'
