(function(finding) {

    if (GlidePluginManager.isActive('sn_si')) {
        //Store encoded query for searching `user role contains` table 
        var encQuery = "role.name=sn_si.ciso^contains.name=sn_si.basic";

        //Look for relevant role dependencies 
        var gaRoleContains = new GlideRecord('sys_user_role_contains');
        gaRoleContains.addEncodedQuery(encQuery);
        gaRoleContains.setLimit(1);
        gaRoleContains.query();

        //Create finding if the CISO role contains the <sn_si.basic> role that provides write permissions
        //Finding can be reviewed for potential enhancement and improved product usability

        if (gaRoleContains.next()) {
            finding.setCurrentSource(gaRoleContains);
            finding.increment();

        }
    }

})(finding);
