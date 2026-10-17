function include({
    imports
}) {
    const cabUtilsSNC = imports['sn_mtg_cab.CABUtilsSNC']();
    class CABUtils extends cabUtilsSNC {}
    return CABUtils;
}
