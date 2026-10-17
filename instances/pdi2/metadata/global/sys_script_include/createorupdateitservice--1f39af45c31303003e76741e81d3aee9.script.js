var CreateOrUpdateITService = Class.create();

CreateOrUpdateITService.prototype = {

    initialize: function() {
        this.msg = "";
        this.sanitize = new ServiceMappingSanitizeIdAPI();
    },

    /**
     * iterate over the list of key of manual endpoints in the before, and check if they exist now.
     * if not, delete those manual endpoints
     */
    removeOutdatedManualEndpoints: function(manualEpBefore, manualEpAfter) {
        var outdatedManualEndpoints = [];
        var outdatedDirectRelations = [];

        for (var manualEp in manualEpBefore) {
            if (!manualEpAfter[manualEp] && manualEpBefore[manualEp]) {
                outdatedManualEndpoints.push(manualEpBefore[manualEp].sys_id);
                //do we need to remove direct relation?
                if (GlideProperties.get("sa.it_service.manual_ci_rel_type") && manualEpBefore[manualEp].direct_relation) {
                    outdatedDirectRelations.push(manualEpBefore[manualEp].direct_relation);
                }
            }
        }

        while (outdatedDirectRelations.length) {
            outdatedDirectRelationsSubList = outdatedDirectRelations.splice(0, 500);
            var dirRelGr = new GlideRecord("cmdb_rel_ci");
            dirRelGr.addQuery("sys_id", "IN", outdatedDirectRelationsSubList);
            dirRelGr.deleteMultiple();
        }

        while (outdatedManualEndpoints.length) {
            outdatedManualEndpointSubList = outdatedManualEndpoints.splice(0, 500);
            var manualEpGr = new GlideRecord('cmdb_ci_endpoint_manual');
            manualEpGr.addQuery("sys_id", "IN", outdatedManualEndpointSubList);
            manualEpGr.deleteMultiple();
        }
    },

    /*
     * create map containing all the manual endpoints in the service. the key is parent-child
     */
    getManualEndpointsInService: function(bsId) {
        var gr = new GlideRecord('cmdb_ci_service_discovered');
        gr.get(bsId);
        var layerId = gr.layer;
        var layerGr = new GlideRecord('svc_layer');
        var manualEpMap = {};
        layerGr.get(layerId);
        var allCis = sn_svcmod.ServiceContainerFactory.queryCIsAssociatedWithEnvironment(layerGr.environment);
        for (var i = 0; i < allCis.length; i++) {
            var ciId = allCis[i];
            var manualEpGr = new GlideRecord('cmdb_ci_endpoint_manual');
            if (manualEpGr.get(ciId)) {
                var parent = manualEpGr.source_ci;
                var child = manualEpGr.target_ci;
                if (!parent)
                    parent = '';
                var key = parent + '-' + child;
                var sysIdDirectRelation = {};
                sysIdDirectRelation["sys_id"] = manualEpGr.getUniqueValue();
                sysIdDirectRelation["direct_relation"] = manualEpGr.getValue("direct_relation");
                manualEpMap[key] = sysIdDirectRelation;
            }
        }
        return manualEpMap;
    },
    /**
     * fill the gliderecord with relevant fields from JSON
     */
    populateServiceFields: function(gr, jsonObj) {
        // Iterate over the fields in the upper level of the JSON. ignore items and relations
        for (var fieldName in jsonObj) {
            if (fieldName == 'relations' || fieldName == 'items')
                continue;
            gr.setValue(fieldName, jsonObj[fieldName]);
        }
    },

    /*
     * populagte the msg member and throw exception
     */
    throwError: function(err) {
        this.msg = err;
        gs.log("CreateOrUpdateITService exception msg : = " + this.msg);
        throw this.msg;
    },

    /*
     * create a key to a relation based on parent and child
     */
    createRelationKey: function(rel) {
        var parent = rel['parent'];
        if (!parent)
            parent = '';
        var child = rel['child'];
        if (!child) {
            this.throwError(gs.getMessage("Invalid relation in input. The child attribute must not be empty"));
        }
        var relKey = parent + '-' + child;
        return relKey;
    },

    /*
     * process the input request. Create or udpate a service and populate it with CIs
     */
    process: function( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
        var body = "";

        response.setStatus(200);
        response.setContentType('application/json');

        try {
            body = GlideStringUtil.getStringFromStream(request.body.dataStream);

            if (GlideStringUtil.nil(body)) {
                throw new sn_ws_err.BadRequestError(gs.getMessage("Wrong input for creation or update of a service. input must not be empty"));
            } else {
                var responseObj = this.processJSON(body);
                response.setBody(responseObj);
            }
        } catch (e) {
            response.setStatus(400);
            this.msg = gs.getMessage("Add or create service failed: {0}", this.msg);
            throw new sn_ws_err.BadRequestError(this.msg);
        }

    },


    /*
     * process the input JSON. Create or udpate a service and populate it with CIs
     */
    processJSON: function(jsonBody) {
        this.msg = "";
        var json = "";
        var bsId = "";
        var errorId = "";
        var infoMessage = "";
        var responseObj = {};


        try {
            json = JSON.parse(jsonBody);
        } catch (eJson) {
            this.msg = gs.getMessage("Wrong input for creation or update of a service, input must be JSON. {0}", eJson);
        }

        var bsName = json.name;
        if (bsName == '') {
            this.msg = gs.getMessage("Wrong input for creation or update of a service, The business service name must not be empty");
        }

        // Insert or update the business service record
        if (this.msg !== "") {
            this.throwError(this.msg);
        } else if (this.msg === "") {
            var bsGr = new GlideRecord('cmdb_ci_service_discovered');
            bsGr.addQuery('name', bsName);
            bsGr.query();
            if (bsGr.next()) {
                // Validate the service_type is manual or empty
                if (bsGr.type == '2') {
                    this.throwError(gs.getMessage("This API is allowed to operate only on empty or manual service. This service contains discovered elements"));
                }
                this.populateServiceFields(bsGr, json);
                bsGr.update();
                bsId = bsGr.getUniqueValue();
            } else {
                this.populateServiceFields(bsGr, json);
                bsId = bsGr.insert();
                if (!bsId) {
                    this.throwError(gs.getMessage("Failed to insert a new business service. Insertion was probably blocked by business rule"));
                }
            }

            var responseString = '/api/now/table/cmdb_ci_service_discovered/' + bsId;
            responseObj['url'] = responseString;
            responseObj['getContentUrl'] = '/api/now/cmdb/app_service/' + bsId + "/getContent";

        }
        var rels = json['service_relations'];
        var cisAdded = {};

        if (this.shouldPopulateServiceBatch()) {
            cisAdded = this.populateDiscoveredServiceBatch(bsId, rels);
        } else {
            cisAdded = this.populateDiscoveredService(bsId, rels);
        }

        // Report on the number of CIs added to the service
        var ciCount = 0;
        for (var ci in cisAdded) ciCount++;
        infoMessage = gs.getMessage('{0} CIs added to business service', ciCount + '');
        responseObj['info'] = infoMessage;

        if (this.msg !== "") {
            this.throwError(this.msg);
        }

        return responseObj;
    },

    shouldPopulateServiceBatch: function() {
        return GlideProperties.getBoolean('sa.service.batch_create_update_it_service_population', true) && !GlideProperties.getBoolean('sa.it_service.skip_domain_verification', false) && !GlideProperties.getBoolean('sa.it_service.verify_hierarchical_domain', false);
    },

    populateDiscoveredService: function(bsId, rels) {
        this.msg = "";
        var bsm = new SNC.BusinessServiceManager();
        var somethingChanged = true;
        var cisAdded = {};
        var relationsAdded = {};
        var manualEpBeforeChange;
        manualEpBeforeChange = this.getManualEndpointsInService(bsId);
        if (rels) {
            for (var level = 0; level < 100 && somethingChanged; level++) {
                somethingChanged = false;
                for (var i = 0; i < rels.length; i++) {
                    var rel = rels[i];
                    var parent = rel['parent'];
                    if (!parent)
                        parent = '';
                    var child = rel['child'];
                    var relKey = this.createRelationKey(rel);
                    if (relationsAdded[relKey]) // we already handled this relation
                        continue;
                    if (!parent) { // this is an entry point
                        this.msg = bsm.addCI(bsId, parent, child);
                        if (this.msg)
                            this.throwError(this.msg);
                        somethingChanged = true;
                        cisAdded[child] = true;
                        relationsAdded[relKey] = true;
                        continue;
                    }
                    // If the parent was already added, we can add the child
                    if (cisAdded[parent]) {
                        this.msg = bsm.addCI(bsId, parent, child);
                        if (this.msg)
                            this.throwError(this.msg);
                        cisAdded[child] = true;
                        relationsAdded[relKey] = true;
                        continue;
                    }
                } // end of loop on relations
            } // end of loop over levels
        }

        this.removeOutdatedManualEndpoints(manualEpBeforeChange, relationsAdded);

        // Check for dangling relations
        for (var j = 0; j < rels.length; j++) {
            var rel1 = rels[j];
            var relKey1 = this.createRelationKey(rel1);
            if (!relationsAdded[relKey1])
                this.throwError(gs.getMessage('Relation from parent {0} to child {1} is dangling. The parent is not part of the service', [rel1['parent'], rel1['child']]));
        }

        return cisAdded;
    },

    populateDiscoveredServiceBatch: function(bsId, rels) {
        this.msg = "";
        var bsm = new SNC.BusinessServiceManager();
        var somethingChanged = true;
        var cisAdded = {};
        var relationsAdded = {};
        var uniqueRelations = [];
        var manualEpBeforeChange;
        manualEpBeforeChange = this.getManualEndpointsInService(bsId);
        if (rels) {
            for (var level = 0; level < 100 && somethingChanged; level++) {
                somethingChanged = false;
                for (var i = 0; i < rels.length; i++) {
                    var rel = rels[i];
                    var parent = rel['parent'];
                    if (!parent)
                        parent = '';
                    var child = rel['child'];
                    var relKey = this.createRelationKey(rel);
                    if (relationsAdded[relKey]) // we already handled this relation
                        continue;
                    if (parent == '' || cisAdded[parent]) {
                        var relationMap = {};
                        relationMap["parent"] = parent;
                        relationMap["child"] = child;
                        uniqueRelations.push(relationMap);
                        cisAdded[child] = true;
                        relationsAdded[relKey] = true;
                    }
                    if (parent == '') {
                        somethingChanged = true;
                    }
                    continue;
                } // end of loop on relations
            } // end of loop over levels
            this.msg = bsm.addBulkCIs(bsId, JSON.stringify(uniqueRelations), true);
            if (this.msg) {
                //These are not actual errors. These are warnings that few of the CIs are removed from the map when system is not able to find the CI based on few conditions eg:- CIs from one domain cannot be retrieved from other domain.
                gs.warn(this.msg);
            }
        }

        this.removeOutdatedManualEndpoints(manualEpBeforeChange, relationsAdded);

        for (var j = 0; j < rels.length; j++) {
            var rel1 = rels[j];
            var relKey1 = this.createRelationKey(rel1);
            if (!relationsAdded[relKey1])
                this.throwError(gs.getMessage('Relation from parent {0} to child {1} is dangling. The parent is not part of the service', [rel1['parent'], rel1['child']]));
        }

        return cisAdded;
    },

    checkLevels: function(levels) {
        var checkedLevels = levels;
        //Check the levels
        if (levels == null) {
            checkedLevels = gs.getProperty('svc.manual.convert.levels.default_value', 3); //default value
        }

        if (parseInt(levels) <= 0) {
            this.msg = gs.getMessage("The number of levels specified must be a positive integer.");
        }

        return checkedLevels;

    },

    createDynamicService: function(name, levels, payload) {
        this.msg = "";

        //Check the name
        if (name == "") {
            this.msg = gs.getMessage("Wrong input for creation or update of a service, The business service name must not be empty");
        }
        //Check the levels
        var checkedLevels = this.checkLevels(levels);

        if (this.msg === "") {
            if (ModellessServiceCoreUtils.shouldNewServicesBeLightweight()) {
                return new sn_sm_scoped_app.LightweightDynamicServiceManager().createService(
                    name,
                    {
                        levels: checkedLevels,
                        entrypointCiIds: []
                    },
                    payload
                );
            }
            try {
                var gr = new GlideRecord("cmdb_ci_service_calculated");
                gr.initialize();

                //Creation of the empty service
                gr.setValue("name", name);
                gr.setValue("populator_status", 1);
                gr.setValue("service_populator", "11f01e3dc3f23300daa79624a1d3ae32"); //service populator
				gr.setValue("metadata", JSON.stringify({"levels":parseInt(checkedLevels)}));
                gr.setValue("type", 5); //dynamic

                //With payload
                if (payload) {
                    var attributes = Object.keys(payload);
                    for (i = 0; i < attributes.length; i++) {
                        gr.setValue(attributes[i], payload[attributes[i]]);
                    }
                }

                return gr.insert();
            } catch (err) {
                this.msg = gs.getMessage("An error occured during the creation of the empty dynamic service. {0}", err);
            }
        }
        if (this.msg !== "") {
            this.throwError(this.msg);
        }
    },

    /**
     * @private
     * @param {SysId} serviceId
     * @param {number} levels
     * @returns {void}
     * @throws {string} If the service does not exist
     */
    _updateLevels: function(serviceId, levels) {
        var serviceGr = new GlideRecord("cmdb_ci_service_calculated");
        if (!serviceGr.get(serviceId)) {
            this.throwError(gs.getMessage("We couldn't find the service {0} in the cmdb_ci_service_calculated table", serviceId));
            return;
        }
        var existingMetadata = JSON.parse(serviceGr.getValue("metadata") || "{}");
        serviceGr.setValue("metadata", JSON.stringify(Object.assign({}, existingMetadata, {levels: levels})));
        serviceGr.update();
    },

    convertManualToDynamicService: function(serviceId, levels) {
        this.msg = "";
        var service = this.sanitize.sanitizeIdString(serviceId);

        var correctLevels = this.checkLevels(levels);
        if (this.msg !== "") {
            this.throwError(this.msg);
        }

        if (ModellessServiceCoreUtils.isLightweight(service)) {
            // CSDM views route to this function when a user updates an existing dynamic service.
            // In the case where the service is lightweight, it is already a calculated service and
            // needs no conversion - just update the levels.
            this._updateLevels(service, correctLevels);
            return;
        }

        var gr = new GlideRecord("cmdb_ci_service_discovered");

        if (!gr.get(service)) {
            this.msg = gs.getMessage("We couldn't find the service {0} in the database.", service);
        }


        if (this.msg !== "") {
            this.throwError(this.msg);
        } else {
            //Reclassification
            gr.setValue("sys_class_name", "cmdb_ci_service_calculated");
            gr.update();

            //Add the service populator
            var gr2 = new GlideRecord("cmdb_ci_service_calculated");

            gr2.get(service);
            gr2.setValue("populator_status", 1);
            gr2.setValue("service_populator", "11f01e3dc3f23300daa79624a1d3ae32"); //service populator
			gr2.setValue("metadata", JSON.stringify({"levels":correctLevels}));
            gr2.setValue("type", 5); //dynamic
            gr2.update();
        }
    },

    updateDynamicNumberOfLevels: function(serviceId, levels) {
        this.msg = "";
        var service = this.sanitize.sanitizeIdString(serviceId);
        //Check the levels
        var checkedLevels = this.checkLevels(levels);

        var gr = new GlideRecord("cmdb_ci_service_calculated");

        if (!gr.get(service)) {
            this.msg = gs.getMessage("We couldn't find the service {O} in the cmdb_ci_service_calculated table", service);
        }

        if (this.msg !== "") {
            this.throwError(this.msg);
        } else {
            if (ModellessServiceCoreUtils.isLightweight(service)) {
                new sn_sm_scoped_app.LightweightDynamicServiceManager().updateLevels(service, checkedLevels);
                return;
            }
            var existingMetadata = JSON.parse(gr.getValue("metadata") || "{}");
            gr.setValue("metadata", JSON.stringify(Object.assign({}, existingMetadata, {levels: checkedLevels})));
            gr.update();
        }
    },

    convertDynamicToManual: function(serviceId) {
        this.msg = "";
        var service = this.sanitize.sanitizeIdString(serviceId);

        if (ModellessServiceCoreUtils.isLightweight(service)) {
            new sn_sm_scoped_app.LightweightServicesConversion().convertFromLightweight(service);
        }

        var gr = new GlideRecord('cmdb_ci_service_calculated');
        gr.get(service);
        gr.setValue("sys_class_name", "cmdb_ci_service_discovered");

        // checks if service is of 'empty' or 'manual' type
        var ga = new GlideAggregate('sa_m2m_service_entry_point');
        ga.addAggregate('count');
        ga.addQuery('cmdb_ci_service', service);
        ga.query();
        ga.next();
        var numOfEp = ga.getAggregate('count');
        if (numOfEp === '0') {
            gr.setValue("type", 0);
        } else {
            gr.setValue("type", 1);
        }
        gr.update();
    },

    addCI: function(bsID, sourceCiId, targetCIId) {
        var bsm = new SNC.BusinessServiceManager();
        return bsm.addCI(bsID, sourceCiId, targetCIId);
    },

    removeCI: function(bsID, ciSysID) {
        var bsm = new SNC.BusinessServiceManager();
        return bsm.removeManualCi(ciSysID, bsID);
    },

    retrieveSystemExcludeList: function() {
        var blackWhiteListManager = new SNC.ManualCiBlackWhiteListManager();
        return blackWhiteListManager.retrieveSystemExcludeList();
    },

    getExcludedCiClasses: function() {
        var blackWhiteListManager = new SNC.ManualCiBlackWhiteListManager();
        return blackWhiteListManager.getExcludedCiClasses();
    },

    getIncludedCiClasses: function() {
        var blackWhiteListManager = new SNC.ManualCiBlackWhiteListManager();
        return blackWhiteListManager.getIncludedCiClasses();
    },

    isManualCiClassAllowed: function(ciType, domainID) {
        var blackWhiteListManager = new SNC.ManualCiBlackWhiteListManager(domainID);
        return blackWhiteListManager.isManualCiClassAllowed(ciType);
    },

    type: 'CreateOrUpdateITService'
};
