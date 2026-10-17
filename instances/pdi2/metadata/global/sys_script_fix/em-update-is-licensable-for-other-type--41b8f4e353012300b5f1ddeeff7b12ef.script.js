gs.log("License usage upgrade: Run fix script of em_unique_nodes table.");

var multipleUpdate = new GlideMultipleUpdate("em_unique_nodes");
multipleUpdate.addQuery("type", "other");
multipleUpdate.addQuery("is_licensable", true);
multipleUpdate.setValue("is_licensable", false);
multipleUpdate.execute();
var counter = multipleUpdate.getUpdateCount();

gs.log("License usage upgrade: Updated " + counter + " records in em_unique_nodes table.");
