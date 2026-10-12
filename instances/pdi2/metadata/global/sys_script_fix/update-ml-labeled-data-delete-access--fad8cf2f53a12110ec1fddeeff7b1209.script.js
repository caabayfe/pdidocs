 if (!pm.isZboot()) {
     var dbObj = new GlideRecord("sys_db_object");
     dbObj.addQuery("name", "ml_labeled_data");
     dbObj.query();
     if (dbObj.next()) {
         dbObj.setValue("delete_access", true);
         dbObj.update();
         gs.log("Enable Delete access for ML Labeled Data table ");
     }
 }
