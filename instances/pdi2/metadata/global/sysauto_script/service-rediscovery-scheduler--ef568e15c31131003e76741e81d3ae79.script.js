var man = new SNC.RediscoveryManager();
man.submitDiscoveryTasks(GlideProperties.getInt("sa.rediscovery.batch_size",20));
