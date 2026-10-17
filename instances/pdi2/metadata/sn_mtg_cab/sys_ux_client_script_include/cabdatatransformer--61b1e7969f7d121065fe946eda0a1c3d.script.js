function include({
    imports
}) {
    const CABDataTransformerSNC = imports['sn_mtg_cab.CABDataTransformerSNC']();
    class CABDataTransformer extends CABDataTransformerSNC {
    }
    return CABDataTransformer;
}
