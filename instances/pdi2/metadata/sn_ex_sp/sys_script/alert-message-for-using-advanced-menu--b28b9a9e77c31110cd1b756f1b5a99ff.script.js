(function executeRule(current, previous /*null when async*/ ) {

    function getPortalsLinkedToTaxonomy(taxonomyId) {
        var portals = [];
        var m2mGr = new GlideRecord("m2m_sp_portal_taxonomy");
        m2mGr.addQuery("active", true);
        m2mGr.addQuery("taxonomy", taxonomyId);
        m2mGr.query();
        while (m2mGr.next())
            portals.push(m2mGr.sp_portal.toString());
        return portals;
    }
	
    if (
        (current.operation() === "insert" && !current["parent_topic"]) ||
        (current["order"] != previous["order"] && !current["parent_topic"]) ||
        (!current["parent_topic"] && previous["parent_topic"]) ||
        (!current["parent_topic"] && current["taxonomy"] != previous["taxonomy"])
    ) {
        var extensibleNavGr = new GlideAggregate("sn_ex_sp_portal_extensible_navigation");
        extensibleNavGr.addAggregate('COUNT');
        extensibleNavGr.addQuery("active", true);
        extensibleNavGr.addQuery("portal", "IN", getPortalsLinkedToTaxonomy(current.taxonomy.toString()));
        extensibleNavGr.query();
        var count = 0;
        if (extensibleNavGr.next())
            count = extensibleNavGr.getAggregate('COUNT');
        if (count > 0) {
            var url = "sn_ex_sp_portal_extensible_navigation_list.do";
            gs.addInfoMessage(gs.getMessage("You're using advanced portal navigation to control menu order. For changes made here to show in the menu, you must <a href='{0}' target='_blank'>go to advanced portal navigation</a> and sync menu changes.", url));
        }
    }

})(current, previous);
