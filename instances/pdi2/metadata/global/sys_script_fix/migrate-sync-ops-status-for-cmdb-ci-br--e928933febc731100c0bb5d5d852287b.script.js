var NEW_SYNC_OPS_STATUS_FOR_CMDB_CI_BR = {
    SYS_ID: "3f06db7bebc731100c0bb5d5d85228d4",
    NAME: "Sync Ops Status for CMDB CI"
};

var OLD_SYNC_OPS_STATUS_FOR_CMDB_CI_BR = {
    NAME: "Sync Ops Status for CMDB CI",
    DEPRECATED_NAME: "Sync Ops Status for CMDB CI (DEPRECATED)"
};

var SYS_SCRIPT = {
    TABLE: "sys_script",
    NAME: "name",
    ACTIVE: "active",
    COLLECTION: "collection",
    SCRIPT: "script",
    SYS_CREATED_BY: "sys_created_by",
    SYS_ID: "sys_id"
};

var OPERATORS = {
    NOT_EQUAL: "!=",
    CONTAINS: "CONTAINS"
};

function updateRecord(gr, values) {
    if (gr.isValid()) {
        for (var field in values) {
            gr.setValue(field, values[field]);
        }
        gr.update();
    }
}

// query the newly shipped BR
var newBrGr = new GlideRecord(SYS_SCRIPT.TABLE);
newBrGr.get(NEW_SYNC_OPS_STATUS_FOR_CMDB_CI_BR.SYS_ID);

// query for any active BR with the name
var oldBrGr = new GlideRecord(SYS_SCRIPT.TABLE);
oldBrGr.addQuery(SYS_SCRIPT.COLLECTION, "cmdb_ci");
oldBrGr.addQuery(SYS_SCRIPT.SYS_CREATED_BY, "system");
oldBrGr.addQuery(SYS_SCRIPT.SYS_ID, OPERATORS.NOT_EQUAL, NEW_SYNC_OPS_STATUS_FOR_CMDB_CI_BR.SYS_ID);
oldBrGr.addQuery(SYS_SCRIPT.NAME, OLD_SYNC_OPS_STATUS_FOR_CMDB_CI_BR.NAME)
    .addOrCondition(SYS_SCRIPT.SCRIPT, OPERATORS.CONTAINS, "var OpsStatusSynchronizer = Class.create();"); // in case the customer has changed the name,

oldBrGr.query();
var rowCount = oldBrGr.getRowCount();

// for zbooted instance always activate the new BR
if (pm.isZboot()) {
	//DEF0530178: take no action, no longer activating the new business rule
    /*updateRecord(newBrGr, {
        active: true
    });
    gs.log("Activated the new BR for zboot instance", "ci_state_management"); */
} else {
    // deactivate the old BR only if there's one & only record with above query condition
    if (rowCount > 1) {
        gs.log("There are multiple 'Sync Ops Status for CMDB CI' Business Rule (BR). Skip deactivating the BR.", "ci_state_management");
    } else if (rowCount == 0) {
        gs.log("No 'Sync Ops Status for CMDB CI' Business Rule (BR) found.", "ci_state_management");
    } else {
        if (sn_collision.CollisionAPI.willBeReplacedOnUpgrade(oldBrGr)) { // update if the old BR is not customized
			/*DEF0530178: leave new Sync Ops Status business rule inactive
            updateRecord(newBrGr, {
                active: false
            }); */

            updateRecord(oldBrGr, {
                active: false,
                name: OLD_SYNC_OPS_STATUS_FOR_CMDB_CI_BR.DEPRECATED_NAME // rename old BR as deprecated
            });
            gs.log("No changes detected on existing 'Sync Ops Status for CMDB CI' Business Rule (BR). Deactivating the existing BR", "ci_state_management");
        } else {
            gs.log("Changes detected on existing 'Sync Ops Status for CMDB CI' Business Rule (BR). Skipping activating the new BR");
        }
    }
}
