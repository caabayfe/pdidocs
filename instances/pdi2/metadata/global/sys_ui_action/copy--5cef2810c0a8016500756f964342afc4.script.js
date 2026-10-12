// copy the definition
var gr = new GlideRecord("jrobin_definition");
gr.initialize();
gr.name = gs.getMessage("Copy of ") + current.name;
gr.collection_interval.setDateNumericValue(current.collection_interval.dateNumericValue());
var defID = gr.insert();

// copy the archives
var grFrom = new GlideRecord("jrobin_archive");
var grTo = new GlideRecord("jrobin_archive");
grFrom.addQuery('jrobin_definition', current.sys_id);
grFrom.query();
while (grFrom.next()) {
   grTo.initialize();
   grTo.jrobin_definition = defID;
   grTo.aggregator = grFrom.aggregator;
   grTo.storage_interval.setDateNumericValue(grFrom.storage_interval.dateNumericValue());
   grTo.storage_duration.setDateNumericValue(grFrom.storage_duration.dateNumericValue());
   grTo.fill_factor = grFrom.fill_factor;
   grTo.insert();
}

// copy the data sourcs
grFrom = new GlideRecord("jrobin_datasource");
grTo = new GlideRecord("jrobin_datasource");
grFrom.addQuery('jrobin_definition', current.sys_id);
grFrom.query();
while (grFrom.next()) {
   grTo.initialize();
   grTo.jrobin_definition = defID;
   grTo.name = grFrom.name;
   grTo.type = grFrom.type;
   grTo.heartbeat.setDateNumericValue(grFrom.heartbeat.dateNumericValue());
   grTo.insert();
}

// redirect to the copy we just created
gs.setRedirect(current.getTableName() + ".do?sys_id=" + defID);
