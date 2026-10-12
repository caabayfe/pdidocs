var SysClusterAjax = Class.create();

SysClusterAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {

  runScript: function() {
    if (!GlideProperties.getBoolean("glide.cluster.sysclusterajax.allow_run_script", false)) {
        gs.log("SysClusterAjax.runScript is disabled (glide.cluster.sysclusterajax.allow_run_script=false)");
        return;
    }
    if (!gs.hasRole("cluster_node_admin")) {
        gs.log("Missing cluster_node_admin role, skipping");
        return;
    }

    var script = this.getParameter('sysparm_script');
    var node = this.getParameter('sysparm_node');

    GlideClusterMessage.postScript(script, node);         
  },
  
  isPublic: function() {
    return false;
  },

  type: "SysClusterAjax"
});
