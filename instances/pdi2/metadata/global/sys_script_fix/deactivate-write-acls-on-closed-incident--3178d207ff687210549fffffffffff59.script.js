gs.info("Fix Script: Deactivate write ACLs on closed incident");
if (!GlidePluginManager.isZboot()) {
    gs.info("Deactivating write ACLs on closed incident during upgrade");
    deactivateWriteACLS();
} else {
    gs.info("Skipping deactivating write ACLs on closed incident as instance is zbooting");
}


function deactivateWriteACLS() {
    var prevWF = gs.getSession().getWorkflow();
    try {
        gs.getSession().setWorkflow(true);

        var aclSysIds = ['8b548287ffe47210549fffffffffff0a',
            '9994c687ffe47210549fffffffffff30',
            'a21542c7ffe47210549fffffffffffca',
            '8955c6c7ffe47210549fffffffffffdb'
        ];
        var aclGr = new GlideRecord('sys_security_acl');
        aclGr.addQuery('sys_id', 'IN', aclSysIds);
        aclGr.addActiveQuery();
        aclGr.query();

        while (aclGr.next()) {
            aclGr.active = false; // deactivate ACL
            aclGr.update();
        }
    } finally {
        gs.getSession().setWorkflow(prevWF);
    }
}
