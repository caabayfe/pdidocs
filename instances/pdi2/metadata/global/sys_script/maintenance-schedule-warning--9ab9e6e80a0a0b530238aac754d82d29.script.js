var ciGR = new GlideRecord("cmdb_ci");
ciGR.addQuery("maintenance_schedule", current.schedule);
ciGR.query();
if (ciGR.next())
   gs.addInfoMessage(gs.getMessage("This schedule is used by configuration items. Associated change requests will be automatically checked to see whether they are outside the maintenance schedule."));
