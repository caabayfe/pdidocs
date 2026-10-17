new DiscoveryHyperVSensor( {
   processResult: function(result) {
	  
	  //Holds a list of virtual networks that were reported to us 
	  var reportedNetworkSysIds = [];
	  
	  //Holds a mapping of hyper-v virtual network uuid to our corresponding sys_id:
	  var virtualNetworkUuidToSysId = {};
	  
	  //Holds [vm + virtual network] sys_id pairs - the reported "connected-by" relationships
	  var vmNetworkRelationships = {};
	  	  
	  //Scan the reported list and create/update virtual networks
	  var vsList = g_array_util.concat(g_array_util.ensureArray(result.Msvm_VirtualSwitch), g_array_util.ensureArray(result.Msvm_VirtualEthernetSwitch));
	  for(var i = 0; i < vsList.length; i++) {
		 var name = vsList[i].ElementName;
		 var objectId = vsList[i].Name;
		 
		 var doUpdate = true;
		 var networkGr = new GlideRecord("cmdb_ci_hyper_v_network");
		 networkGr.addQuery("object_id", objectId);
		 networkGr.query();
		 
		 if(!networkGr.next()) {
			doUpdate = false;
			networkGr.initialize();			
			networkGr.object_id = objectId;
		 }
		 
		 networkGr.name = name;
		  
		 var gdt = new GlideDateTime();
		 networkGr.last_discovered = gdt;
		 networkGr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
		  
		 if(doUpdate) {
			if (JSUtil.nil(networkGr.first_discovered))
				networkGr.first_discovered = networkGr.sys_created_on;
			 
			networkGr.update();
		 }
		 else {
			networkGr.first_discovered = gdt;
			networkGr.insert();
		 }
		 
		 //network --provided-by--> server
		 g_disco_functions.createRelationshipIfNotExists(networkGr, this.serverCI, "Provided By::Provides");
		 
		 //Some book-keeping for reconciliation and such
		 var networkSysId = ""+networkGr.getUniqueValue();
		 reportedNetworkSysIds.push(networkSysId);
		 virtualNetworkUuidToSysId[objectId] = networkSysId;
	  }
	  
	  //Link up the VM instances to the virtual switches
	  var connList = g_array_util.ensureArray(result.Msvm_ActiveConnection);	  
	  for(var i = 0; i < connList.length; i++) {
		 var machineUuid = this._parseSystemName(connList[i].Dependent);
		 var networkUuid = this._parseSystemName(connList[i].Antecedent);
		 
		 var vmGr = new GlideRecord("cmdb_ci_hyper_v_instance");
		 vmGr.addQuery("object_id", machineUuid);
		 vmGr.addQuery("server", this.serverCI.getUniqueValue());
		 vmGr.query();
		 
		 if(vmGr.next() && virtualNetworkUuidToSysId[networkUuid]) {
			//instance --connected-by--> network
			g_disco_functions.createRelationshipIfNotExists(vmGr, virtualNetworkUuidToSysId[networkUuid], "Connected by::Connects"); 
			
			//Remember the relationship for reconciliation later
			vmNetworkRelationships[vmGr.getUniqueValue()+"_"+virtualNetworkUuidToSysId[networkUuid]] = true;
		 }
	  }
	  
	  //Clean up virtual networks for this hyper-v server
	  //network --provided-by--> server
	  var relGr = new GlideRecord("cmdb_rel_ci");
	  relGr.addQuery("child", this.serverCI.getUniqueValue());
	  relGr.addQuery("type", "4afd799338a02000c18673032c71b817"); //Provided By::Provides
	  relGr.query();
	  while(relGr.next()) {
		 if(!virtualNetworkUuidToSysId[""+relGr.parent.object_id]) {
			//This virtual network must've been deleted
			var networkGr = new GlideRecord("cmdb_ci_hyper_v_network");
			networkGr.get(""+relGr.parent);
			networkGr.deleteRecord();
		 }
	  }
	  
	  //Clean up connected-by relationships
	  //instance --connected-by--> network
	  relGr.initialize();
	  relGr.addQuery("child", reportedNetworkSysIds);
	  relGr.addQuery("type", "3deab95338a02000c18673032c71b876"); //Connected by::Connects
	  relGr.query();
	  while(relGr.next()) {
		 var thisOne = relGr.parent+"_"+relGr.child;
		 if(!vmNetworkRelationships[thisOne]) {
		 	relGr.deleteRecord();
		 }
	  }
   },
   
   _parseSystemName: function(idString) {
	  var regex = /SystemName="(.+)"/;
	  var result = regex.exec(idString);
	  return result ? result[1] : null;
   }
   
});
