
gs.info("Populating Table field on 'CMDB Data Management Policy' table for existing records");

var grPolicy = new GlideRecord('cmdb_data_management_policy');
grPolicy.addEncodedQuery('table=NULL');
grPolicy.query();
grPolicy.setValue('table', 'cmdb_ci');
grPolicy.updateMultiple();

gs.info("Done populating Table field on 'CMDB Data Management Policy' table for existing records");
