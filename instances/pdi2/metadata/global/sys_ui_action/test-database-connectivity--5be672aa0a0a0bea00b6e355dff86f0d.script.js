var gr = new GlideRecord("ha_connectivity_test");
gr.state = 1;
gr.message = "Starting";
gr.target_database = current.sys_id;
gr.cluster_node = GlideClusterSynchronizer.get().getClusterStateSysID()
var tid = gr.insert();

gs.setRedirect("ha_connectivity_test_list.do?sysparm_query=sys_id=" + tid);
