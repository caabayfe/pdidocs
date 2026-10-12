(function () {
    if (gs.hasRole('maint')) return true;

    if (!current.consumer) return false;

    var c = new GlideRecord('sys_cs_consumer');
    if (!c.get(current.consumer.toString())) return false;

    var convUserId = c.user_id.toString();
    var userId = gs.getUserID().toString();

    return convUserId === userId;
})();
