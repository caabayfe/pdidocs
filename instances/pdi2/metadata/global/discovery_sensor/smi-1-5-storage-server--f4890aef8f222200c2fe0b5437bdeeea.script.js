var DiscoverySmiStorageServerSensor = Class.create();

DiscoverySmiStorageServerSensor.prototype = Object.extendsObject(CimSensor, {
	process: function() {
		DiscoverySmi15StorageServerSensor.process(this, output);
                this.triggerProbes(undefined, { }, [ 'namespace' ]);

	},
	type: 'DiscoverySmiStorageServerSensor'
});

new DiscoverySmiStorageServerSensor();
