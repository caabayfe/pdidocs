function include({imports}) { 
    let sowPerfHeaderUtilsSNC = imports['sn_sow_inc.SowPerfHeaderUtilsSNC']();
    class SowPerfHeaderUtils extends sowPerfHeaderUtilsSNC {
    }
    return SowPerfHeaderUtils;
}
