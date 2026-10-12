// is there any temporary table that expires today?
var ga = new GlideAggregate('sys_report_import_table');
ga.addAggregate('COUNT');
ga.addQuery('active','false');
ga.query();
ga.next();
ga.getAggregate('COUNT') !== '0'
