(function() {

    try {
        const globalSI = new global.BuilderToolkitAPIGlobal();
        globalSI.setUserUpdateSetId(event.parm1);
        const newMacroponentGR = new Macroponent().getRecordById(event.parm2, true);
        if (newMacroponentGR) {
            new Page().createSubPage(current, {
                parentMacroponent: newMacroponentGR.getUniqueValue()
            }, newMacroponentGR.sys_scope, newMacroponentGR.sys_domain);
        }
        globalSI.setUserUpdateSetId();
    } catch (err) {
        gs.error("Failed to create subscreen with err: " + err + '\n' + err.stack);
    }

})();
