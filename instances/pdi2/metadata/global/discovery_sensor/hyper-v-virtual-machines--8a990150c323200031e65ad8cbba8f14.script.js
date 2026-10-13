new DiscoveryHyperVSensor( {
   processResult: function(result) {
	   //objectDataMap will map VM UUID's to CI Objects
	   var objectDataMap = {};
	   var ciObj;
	   var vmInstanceId;
	   var i;
	   
	   // Iterate through the computer objects and create a ciObj for each VM
	   var computerList = g_array_util.ensureArray(result.Msvm_ComputerSystem);
	   for(i = 0; i < computerList.length; i++) {
		  var computer = computerList[i];
		  
		  ciObj = {};
		  if(computer.Description == "Microsoft Virtual Machine") {
			 ciObj.object_id = computer.Name; 
			 ciObj.name = computer.ElementName;
		     ciObj.state = this._translateVmState(computer.EnabledState);
			 ciObj.nics = 0;
			 ciObj.server = this.serverCI.getUniqueValue();
			 objectDataMap[ciObj.object_id] = ciObj;
		  }
	   }
	   
	   //Iterate through memory objects and update ciObj.memory field
	   var memoryList = g_array_util.ensureArray(result.Msvm_MemorySettingData);
	   for(i = 0; i < memoryList.length; i++) {
		  var memory = memoryList[i];
		  vmInstanceId = this._extractVmId(memory.InstanceID);
		  
		  ciObj = objectDataMap[vmInstanceId];
		  if(ciObj)
		  	ciObj.memory = memory.VirtualQuantity;
	   }
	   
	   //Iterate through processor objects and update ciObj.cpus field
	    var processorList = g_array_util.ensureArray(result.Msvm_ProcessorSettingData);
	   for(i = 0; i < processorList.length; i++) {
		  var processor = processorList[i];
		  vmInstanceId = this._extractVmId(processor.InstanceID);
		  
		  ciObj = objectDataMap[vmInstanceId];
		  if(ciObj)
		  	ciObj.cpus = processor.VirtualQuantity;
	   }
	   
	   //Iterate through nic objects and update ciObj.nics field
	   var nicList = g_array_util.ensureArray(result.Msvm_SyntheticEthernetPortSettingData);
	   for(i = 0; i < nicList.length; i++) {
		  var nic = nicList[i];
		  vmInstanceId = this._extractVmId(nic.InstanceID);
		  if(nic.ElementName != "Network Adapter") 
			 continue;
		  
		  ciObj = objectDataMap[vmInstanceId];
		  if(ciObj)
		  	ciObj.nics++;
	   }
	   
	   //Iterate through disk objects and update ciObj.disks and disks_size fields
	   var hdList = g_array_util.ensureArray(result.Msvm_LogicalDisk);
	   for(i = 0; i < hdList.length; i++) {
		  var hd = hdList[i];
		  vmInstanceId = hd.SystemName;
		  if(hd.ElementName != "Hard Disk Image") 
			 continue;
		  
		  var blockCount = hd.NumberOfBlocks;
		  var blockSize = hd.BlockSize;
		  
		  ciObj = objectDataMap[vmInstanceId];
		  if(ciObj) {
			 if(!ciObj.disks)
				ciObj.disks = 0;
			 if(!ciObj.disks_size)
				ciObj.disks_size = 0;
			 
			 ciObj.disks++;
			 ciObj.disks_size += (blockCount * blockSize)/(1024*1024*1024);
		  }
	   }
	   for (vmInstanceId in objectDataMap) {
		   ciObj = objectDataMap[vmInstanceId];
		   if (ciObj.disks_size)
			   ciObj.disks_size = Math.round(ciObj.disks_size) || 0;
	   }

	   //Grab serial numbers
	   var vssList = g_array_util.ensureArray(result.Msvm_VirtualSystemSettingData);
	   for(i = 0; i < vssList.length; i++) {
		  var vss = vssList[i];

		  // If we cannot correlate to a specific CI, no point in going further.
		  if (JSUtil.nil(vss.InstanceID))
			continue;

		  vmInstanceId = this._extractVmId(vss.InstanceID);
		  // If we run into a case where trailing backslash is missing,
		  // help the regex extract the VmId in cases as different as:
		  // "Microsoft:87B6F8E3-3545-4CE4-A268-3A3D2DBE6C53\b637f346-6a0e-4dec-af52-bd70cb80a21d\0"
		  //   and
		  // "Microsoft:87B6F8E3-3545-4CE4-A268-3A3D2DBE6C53".
		  if (JSUtil.nil(vmInstanceId))
			vmInstanceId = this._extractVmId(vss.InstanceID + '\\');

		  ciObj = objectDataMap[vmInstanceId];

		  if(ciObj) {
			 ciObj.baseboard_serial = vss.BaseBoardSerialNumber;
			 ciObj.bios_serial = vss.BIOSSerialNumber;
			 ciObj.chassis_serial = vss.ChassisSerialNumber;
			 
			 if(!JSUtil.nil(vss.BIOSGUID))
				ciObj.bios_guid = (''+vss.BIOSGUID).replace(/[{}]/g, "");
		  }
	   }
	   
	   var discoveredVms = [];
	   
	   // Create/update the CI's for each ciObj we built
	   for(var objId in objectDataMap) {
		  var oldServerId = null;
		  var currentServerId = this.serverCI.getUniqueValue()+'';
		  var changedServer = false;
		  
		  var objectData = objectDataMap[objId];  
		  var doUpdate = true;
		  var gr = new GlideRecord("cmdb_ci_hyper_v_instance");
		  gr.addQuery("object_id", objId);
		  gr.addQuery("server", this.serverCI.getUniqueValue());
		  gr.query();
		  
		  if(!gr.next()) {
			 gr = new GlideRecord("cmdb_ci_hyper_v_instance");
			 gr.addQuery("object_id", objId+'');
			 gr.addQuery("name", objectData.name+'');
			 gr.query();
			 if(!gr.next()) {
				//No record for this object_id, do an insert when all is said and done
				doUpdate = false;
				gr.initialize();
			 } else {
				//The server changed, we need to update the CI and update its relationships with server, Setting the changedServer flag so we can do updates later
				oldServerId = gr.getValue("server")+'';
				changedServer = (oldServerId != currentServerId);
			 }			 
		  }
		  
		  for (var name in objectData) {
			 gr[name] = objectData[name];
		  }
		   
		  var gdt = new GlideDateTime();
		  gr.last_discovered = gdt;
		  var discoverySource = gs.getProperty('glide.discovery.source_name', "ServiceNow");
		  gr.discovery_source = discoverySource;
		  gr.location = this.serverCI.getValue('location');
		  
		  if(doUpdate) {
			 if (JSUtil.nil(gr.first_discovered))
				 gr.first_discovered = gr.sys_created_on;
			  
			 gr.update();
		  }
		  else {
			 gr.first_discovered = gdt;
			 gr.insert();
		  }

		  // update sys_object_source
		  var os = new ObjectSource(discoverySource, gr.sys_class_name, gr.sys_id);
		  os.setValue("last_scan", gdt.getDisplayValue());
		  os.process();
		  
		  if(changedServer) {
			 //Server is changed instead of creating new relationship, updating the existing relationships
			 this.updateExistingRelChildOrCreateNew(gr, oldServerId, this.serverCI.getUniqueValue()+'', "Registered on::Has registered");
			 this.createInstantiatedByRel(gr, oldServerId);
		  } else {
			 //Make sure the registered-on relationship exists
			 g_disco_functions.createRelationshipIfNotExists(gr, this.serverCI, "Registered on::Has registered");
			 
			 //And the instantiated-by relationship:
			 this.createInstantiatedByRel(gr);
		  }
		  
		  //Keep track of the discovered vms for reconciliation below
		  discoveredVms.push(""+gr.getUniqueValue());
	   }
	   
	   //Remove any instances that have been deleted since the last discovery
	   var relGr = new GlideRecord("cmdb_rel_ci");
	   relGr.addQuery("type", "aa9434870ab301544ce2943bf03fd7a8"); //Registered on
	   relGr.addQuery("parent", "NOT IN", discoveredVms);
	   relGr.addQuery("child", this.serverCI.getUniqueValue());
	   relGr.query();
	   
	   var toDelete = [];
	   while(relGr.next()) {
		  toDelete.push(""+relGr.parent);
	   }
	   
	   var instanceGr = new GlideRecord("cmdb_ci_hyper_v_instance");
	   instanceGr.addQuery("sys_id", toDelete);
	   instanceGr.query();
	   instanceGr.deleteMultiple();
    },
	
	updateExistingRelChildOrCreateNew: function(parent, oldChild, newChild, rel) {
		var existingRel = g_disco_functions.relationshipExists(parent, oldChild, rel);
		if(!existingRel)
			return g_disco_functions.createRelationshipIfNotExists(parent, newChild, rel);
		existingRel.child = newChild;
		existingRel.update();
	},
   
    createInstantiatedByRel: function(instanceGr, oldServerId) {
	   //First, look at serial_number for computer CI's
	   var gr = new GlideRecord("cmdb_ci_computer");
	   gr.initialize();
	   gr.addQuery("serial_number", [instanceGr.chassis_serial, instanceGr.bios_serial, instanceGr.baseboard_serial]);
	   gr.query();
	   if(gr.next()) {
		  g_disco_functions.createRelationshipIfNotExists(gr, instanceGr, "Instantiates::Instantiated by");
		  //If we get an oldServerId we try to update the relationship if it exists or create new one if it doesn't
		  if(oldServerId)
			 this.updateExistingRelChildOrCreateNew(gr, oldServerId, this.serverCI.getUniqueValue()+'', "Virtualized by::Virtualizes");
		  else
			 g_disco_functions.createRelationshipIfNotExists(gr, this.serverCI, "Virtualized by::Virtualizes");
		  gr.virtual = true;
		  gr.update();
		  return;
	   }
	   
	   //Now, check the serial number table
	   gr = new GlideRecord("cmdb_serial_number");
	   
	   var fieldTypePairs = [
		  ["chassis_serial", "chassis"],
		  ["bios_serial", "bios"],
		  ["baseboard_serial", "baseboard"],
		  ["bios_guid", "uuid"]];
	   
	   for(var i=0; i < fieldTypePairs.length; i++) {
		  var fieldAndType = fieldTypePairs[i];
		  
		  gr.initialize();
		  gr.addQuery("serial_number", instanceGr[fieldAndType[0]]);
		  gr.addQuery("serial_number_type", fieldAndType[1]);
		  gr.query();
		  if(gr.next()) {
			 g_disco_functions.createRelationshipIfNotExists(gr.cmdb_ci, instanceGr, "Instantiates::Instantiated by");
			 //If we get an oldServerId we try to update the relationship if it exists or create new one if it doesn't
			 if(oldServerId)
				this.updateExistingRelChildOrCreateNew(gr, oldServerId, this.serverCI.getUniqueValue()+'', "Virtualized by::Virtualizes");
			 else
				g_disco_functions.createRelationshipIfNotExists(gr, this.serverCI, "Virtualized by::Virtualizes");
			 gr.cmdb_ci.virtual = true;
			 return; 
		  }
	   }
    },
   
    _extractVmId: function(instanceId) {
	   var instanceIdRegex = /Microsoft:([^\\]*)\\.*$/;
	   var match = instanceIdRegex.exec(instanceId);
	   return match ? match[1] : null;
    },
   
   _translateVmState: function(fromWmi) {
	  //http://msdn.microsoft.com/en-us/library/cc136822(v=vs.85)
	  return {
		 0:"stuck", //Unknown
		 2:"on", //Enabled (running)
		 3:"off", //Disabled (turned off)
		 32768:"suspended", //Paused
		 32769:"suspended", //Suspended (saved state)
		 32770:"changing", //Starting (transition: disabled/suspended -> enabled)
		 32771:"changing", //Snapshotting 
		 32773:"changing", //Saving (transition: enabled -> suspended)
		 32774:"changing", //Stopping (transition: enabled -> disabled)
		 32776:"changing", //Pausing (transition: enabled -> paused)
		 32777:"changing"  //Resuming (transition: paused -> enabled)
	  }[fromWmi];
   },
   
    type: "DiscoverySensor"
});
