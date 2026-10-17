// get all potential ESC portals with associated active non empty taxonomy
try {

    var discardPortalIds = []; // some dafault Portals that we ship except SP [ observed SP record used as EC ]
    discardPortalIds.push('26f2fffb77322300454792718a1061e5'); // MESP
    discardPortalIds.push('0d3fa8649f131200b18a7feea57fcf7a'); // CAB WorkBench
    discardPortalIds.push('45d6680fdb52220099f93691f0b8f5ad'); // Knowledge Portal
    discardPortalIds.push('5ef362fa5b4132003d1c484c11f91a05'); // BenchMarks
    discardPortalIds.push('bebfa187536a1300a699ddeeff7b1223'); // Instance Security Center
    discardPortalIds.push('d141d4f20b4303008cd6e7ae37673a64'); // Content Publishing Demo
    discardPortalIds.push('db57a91047001200ba13a5554ee49050'); // SP Config
    discardPortalIds.push('fe5506d03b0203008ed00d8044efc45d'); // Service Workspace
    discardPortalIds.push('89275a53cb13020000f8d856634c9c51'); // CSM Portals

    var finalSYSID = [];
    var finalCount = 0;
    // Portals with taxonomy using Connected Content and not using OOTB Portal SYS ID
    var gr = new GlideRecord("m2m_sp_portal_taxonomy");
    gr.addQuery('sp_portal', 'NOT IN', discardPortalIds);
    gr.addEncodedQuery("taxonomyISNOTEMPTY^active=true^taxonomy.active=true");
    gr.query();
    while (gr.next()) {
        // Check if connected content exists for an taxonomy
        var gra = new GlideAggregate("m2m_connected_content");
        if (gra.isValid()) {
            gra.addAggregate('COUNT');
            gra.addEncodedQuery("topic.taxonomy=" + gr.getValue('taxonomy') + "^topic.active=true");
            gra.query();
            if (gra.next() && gra.getAggregate('COUNT') > 0) {
                // Prepare the list of SYS_ID's
                finalSYSID.push(gr.getValue('sp_portal'));
            }
        }
    }

    // execute query in finalSYSID is not empty
    if (finalSYSID.length != 0) {
        var graPortal = new GlideAggregate("sp_log");
        graPortal.addAggregate('COUNT(DISTINCT', 'user');
        graPortal.addQuery('portal.sys_id', 'IN', finalSYSID);
        graPortal.addEncodedQuery("sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()");
        graPortal.setWorkflow(false);
        graPortal.setGroup(false);
        graPortal.query();
        if (graPortal.next()) {
            finalCount = graPortal.getAggregate('COUNT(DISTINCT', 'user');
        }
    }
    answer = finalCount;
}
catch (e) {
    gs.info("script errored - " + e.stack);
}
