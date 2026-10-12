var TaskOfferingSNC = Class.create();
TaskOfferingSNC.prototype = {
    initialize: function() {},

    canPopulateServiceOfferings: function(table) {
        if (!table)
            return false;

        return (gs.getProperty("com.snc." + table + ".populate_service_offering", "false") + "" === "true");
    },

    removeServiceOffering: function(taskSysId) {
        if (!taskSysId)
            return;

        var m2m = new GlideRecord('task_service_offering');
	m2m.addQuery('task', taskSysId);
	m2m.addQuery('manually_added', false);
	m2m.query();
	m2m.deleteMultiple();
    },

    addServiceOffering: function(taskSysId, services) {
        if (!taskSysId)
            return;

        var manualAddedOfferings = new TaskUtils().getManuallyAddedRecords(taskSysId, 'task_service_offering', 'service_offering');
        var offerings = this.getOfferings(services);

        if (manualAddedOfferings.length > 0) {
            offerings = offerings.filter(function(el) {
                return manualAddedOfferings.indexOf(el) === -1;
            });
        }

        var m2m = new GlideRecord('task_service_offering');
        for (var i = 0; i < offerings.length; i++) {
            m2m.initialize();
            m2m.setValue('task', taskSysId);
            m2m.setValue('service_offering', offerings[i]);
            m2m.setValue('manually_added', false);
            m2m.insert();
        }
    },

    getOfferings: function(services) {
        var offeringGr = new GlideRecord('service_offering');
        offeringGr.addQuery('parent', "IN", services);
        offeringGr.query();

        var offeringArr = [];
        while (offeringGr.next())
            offeringArr.push(offeringGr.getUniqueValue());

        return offeringArr;
    },

    type: 'TaskOfferingSNC'
};
