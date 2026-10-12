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
    // Portals using Connected Content and not using OOTB SYS ID  
    var gr = new GlideRecord("m2m_sp_portal_taxonomy");
    gr.addQuery('sp_portal', 'NOT IN', discardPortalIds);
    gr.addQuery('sp_portal', '!=', '70cd9f3b734b13001fdae9c54cf6a72f');
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

    // Portals not using Taxonomy and not using OOTB SYS ID  
    var sp_portalgr1 = new GlideRecord("sp_portal");
    sp_portalgr1.addQuery('sys_id', 'NOT IN', finalSYSID);
    sp_portalgr1.addQuery('sys_id', '!=', '70cd9f3b734b13001fdae9c54cf6a72f');
    sp_portalgr1.addQuery('enable_ais', true);
    sp_portalgr1.query();
    while (sp_portalgr1.next()) {
        // check if any of the OOTB parameters are matching then add to list
        if (sp_portalgr1.getValue('theme') == '9b6f06d71bb8f85047582171604bcb9c' ||
            sp_portalgr1.getValue('sp_rectangle_menu') == '493d01365368301056c1ddeeff7b1207' ||
            sp_portalgr1.theme.header == 'd0009941eb103010ed7966d6475228c1' ||
            (sp_portalgr1.getDisplayValue('logo').length != 0 &&
                (sp_portalgr1.getDisplayValue('logo') == 'ba95c23323c42300fb0c949e27bf6563.iix' || sp_portalgr1.getDisplayValue('logo') == 'dacdee00ff601210860fffffffffffd6.iix')) ||
            (sp_portalgr1.getValue('homepage') == '8c51a66b532030101865ddeeff7b120d' ||
                sp_portalgr1.getValue('homepage') == '0c9e5ccd537030101865ddeeff7b12cb' ||
                sp_portalgr1.getValue('homepage') == '9b3fc2c453402210b8f2ddeeff7b129b' ||
                sp_portalgr1.getValue('homepage') == '3cd32c40c7a83110b1c6677703c26062' ||
                sp_portalgr1.getValue('homepage') == '0987d9aa53331210b8f2ddeeff7b129d' ||
                sp_portalgr1.getValue('homepage') == 'b10e9a1743d431108c5d43d488b8f26b')) {
            finalSYSID.push(sp_portalgr1.getUniqueValue());
        }
    }

    // Portals using OOTB SYS ID
    finalSYSID.push('70cd9f3b734b13001fdae9c54cf6a72f');

    // add esc :  not OOTB SYS_ID and not in finalSYSID - track /esc portals
    var sp_portalgr2 = new GlideRecord("sp_portal");
    sp_portalgr1.addQuery('enable_ais', true);
    sp_portalgr2.addQuery('url_suffix', 'esc');
    sp_portalgr2.addQuery('sys_id', 'NOT IN', finalSYSID);
    sp_portalgr2.query();
    while (sp_portalgr2.next()) {
        finalSYSID.push(sp_portalgr2.getUniqueValue());
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
