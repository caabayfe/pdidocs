var EC_PORTAL_ID = '70cd9f3b734b13001fdae9c54cf6a72f';
var quickStartConfig = [{
    "favorite": {
        "icon_checked": "fa-heart",
        "icon_unchecked": "fa-heart-o",
        "color": "primary"
    }
}];
var grPortal = new GlideRecord('sp_portal');
grPortal.get(EC_PORTAL_ID);
grPortal.enable_favorites = true;
var existingConfig = grPortal.quick_start_config;
if (!existingConfig) {
    grPortal.quick_start_config = JSON.stringify(quickStartConfig);
} else {
    existingConfig = JSON.parse(existingConfig);
    if (!existingConfig[0].hasOwnProperty("favorite")) {
        existingConfig[0].favorite = quickStartConfig[0].favorite;
    }
    grPortal.quick_start_config = JSON.stringify(existingConfig);
}
grPortal.update();
