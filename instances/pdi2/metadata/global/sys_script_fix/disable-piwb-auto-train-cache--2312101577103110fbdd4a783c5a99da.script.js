 var propName = "piwb.instance_eligible_auto_train";
 var fieldName = "ignore_cache";
 var propGr = new GlideRecord('sys_properties');
 propGr.addQuery('name', propName);
 propGr.query();
 if (propGr.hasNext()) {
     while (propGr.next()) {
         if (propGr.getValue(fieldName) == "0") {
             propGr.setValue(fieldName, "1");
             propGr.update();
             gs.info("prop:" + propName + " is not ignore cache, update to true");
         } else {
             gs.info("prop:" + propName + " is already ignore cache, skip");
         }
     }
 } else {
     gs.info("prop:" + propName + " not exist, skip update");
 }
