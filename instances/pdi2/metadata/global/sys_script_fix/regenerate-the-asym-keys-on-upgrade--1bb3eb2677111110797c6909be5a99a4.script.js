(function() {
    if (GlidePluginManager.isZboot())
        return;

	// 1. Create a sys_trigger so that we can prevent stress on the vault.
    gs.info('Creating a sys_trigger event for regenerating the vault keys based on the vault health');
	var gr = new GlideRecord("sys_trigger");
    gr.initialize();
    gr.setValue("name", "ASYNC: Regenerate the asym keys on upgrade");
    gr.setValue("trigger_class", "RunScriptJob");
    gr.setValue("trigger_type", 0);
    gr.setValue("job_context", "fcRunAs=system\nfcScriptName=ScriptID\\:1d59de3677911110797c6909be5a997e");

    // Find some time between 2 hrs from now and 10 hrs
    var delay = 7200 + GlideSecureRandomUtil.getSecureRandomIntBound(36001); // 10hrs = 36000 seconds
	
    var gdt = new GlideDateTime();
    gdt.addSeconds(delay);
    gr.setValue("next_action", gdt);
    gr.insert();
    gs.info("Scheduling regenration of asym keys job in " + delay + " seconds.");
})();
