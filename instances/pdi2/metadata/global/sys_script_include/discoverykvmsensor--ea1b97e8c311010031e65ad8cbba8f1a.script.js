var DiscoveryKvmSensor = Class.create();
DiscoveryKvmSensor.prototype = Object.extendsObject(DiscoveryVirshSensor, {
    prepare: function() {
    	this.setTables("cmdb_ci_kvm", 
					   "cmdb_ci_kvm_vm_instance", 
					   "cmdb_kvm_device", 
					   "cmdb_ci_kvm_network",
					   "cmdb_ci_kvm_storage_pool", 
					   "cmdb_ci_kvm_storage_volume");
	},
	
    type: 'DiscoveryKvmSensor'
});
