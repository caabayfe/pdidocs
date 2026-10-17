processSLAACLs();

function processSLAACLs() {

    var discoveredPublicACLs = {
        "found": 0,
        "contract_sla": {
            "create": 0,
            "read": 0,
            "write": 0,
            "delete": 0,
            "report_view": 0
        },
        "task_sla": {
            "create": 0,
            "read": 0,
            "write": 0,
            "delete": 0,
            "report_view": 0
        }
    };

    var deactivateACLs = function(arrACLSysId) {
        if (!arrACLSysId || arrACLSysId.length < 1)
            return;
        var gr = new GlideRecord("sys_security_acl");
        gr.addQuery("sys_id", arrACLSysId);
        gr.query();
        gr.setValue("active", false);
        gr.updateMultiple();
    };

    var findACLs = function(discoveredPublicACLs, table) {
        var denyUnlessACLs = {
            "contract_sla": {
                "create": "061000f453946210e84def0910e5e62f",
                "read": "b48008f453946210e84def0910e5e6b3",
                "write": "180ade6053aca210e84def0910e5e6c8",
                "delete": "fd90c8f453946210e84def0910e5e6a0",
                "report_view": "fca00cf453946210e84def0910e5e68a"
            },
            "task_sla": {
                "create": "e171c83853946210e84def0910e5e6d0",
                "read": "59220c7853946210e84def0910e5e6f0",
                "write": "b4320c7853946210e84def0910e5e64b",
                "delete": "865280b853946210e84def0910e5e6eb",
                "report_view": "a4f28cb853946210e84def0910e5e6c4"
            }
        };

        var aclsToBeDeactivated = [];
        Object.keys(discoveredPublicACLs[table]).forEach(function(operation) {
            if (discoveredPublicACLs[table][operation] > 0)
                aclsToBeDeactivated.push(denyUnlessACLs[table][operation]);
        }, this);
        return aclsToBeDeactivated;
    };

    var aclGR = new GlideRecord("sys_security_acl_role");
    if (!aclGR.isValid())
        return;
    aclGR.setWorkflow(false);
    aclGR.addQuery("sys_user_role.name", "public");
    var joinQuery = aclGR.addJoinQuery("sys_security_acl", "sys_security_acl", "sys_id");
    joinQuery.addCondition("active", true);
    var qc = joinQuery.addCondition("name", "contract_sla");
    qc.addOrCondition("name", "task_sla");
    aclGR.query();
    while (aclGR.next()) {
        var table = aclGR.sys_security_acl.name + "";
        if (!table)
            continue;

        discoveredPublicACLs.found = 1;
        discoveredPublicACLs[table][aclGR.sys_security_acl.operation.name + ""]++;
    }

    if (discoveredPublicACLs.found === 0)
        return;

    var aclsToBeDeactivated = findACLs(discoveredPublicACLs, "contract_sla");
    aclsToBeDeactivated = aclsToBeDeactivated.concat(findACLs(discoveredPublicACLs, "task_sla"));
    deactivateACLs(aclsToBeDeactivated);
}
