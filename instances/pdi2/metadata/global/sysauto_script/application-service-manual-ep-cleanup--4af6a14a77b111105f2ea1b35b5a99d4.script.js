try {
    SNC.ServiceMappingFactory.disableRecomputationForCurrentThread();
    deleteStaleManualEndpoints();
} finally {
    SNC.ServiceMappingFactory.enableRecomputationForCurrentThread();
}

function deleteStaleManualEndpoints() {
    gs.debug("Application Service Manual Ep Cleanup: Started execution");
    var startTime, hashSysId;
    var batchSize = parseInt(gs.getProperty("sa.service.stale_manual_endpoints_deletion.batch_size", 5000));
    new GlideQuery('sa_hash').where('name', 'sa.service.stale_manual_endpoints_deletion.last_run_date').selectOne('hash', "sys_id").ifPresent(function(record) {
        startTime = record.hash;
        hashSysId = record.sys_id;
    });
    if (!startTime) {
        new GlideQuery('cmdb_ci_endpoint_manual').orderBy('sys_created_on').selectOne('sys_created_on').ifPresent(function(record) {
            startTime = record.sys_created_on;
        });
    }
    if (startTime) {
        var newRecordsPresent = new GlideQuery('cmdb_ci_endpoint_manual').orderBy('sys_created_on').where('sys_created_on', '>', startTime).limit(batchSize).selectOne("sys_created_on").isPresent();

        if (!isNaN(batchSize)) {
            var endpointsToDelete = [];
            var relationsToDelete = [];
            var endDate;
            var endpointsToKeepDirectRelations = filterEndpointsToKeepDirectRelations(startTime, batchSize);
            var gr = new GlideRecord("cmdb_ci_endpoint_manual");
            gr.orderBy("sys_created_on");
            gr.addQueryString("sys_created_on>=" + startTime, true);
            gr.setLimit(batchSize);
            gr.query();
            while (gr.next()) {
                if (!isValidEndpoint(gr)) {
                    endpointsToDelete.push(gr.getUniqueValue());
                    if (!gs.nil(gr.getValue("direct_relation")) && !endpointsToKeepDirectRelations[gr.getUniqueValue()]) {
                        relationsToDelete.push(gr.getValue("direct_relation"));
                    }
                }
                endDate = gr.getValue("sys_created_on");
            }
            batchDeleteMultiple("cmdb_ci_endpoint_manual", endpointsToDelete);
            batchDeleteMultiple("cmdb_rel_ci", relationsToDelete);
            if (!newRecordsPresent) {
                gs.info("deleting hash sa.service.stale_manual_endpoints_deletion.last_run_date as no new records present to check");
                new GlideQuery('sa_hash').where('name', 'sa.service.stale_manual_endpoints_deletion.last_run_date').deleteMultiple();
            } else {
                var json = {
                    name: 'sa.service.stale_manual_endpoints_deletion.last_run_date',
                    hash: endDate
                };
                if (hashSysId) {
                    json.sys_id = hashSysId;
                }
                new GlideQuery('sa_hash').insertOrUpdate(json);
            }
        } else {
            gs.error("Invalid property value sa.service.stale_manual_endpoints_deletion.batch_size. Please update it to some integer value");
        }
    }
    gs.debug("Application Service Manual Ep Cleanup: completed execution");
}

function batchDeleteMultiple(tableName, sysIds) {
    gs.info("Application Service Manual Ep Cleanup: Deleting " + sysIds.length + " from table " + tableName + " as they are stale");
    for (var i = 0; i < sysIds.length; i += 500) {
        new global.GlideQuery(tableName)
            .where('sys_id', 'IN', sysIds.slice(i, i + 500))
            .deleteMultiple();
    }
}

function isValidEndpoint(gr) {

    // to check if endpoint is valid
    // 1. Check if service reference in bs field is same as bsId in endpoint identifier.
    // 2. Check if target ci reference in target_ci field is same as target ci id present in endpoint identifier.
    // 3. If source ci id is null in endpoint identifier source ci reference in endpoint should be empty.
    // 4. If source ci id is not null in endpoint identifier validate that source ci reference in endpoint is same as source ci id in endpoint identifier.
    // 5. If the sys_id's of the cis mentioned in identifier does not exists any more in cmdb we mark endpoint as invalid.
    // 6. If the manual endpoint is no more associated to service mentioned in the identifier than also the endpoint is invalid.

    var identifier = gr.getValue("endpoint_identifier");
    var sysId = gr.getUniqueValue();

    try {

        if (gs.nil(identifier)) {
            return false;
        }

        identifier = identifier.replace("manualCiEndPoint", "");
        var cis = identifier.split("_");
        var bsId = cis[0];
        var sourceCi = cis[1];
        var targetCi = cis[2];

        if (bsId != gr.getValue("bs") || targetCi != gr.getValue("target_ci")) {
            return false;
        }

        if (sourceCi == 'null' && !gs.nil(gr.getValue("source_ci"))) {
            return false;
        } else if (sourceCi != 'null' && sourceCi != gr.getValue("source_ci")) {
            return false;
        }

        var notNullCis = cis.filter(function(e) {
            return e !== 'null';
        });

        if (notNullCis.length < 2) {
            return false;
        }

        var uniqueCIs = {};
        for (var i = 0; i < notNullCis.length; i++) {
            uniqueCIs[notNullCis[i]] = true;
        }

        var ciCount = new GlideQuery('cmdb_ci').where('sys_id', 'IN', Object.keys(uniqueCIs)).count();

        if (ciCount == Object.keys(uniqueCIs).length) {
            if (!new GlideQuery('svc_ci_assoc').where("ci_id", sysId).where("service_id", bsId).count() > 0) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    } catch (e) {
        // we will consider the endpoint as valid if any error occurs in identification of invalid endpoint
        gs.error("Application Service Manual Ep Cleanup: Exception for endpoint : " + sysId + " : " + e);
        return true;
    }
}

function filterEndpointsToKeepDirectRelations(startTime, batchSize) {

    // If Manual EP Deprecation is enabled get all endpoints in the current batch that are related to a dynamic service

    var endpointIdSet = {};

    if (gs.getProperty("glide.service_mapping.recomputation.deprecate_manual_eps", 'false') == 'false') {
        return endpointIdSet;
    }
    var gr = new GlideRecord("cmdb_ci_endpoint_manual");
    gr.orderBy("sys_created_on");
    gr.addQueryString("sys_created_on>=" + startTime, true);
    gr.addJoinQuery('cmdb_ci_service_calculated', 'bs', 'sys_id').addCondition('type', '5');
    gr.setLimit(batchSize);
    gr.query();

    while (gr.next())
        endpointIdSet[gr.getUniqueValue()] = true;

    return endpointIdSet;
}
