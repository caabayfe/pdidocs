function onAfter(current, previous) {
if (previous.operational_status!=current.operational_status) {
    var im = new SNC.ImpactManager();
    im.triggerImpact(current.sys_id);
}
}
