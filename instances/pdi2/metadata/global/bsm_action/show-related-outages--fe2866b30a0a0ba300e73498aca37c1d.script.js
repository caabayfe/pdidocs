/**
  * Show the list of outages for this CI
 **/ 

showOutageList(this);

function showOutageList(node) {
   var w = new GlidePane("show_list", "cmdb_ci_outage_list");
   w.setTitle("Related Outages");
   w.addParm('table', 'cmdb_ci_outage_list');
   w.addParm('sysparm_view', 'bsm');
   var query = 'cmdb_ci=' + node.getID();
   w.addParm('sysparm_query', query);
   w.render();
}
 
