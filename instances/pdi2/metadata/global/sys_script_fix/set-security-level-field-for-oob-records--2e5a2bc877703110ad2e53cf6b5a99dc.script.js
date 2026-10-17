(function() {
    if (GlidePluginManager.isZboot())
        return;
    var gr = new GlideRecord("pwd_verification_type");
    gr.query();
    while (gr.next()) {
        var currentSysId = gr.getUniqueValue();
        if (currentSysId === 'c7835ab787773200cfab6dd207cb0b88' || currentSysId === '58a2f398eb6001006a668c505206fed3' || currentSysId === '47cf0e830b233200572a6f3ef6673a00') {
            gr.setValue('security_level', 300);
        } else if (currentSysId === 'a67585845302011017c3ddeeff7b1267' || currentSysId === '39b15343eb10010045e1a5115206feb7') {
            gr.setValue('security_level', 200);
        } else {
            gr.setValue('security_level', 100);
        }
        gr.setWorkflow(false);
        gr.setUseEngines(false);
        gr.update();
    }
})();
