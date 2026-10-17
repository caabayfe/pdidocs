var brandingGR = new GlideRecord("sys_cs_branding_setup");
brandingGR.addActiveQuery();
brandingGR.query();
while (brandingGR.next()) {
    var menuItemGR = new GlideRecord("va_branding_contact_menu");
    menuItemGR.addQuery("type", "Icon");
    menuItemGR.addQuery("branding", brandingGR.getValue("sys_id"));
    menuItemGR.query();
    if (!menuItemGR.next()) {
        gs.info("Create icons for existing Menu Item: " + brandingGR.getValue("sys_name"));
        var utils = new ContactMenuUtils(brandingGR);
        utils.insertIconMenuItem();
    }
}
gs.info("Successfully executed Fix Script for 'Create icons for existing Menu Items'");
