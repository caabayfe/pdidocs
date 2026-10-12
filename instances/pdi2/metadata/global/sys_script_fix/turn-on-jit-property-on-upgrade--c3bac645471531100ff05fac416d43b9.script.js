(function() {

    //This Fix script should only run for Upgrade not for Zboot.
    if (pm.isZboot())
        return;

    var propGr = new GlideRecord('sys_properties');
    propGr.addQuery('name', 'com.snc.kmf.signature.use.jit_loading');
    propGr.query();
    if (propGr.next()) {
        var propValue = propGr.getValue('value');
        if (propValue == 'false') {
		propGr.setValue('value', 'true');
		propGr.update();
		gs.log("CODESIGNING: JIT property is set to true");
	    }
    }

}());
