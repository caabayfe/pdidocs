function include({
    imports
}) {
    const CABRecordWatcherHandlerSNC = imports['sn_mtg_cab.CABRecordWatcherHandlerSNC']();
    class CABRecordWatcherHandler extends CABRecordWatcherHandlerSNC {}
    return CABRecordWatcherHandler;
}
