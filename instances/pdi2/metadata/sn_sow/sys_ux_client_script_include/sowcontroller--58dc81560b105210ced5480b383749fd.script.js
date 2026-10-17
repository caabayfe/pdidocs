function include({imports}) { 
    let SOWControllerSNC = imports['sn_sow.SOWControllerSNC']();
    class SOWController extends SOWControllerSNC {
    }
    return SOWController;
}
