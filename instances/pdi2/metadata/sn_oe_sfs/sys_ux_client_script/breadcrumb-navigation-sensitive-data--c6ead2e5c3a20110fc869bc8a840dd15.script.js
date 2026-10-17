function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { navigateFromBreadcrumb } = imports["sn_oe_sfs.CiNavigationUtils"]();
    navigateFromBreadcrumb(api, event);
}
