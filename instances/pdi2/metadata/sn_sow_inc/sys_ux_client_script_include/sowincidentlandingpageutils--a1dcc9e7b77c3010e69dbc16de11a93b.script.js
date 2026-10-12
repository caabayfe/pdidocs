function include({imports}) { 
    let serviceDeskLandingPageUtilsSNC = imports['sn_sow_inc.SowIncidentLandingPageUtilsSNC']();
    class ServiceDeskLandingPageUtils extends serviceDeskLandingPageUtilsSNC {
        /*
        static getLabelMaps() {
            return "";
        }*/
    }
    return ServiceDeskLandingPageUtils;
}
