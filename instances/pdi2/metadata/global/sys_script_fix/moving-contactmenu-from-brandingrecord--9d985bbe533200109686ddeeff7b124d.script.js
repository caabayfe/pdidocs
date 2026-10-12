var brandingGr = new GlideRecord('sys_cs_branding_setup');
brandingGr.query();

while (brandingGr.next()) {
    var utils = new ContactMenuUtils(brandingGr);
    utils.insertDefaultContactMenuItems();
}
