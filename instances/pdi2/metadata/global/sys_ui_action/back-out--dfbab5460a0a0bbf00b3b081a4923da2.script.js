backOut();
function backOut() { 
    action.setRedirectURL(current);
    var baseline = new GlideRecord("sys_update_set");
    baseline.query("name", "Baseline");
    baseline.next();
    
    var gr2 = new GlideRecord("sys_update_xml");
    gr2.addNotNullQuery("update_set");
    gr2.addQuery("update_set","!=", baseline.sys_id +"");
    gr2.addQuery("target_name",current.target_name +"");
    gr2.orderBy("sys_created_on");
    gr2.query();
    var payload2 = "";
    while (gr2.next()) {
      if (gr2.update_set == current.update_set) {
         if (payload2 == "") {
            gr2 = new GlideRecord("sys_update_xml");
            gr2.addQuery("update_set", baseline.sys_id +"");
            gr2.addQuery("target_name",current.target_name);
            gr2.query();
            gr2.next();
            payload2 = gr2.payload;
         }

         break;
      } else 
         payload2 = gr2.payload +"";
    }      
    var updateManager = new GlideUpdateManager2();
    updateManager.loadXML(payload2);
   
    current.disposition = "5";
    current.update();
    
}
