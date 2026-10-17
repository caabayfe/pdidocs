var AVMWareVMProbe = Class.create();

AVMWareVMProbe.prototype = Object.extendsObject(AVMWareProbe, {

    getVM : function(name) {
        if (!this.serviceInstance) {
            var err = "Not connected to a vCenter instance";
            ms.log(err);
            this.setError(err);
            return;
        }

        var rootFolder = this.serviceInstance.getRootFolder();
        var vm = new vim25.mo.InventoryNavigator(rootFolder).searchManagedEntity("VirtualMachine", name); 

        if (!vm) {
            var err = "VM " + name + " could not be found";
            ms.log(err);
            this.setError(err);
            return;
        }

        return vm;
    },

    getVMByUuid : function(uuid) {
        if (!this.serviceInstance) {
            var err = "Not connected to a vCenter instance";
            ms.log(err);
            this.setError(err);
            return;
        }

        var rootFolder = this.serviceInstance.getRootFolder();
        var vm = null;

        // This portion of code is ported from the VIJava API from the searchManagedEntity that is optimized for searching on name
        var ocs = this.retrieveObjectContents(rootFolder, [["VirtualMachine", "config.uuid",], ]);

        if (ocs && ocs.length > 0) {
            for (var i = 0; i < ocs.length; i++) {
                var propSet = ocs[i].getPropSet();
	
                if (propSet && propSet.length > 0) {
                    var uuidInPropSet = propSet[0].getVal();
                    if (uuid.equalsIgnoreCase(uuidInPropSet)) {
                        var mor = ocs[i].getObj();
                        vm = vim25.mo.util.MorUtil.createExactManagedEntity(rootFolder.getServerConnection(), mor);
                    }
                }
            }
        }

        if (!vm) {
            var err = "VM with uuid " + uuid + " could not be found";
            ms.log(err);
            this.setError(err);
            return;
        }

        return vm;
    },
	
	//retrieve a unique VM based on the VM instanceuuid or the combination of uuid and objectId
	getUniqueVM : function(instanceUuid, uuid, objectId){
		if (!this.serviceInstance) {
            var err = "Not connected to a vCenter instance";
            ms.log(err);
            this.setError(err);
            return;
        }

        var rootFolder = this.serviceInstance.getRootFolder();
        var vm = null;

		var ocs = this.retrieveObjectContents(rootFolder, [["VirtualMachine", "config.uuid", "config.instanceUuid"], ]);		

        if (ocs && ocs.length > 0) {
            for (var i = 0; i < ocs.length; i++) {
                var propSet = ocs[i].getPropSet();
	
                if (propSet && propSet.length > 0) {
                    var uuidInPropSet = propSet[1].getVal();
					var instanceUuidInPropSet = propSet[0].getVal();
					if (instanceUuid) {
						if (!instanceUuid.equalsIgnoreCase(instanceUuidInPropSet))
							continue;
						var mor = ocs[i].getObj();
                        vm = vim25.mo.util.MorUtil.createExactManagedEntity(rootFolder.getServerConnection(), mor);
						break;							
					}
                    else if (uuid.equalsIgnoreCase(uuidInPropSet)) {
                        var mor = ocs[i].getObj();
                        vm = vim25.mo.util.MorUtil.createExactManagedEntity(rootFolder.getServerConnection(), mor);
						var morid = vm.getMOR().val;
						
						if (objectId && objectId != morid)
							vm = null;
						else
							break;
                    }
                }
            }
        }

        if (!vm) {
            var err = "VM could not be found. Check VM instanceUuid or CorrelationId and MOR Id";
            ms.log(err);
            this.setError(err);
            return;
        }

        return vm;
	},

    getUuidsForVMName : function(name) {
        if (!this.serviceInstance) {
            var err = "Not connected to a vCenter instance";
            ms.log(err);
            this.setError(err);
            return;
        }

        var rootFolder = this.serviceInstance.getRootFolder();
        var vm = null;

        // This portion of code is ported from the VIJava API from the searchManagedEntity that is optimized for searching on name, except
        // now instead of returning when we find the first one, we return the UUID for each VM that has the name
        var ocs = this.retrieveObjectContents(rootFolder, [["VirtualMachine", "name",], ]);

        var uuids = [];
        if (ocs && ocs.length > 0) {
			var vmName = this._encodeVMName(name);
            for (var i = 0; i < ocs.length; i++) {
                var propSet = ocs[i].getPropSet();
				if (propSet.length > 0) {
                    var nameInPropSet = '' + propSet[0].getVal();
			// vmName is javascript string now. use the javascript function to compare
                    if (vmName.toUpperCase() == nameInPropSet.toUpperCase()) {
                        var mor = ocs[i].getObj();
                        vm = vim25.mo.util.MorUtil.createExactManagedEntity(rootFolder.getServerConnection(), mor);
                        uuids.push(vm.getConfig().getUuid());
                    }
                }
            }
        }

        return uuids;
    },

    handleTask : function(task, action, name) {
        if (!task.waitForMe().equals(vim25.mo.Task.SUCCESS)) {
            var err = "Failed to execute task:" + action + ", " + name;
            ms.log(err);
            this.setError(err);
            return false;
        }
        return true;
    },

    /**
     * This code is ported from the VIJava API to help optimize the lookup of a VM by its uuid
     */
    retrieveObjectContents : function(rootEntity, typeinfo) {
        var selectionSpecs = null;
        if (!typeinfo || typeinfo.length == 0)
            return null;

        var pc = this.serviceInstance.getPropertyCollector();

        if (!selectionSpecs) {
            var ai = this.serviceInstance.getAboutInfo();
            selectionSpecs = ai.apiVersion.startsWith("4") ? vim25.mo.util.PropertyCollectorUtil.buildFullTraversalV4() : vim25.mo.util.PropertyCollectorUtil.buildFullTraversal();
        }

        var propspecary = vim25.mo.util.PropertyCollectorUtil.buildPropertySpecArray(typeinfo);	

        var os = new vim25.ObjectSpec();
        os.setObj(rootEntity.getMOR());
        os.setSkip(false);
        os.setSelectSet(selectionSpecs);
		
        var spec = new vim25.PropertyFilterSpec();
        spec.setObjectSet([os]);
        spec.setPropSet(propspecary);
		
        return pc.retrieveProperties([spec]);
    },
	_encodeVMName : function (name){
		if ( JSUtil.nil(name) )
			return name;
		// the vSphere name is partially encoded. By now, the '/', '%' and '\' are encoded, space and other special chars are still kept.
		// By using decodeURIComponent and decodeURI method, the 'test w/o confg' just return part after /
		// They have the different behavior from brwoser. It may be related to javascript version supported in Rhino.
		// It should be modified after change.
			var regs = [  
					    [new RegExp('\\%', 'g'), '%25'], // must be the first one
						[new RegExp('\/', 'g'), '%2f'],
						[new RegExp('\\\\', 'g'), '%5c']
					   ];
			var vmName = ''+name;
			for(var i=0; i < regs.length; i++)
				vmName = vmName.replace(regs[i][0], regs[i][1]);
			return vmName;
	},
    type : "AVMWareVMProbe",
});
