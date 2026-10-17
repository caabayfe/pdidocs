function include({
    imports
}) {
    const CABAgendaPatchingSNC = imports['sn_mtg_cab.CABAgendaPatchingSNC']();
    class CABAgendaPatching extends CABAgendaPatchingSNC {}
    return CABAgendaPatching;
}
