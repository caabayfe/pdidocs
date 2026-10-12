(function() {

    try {
        const globalSI = new global.BuilderToolkitAPIGlobal();
        globalSI.setUserUpdateSetId(event.parm1);
        const {
            aclName,
            roles
        } = JSON.parse(event.parm2);
        new Experience().createACL(aclName, roles, current.sys_scope);
        globalSI.setUserUpdateSetId();
    } catch (err) {
        gs.error("Failed to create experience ACL with err: " + err + '\n' + err.stack);
    }
})();
