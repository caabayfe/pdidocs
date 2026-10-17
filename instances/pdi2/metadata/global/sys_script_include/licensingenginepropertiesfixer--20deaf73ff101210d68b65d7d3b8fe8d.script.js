var LicensingEnginePropertiesFixer = Class.create();
LicensingEnginePropertiesFixer.prototype = {
    initialize: function() {},

    fixInvalidProperties: function() {
        this._correctDataSourceProperties();
    },

    _correctDataSourceProperties: function() {
        /*
        	There are only two valid states for the following flags.
        	
        	Settings for SMv1: (default/initial setting pre-upgrade/migration)
        	glide.entitlement.surf.routing=true && glide.entitlement.ems.data.available=false

        	Expected for SMv2: (after upgrading/migrating to SMv2)
        	glide.entitlement.surf.routing=false && glide.entitlement.ems.data.available=true

        	However for this version of the code and newer (Washington+) the customer is expected to be on SMv2.
			It is currently believed that defaulting to the SMv2 settings is the safest thing to do in case of an invalid state being detected.
        */
        const dataSourcePropertyFixingEnabled = gs.getProperty('glide.entitlement.datasource.propertyfix.enabled', true).toLowerCase() === 'true';
        const surfRouting = gs.getProperty('glide.entitlement.surf.routing', true).toLowerCase() === 'true';
        const emsDataAvailable = gs.getProperty('glide.entitlement.ems.data.available', false).toLowerCase() === 'true';

        if (dataSourcePropertyFixingEnabled === true && surfRouting === emsDataAvailable) {
            // Setting to the SMv2 state
            gs.setProperty('glide.entitlement.surf.routing', false);
            gs.setProperty('glide.entitlement.ems.data.available', true);
            gs.info('Invalid licensing engine configuration detected. Setting SMv2 values for properties glide.entitlement.surf.routing to false and glide.entitlement.ems.data.available to true.');
        }
    },

    type: 'LicensingEnginePropertiesFixer'
};
