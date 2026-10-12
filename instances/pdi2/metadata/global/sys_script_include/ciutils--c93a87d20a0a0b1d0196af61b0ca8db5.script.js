var CIUtils = Class.create();

CIUtils.prototype = {

    initialize: function() {
        this.maxDepth = gs.getProperty('glide.relationship.max_depth', 10); // how deep to look
        this.currentDepth = 0;

        this.mepAll = new Object(); // list of manual endpoints
        this.services = new Object(); // list of affected services
        this.parents = new Object(); // already checked parents
        this.maxSize = gs.getProperty('glide.relationship.threshold', 1000); // how many records to return
        this.added = 0; // track how many added, since can't get size() for an Object
    },

    /**
     * Determine which business services are affected by a specific CI
     * 
     * Inputs:
     *    id is the sys_id of a configuration item (cmdb_ci)
     *    customValues is an object allowing for maxDepth 
     *        and maxSize to be set individually per function call
     *        Members must be named "maxDepth" and "maxSize"
     *
     * Returns:
     *    an array of sys_id values for cmdb_ci_server records downstream of
     *    (or affected by) the input item
     */

    servicesAffectedByCI: function(id, customValues) {
        var ci = new GlideRecord("cmdb_ci");
        if (ci.get(id)) {
            var maxD = customValues ? (customValues.maxDepth ? customValues.maxDepth : this.maxDepth) : this.maxDepth;
            var maxS = customValues ? (customValues.maxSize ? customValues.maxSize : this.maxSize) : this.maxSize;
            var useV2 = gs.getProperty('glide.cmdb.related.services.use.multilevel.queue.approach', "true");
            if (useV2 === true || useV2 == "true") {
                this.services = SNC.CMDBUtil.getRelatedServicesV2(id, maxD, maxS); // uses multilevel tabled based queue
            } else {
                this.services = SNC.CMDBUtil.getRelatedServices(id, maxD, maxS); // uses in-memory arrayList
            }
        } else {
            return [];
        }

        // Add services associated by service mapping
        this.addServicesAssociatedByServiceMapping(id);
        // convert Java set to javascript array of affected services
        return j2js(this.services);
    },

    /**
     * Add business services associated to the CI by service mapping. Service mapping
     *  maintains service models using the CMDB service model API
     *  Input: 
     *      id - the CI sys_id 
     *  Output:
     *      svcarr - list of associated services 
     */
    addServicesAssociatedByServiceMapping: function(id) {
        if (!GlidePluginManager.isActive('com.snc.service-mapping'))
            return;

        // Add service associations created by service mapping
        var bsm = new SNC.BusinessServiceManager();
        var svcList = bsm.getServicesAssociatedWithCi(id, true);
        for (var iterator = svcList.iterator(); iterator.hasNext();) {
            var svc = iterator.next();
            this._addService(svc, this.services);
        }
    },
    /**
     * Determine which business services are affected by a task
     * 
     * Inputs:
     *    task is a task GlideRecord (e.g., incident, change_request, problem)
     *
     * Returns:
     *    an array of sys_id values for cmdb_ci_server records downstream of
     *    (or affected by) the configuration item referenced by the task's cmdb_ci field
     */

    servicesAffectedByTask: function(task) {
        var id = task.cmdb_ci.toString();
        return this.servicesAffectedByCI(id);
    },

    _addParentServices: function(value, services, currentDepth, customValues) {
        // PRB1452345
        if (value === undefined || value === 'undefined') {
            gs.error("Expected sys_id to be defined, instead found undefined");
            return;
        }
        if (this.parents[value]) // already checked?
            return;
        else this.parents[value] = true;

        //use custom values if provided
        var maxDepth = 0;
        var maxSize = 0;
        if (customValues && customValues.maxDepth && !isNaN(customValues.maxDepth)) {
            maxDepth = customValues.maxDepth;
        } else {
            maxDepth = this.maxDepth;
        }
        if (customValues && customValues.maxSize && !isNaN(customValues.maxSize)) {
            maxSize = customValues.maxSize;
        } else {
            maxSize = this.maxSize;
        }

        if (this.added >= maxSize)
            return;
        else {
            currentDepth++;
            var al = SNC.CMDBUtil.getRelatedRecords(value, "", "cmdb_ci", "cmdb_ci", "child"); // returns ArrayList
            if (al.size() > 0) {
                //collect manual end points
                var mep = new GlideRecord('cmdb_ci_endpoint');
                mep.addQuery('sys_id', al);
                mep.query();
                while (mep.next()) {
                    this.mepAll[mep.sys_id] = true;
                }
                // first add the unique services
                var kids = new GlideRecord('cmdb_ci_service');
                kids.addQuery('sys_id', al);
                kids.query();
				while (kids.next()) {
					var str = kids.sys_id;
					if (!services[str]) {
						this._addService(str, services);
					}
					if (this.added >= maxSize)
						return;
					if (currentDepth < maxDepth)
						this._addParentServices(str, services, currentDepth);
				}

                // now check parents of non-services
                for (var i = 0; i < al.size(); i++) {
                    var parent = al.get(i);
                    if (parent) {
                        var str = parent + "";
                        if (!services[str]) // if already in "services", we already checked its parents
                            if (this.mepAll[str] && currentDepth - 1 < maxDepth)
                                this._addParentServices(str, services, currentDepth - 1);
                            else if (currentDepth < maxDepth)
                                this._addParentServices(str, services, currentDepth);
                    }
                }
            }
        }
    },

    _addService: function(id, services) {
        if (services.get(id))
		   return;
        services.add(id);
        this.added++;
    },

    /**
     * Returns an array of IP addresses belonging to the given CI (including 127.0.0.1).
     */
    getIPs: function(ci_sys_id) {
        var ipgr = new GlideRecord('cmdb_ci_ip_address');
        ipgr.addQuery('nic.cmdb_ci', ci_sys_id);
        ipgr.addQuery('ip_version', '4');
        ipgr.addQuery('install_status', '<>', 100);
        ipgr.addQuery('nic.install_status', '<>', 100);
        ipgr.query();
        var result = [];
        while (ipgr.next())
            result.push(ipgr.getValue('ip_address'));
        result.push('127.0.0.1');
        return result;
    },

    canShowRefreshServicesUIAction: function(tableClassName) {
        var ciTable = gs.getProperty('com.snc.task.refresh_impacted_services');
        if (ciTable) {
            var tableList = ciTable.split(',');
            for (var i = 0; i < tableList.length; ++i) {
                var table = tableList[i];
                table = table.trim();
                if (tableClassName + "" === table)
                    return true;
            }
        } else
            return false;
    },

    refreshImpactedServices: function(current) {
        this.removeImpactedServices(current.sys_id);
        if (!current.cmdb_ci.nil())
            this.addImpactedServices(current.sys_id, this.servicesAffectedByCI(current.cmdb_ci));
    },

    removeImpactedServices: function(taskSysId) {
        var m2m = new GlideRecord('task_cmdb_ci_service');
        m2m.addQuery('task', taskSysId);
        m2m.addQuery('manually_added', false);
        m2m.deleteMultiple();
    },

    addImpactedServices: function(taskSysId, services) {
        //Remove any manually added services from services array so we do not get unique key violation
        var manualServices = this.getManuallyAddedServices(taskSysId);
        if (manualServices.length > 0) {
            services = services.filter(function(el) {
                return manualServices.indexOf(el) === -1;
            });
        }

        var m2m = new GlideRecord('task_cmdb_ci_service');
        for (var i = 0; i < services.length; i++) {
            m2m.initialize();
            m2m.task = taskSysId;
            m2m.cmdb_ci_service = services[i];
            m2m.manually_added = false;
            m2m.insert();
        }
    },

    getManuallyAddedServices: function(taskSysId) {
        var manualServices = [];

        if (!taskSysId)
            return manualServices;

        var manualServicesGr = new GlideRecord('task_cmdb_ci_service');
        manualServicesGr.addQuery('task', taskSysId);
        manualServicesGr.addQuery('manually_added', true);
        manualServicesGr.query();

        while (manualServicesGr.next())
            manualServices.push(manualServicesGr.cmdb_ci_service + "");

        return manualServices;
    },

    refreshImpactedServicesFromAffectedCIs: function(current) {
        if (!current || !current.isValidRecord()) {
            gs.error("[CIUtils.refreshImpactedServicesFromAffectedCIs] : Invalid parameter");
            return;
        }

        var services = this._getImpactedServicesFromAffectedCIs(current.sys_id + '');
        this.removeImpactedServices(current.sys_id + '');
        if (services) {
            this.addImpactedServices(current.sys_id + '', services);
        }
    },

    _getImpactedServicesFromAffectedCIs: function(taskId) {
        var impactedServices = {};
        //fetching records from the svc_ci_assoc table
        //this table has entries when Service Mapping is being used
        //it has all CIs associated with a particular application service
        var serviceConfigItemAssocGr = new GlideAggregate("svc_ci_assoc");
        serviceConfigItemAssocGr.addQuery("JOINsvc_ci_assoc.ci_id=task_ci.ci_item!task=" + taskId);
        serviceConfigItemAssocGr.groupBy("service_id");
        serviceConfigItemAssocGr.query();

        while (serviceConfigItemAssocGr.next())
            impactedServices[serviceConfigItemAssocGr.service_id + ""] = null;

        return Object.keys(impactedServices);
    },

    type: 'CIUtils'

};
