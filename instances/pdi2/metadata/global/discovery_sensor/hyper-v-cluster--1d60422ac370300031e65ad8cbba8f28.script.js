new DiscoveryHyperVSensor( {
   processResult: function(result) {
	   
	  //First, look for Virtual Machine resources  
	  var recList = g_array_util.ensureArray(result.MSCluster_Resource);
	  var isHyperVClustering = false;
	  for(var i = 0; i < recList.length; i++) {
		  if((""+recList[i].Type).indexOf("Virtual Machine") > -1) {
			  isHyperVClustering = true;
			  break;
		  }
	  }
	  
	  //Cluster identification based on name.
	  var myName = (""+this.serverCI.name).toLowerCase();
	  match = /([^\.]*)\..*/.exec(myName);
	  if(match && match[1])
		  myName = match[1]; //strip out domain suffix if it's there
	   
	   
	  //Pull in the cluster->node[] map from payload   
	  var clusterToNode = {};
	  var ctnList = g_array_util.ensureArray(result.MSCluster_ClusterToNode);
	  
	  for(var i = 0; i < ctnList.length; i++) {		   
		   var cluster = ""+ctnList[i].Antecedent;
		   var node = ""+ctnList[i].Dependent;
		   
		  //Dependent/Antecedent values have form of Something.Name="StuffWeCareAbout"
		  //So pull it out with regex
		   var regex = /\.Name="([^"]*)"/
		   var match = regex.exec(cluster);
		   if(match)
			   cluster = match[1].toLowerCase();
		   match = regex.exec(node);
		   if(match)
			   node = match[1].toLowerCase();
		   
		   if(!clusterToNode[cluster])
			   clusterToNode[cluster] = [];
		   clusterToNode[cluster].push(node);
	   }
	   
	   //Create/update any clusters we've found, and link up this hyper-v server.
	   for(var cluster in clusterToNode) {
		   //Try to find the cluster
		   var hvClusterGr = new GlideRecord("cmdb_ci_hyper_v_cluster");
		   hvClusterGr.addQuery("name", cluster);
		   hvClusterGr.query();
		   
		   var gdt = new GlideDateTime();
		   
		   if(isHyperVClustering) {
			   if(!hvClusterGr.next()) {
				   hvClusterGr.initialize();
				   hvClusterGr.name = cluster;
				   hvClusterGr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
				   hvClusterGr.first_discovered = gdt;
				   hvClusterGr.insert();
			   }
			   
			   //Link up the windows cluster record
			   var winClusterGr = new GlideRecord("cmdb_ci_win_cluster");
			   winClusterGr.addQuery("name", cluster);
			   winClusterGr.query();
			   if(winClusterGr.next())
				   hvClusterGr.win_cluster = winClusterGr.getUniqueValue();
			   
			   if (JSUtil.nil(hvClusterGr.first_discovered))
				   hvClusterGr.first_discovered = hvClusterGr.sys_created_on;
			   
			   hvClusterGr.last_discovered = gdt;
			   hvClusterGr.update();
			   
					   
			   //Create/update relationship to this node
			   for(var i=0; i < clusterToNode[cluster].length; i++) {
				   var node = clusterToNode[cluster][i];
				   //is it me?
				   if(node == myName) {
					   g_disco_functions.createRelationshipIfNotExists(hvClusterGr, this.serverCI, "Members::Member of");
					   break;
				   }
			   }
		   }
		   else { //Didn't detect Hyper-v cluster
			   if(hvClusterGr.next())
				   hvClusterGr.deleteRecord();
		   }
	   }
	  
   }
   
});
