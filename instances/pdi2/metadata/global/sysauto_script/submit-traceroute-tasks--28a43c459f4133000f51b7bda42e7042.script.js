var netPathManager = new SNC.NetworkPathManager();
netPathManager.submitTraceRouteTasks(GlideProperties.getInt("sa.traceroute.batch_size",20));
var man = new SNC.RediscoveryManager();
man.updateInfraPaths();
