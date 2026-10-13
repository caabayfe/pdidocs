new DiscoveryHyperVSensor( {
   processResult: function(result) {
	  
	  //Scan the reported list and create/update virtual networks
	  var rpList = g_array_util.ensureArray(result.Msvm_ResourcePool);
	  
	  if(rpList.length > 0)
	  {
		  //Get the resource pool record for this hyper-v server
		  var rpGr = new GlideRecord("cmdb_ci_hyper_v_resource_pool");
		  rpGr.addQuery("server", this.serverCI.sys_id);
		  rpGr.query();
		  
		  var gdt = new GlideDateTime();
			  
		  if(!rpGr.next()) {
			  //Doesn't exist yet; create it:
			  rpGr.initialize();
			  rpGr.name = "Primordial";
			  rpGr.server = ""+this.serverCI.sys_id;
			  rpGr.last_discovered = gdt;
			  rpGr.first_discovered = gdt;
			  rpGr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
			  rpGr.insert();
		  } else {
			  if (JSUtil.nil(rpGr.first_discovered))
				  rpGr.first_discovered = rpGr.sys_created_on;
			  
			  rpGr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
			  rpGr.last_discovered = gdt;
			  rpGr.update();
		  }
		  //resource pool --Defines-resources-for--> server
		  g_disco_functions.createRelationshipIfNotExists(rpGr, this.serverCI, "Defines resources for::Gets resources from");
		  
		  //Build the list of resource pool components for this pool
		  for(var i = 0; i < rpList.length; i++) {
			 var rpc = rpList[i];
			 var name = rpc.Name;
			 var objectId = this.extractUuid(rpc.InstanceID);
			 var capacity = rpc.Capacity;
			 var allocationUnits = rpc.AllocationUnits;
			 var resourceType = rpc.ResourceSubType;
			 
			 if(JSUtil.nil(name)) {
				name = '[' + resourceType + " on " + this.serverCI.name + "]"; 
			 } 
			  
			 var doUpdate = true;
			 var rpcGr = new GlideRecord("cmdb_ci_hyper_v_rpool_comp");
			 rpcGr.addQuery("object_id", objectId);
			 rpcGr.addQuery("resource_pool", rpGr.sys_id);
			 rpcGr.query();
			  
			 if(!rpcGr.next()) {
				doUpdate = false;
				rpcGr.initialize();
				rpcGr.object_id = objectId;
				rpcGr.resource_pool = ""+rpGr.sys_id;
			 }
			  
			 rpcGr.name = name;
			 rpcGr.capacity = capacity;
			 rpcGr.allocation_units = allocationUnits;
			 rpcGr.resource_type = resourceType;
			 
			 if(doUpdate)
				rpcGr.update();
			 else
				rpcGr.insert();
		  }
   	}
	  
   }
   
});
