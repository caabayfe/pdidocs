var ServiceAvailabilityDomainMigration = Class.create();
ServiceAvailabilityDomainMigration.prototype = {
    initialize: function() {
    },
	start: function() {
        gs.log("Starting migration of service availability domain data");
		this.migrateToSysDomain('service_offering_commitment');
		this.migrateToSysDomain('service_availability');
	},
	migrateToSysDomain: function(table) {
        //make sure column exits
        if (!GlideTableDescriptor.get(table).isValidField('sys_domain'))
            return false;

        this.removeAttribute(table);
    
        try {
            if (GlidePluginManager.isActive('com.glide.domain')) {
                var gaUniqueOfferings = new GlideAggregate(table);
                gaUniqueOfferings.addQuery('service_offering.sys_domain','!=', 'global');
                gaUniqueOfferings.addAggregate('COUNT');
                gaUniqueOfferings.groupBy('service_offering');
                gaUniqueOfferings.query();

                try {
                    while(gaUniqueOfferings.next()) {
                        var sysIds = [];
                        var grGetIds = new GlideRecord(table);
                        grGetIds.addQuery('sys_domain', 'global');
                        grGetIds.addQuery('service_offering', gaUniqueOfferings.service_offering);
                        grGetIds.query();
            
                        while(grGetIds.next()) {
                            sysIds.push(grGetIds.getUniqueValue());

                            if (sysIds.length > 1000 || !grGetIds.hasNext()) {
                                var gr = new GlideRecord(table);
                                gr.addQuery('sys_id', sysIds);
                                gr.setValue('sys_domain', gaUniqueOfferings.service_offering.sys_domain);
                                gr.setValue('sys_domain_path', gaUniqueOfferings.service_offering.sys_domain_path);
                                gr.updateMultiple();
                                sysIds = [];
                            }
                        }

                    }
                }
                catch(error) {
                    gs.log(error);
                }
            }
            gs.log("Successfully migrated domain data for " +  table);
        }
        catch(error) {
            gs.log(error);
        }
    },
    removeAttribute: function(table) {
        var grDictionary = new GlideRecord('sys_dictionary');
        grDictionary.addQuery('name', table);
        grDictionary.addQuery('internal_type', 'collection');
        grDictionary.query();

        if (grDictionary.next()) {
            var ga = new GlideAttributes(grDictionary.getValue('attributes'));
            ga.removeAttribute('domain_master');
            grDictionary.setValue('attributes', ga.serializeAttributes());
            grDictionary.update();
        }
    },

    type: 'ServiceAvailabilityDomainMigration'
};
