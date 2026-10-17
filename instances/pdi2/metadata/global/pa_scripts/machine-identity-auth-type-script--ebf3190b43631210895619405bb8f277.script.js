(function(auth) {

    var startDate = score_start.getGlideObject().toString();
    var endDate = score_end.getGlideObject().toString();

    gs.debug('Machine Identity Auth Type Script: Auth Type: ' + auth + ', : Start time: ' + startDate + ', End time: ' + endDate);

    var ga = new GlideAggregate('sys_mi_request');
    ga.addQuery('auth', auth);
    ga.addEncodedQuery("last_usedBETWEEN" + startDate + "@" + endDate);
    ga.addAggregate('COUNT');
    ga.query();

    return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;

})(current.value);
