(function calculatedFieldValue(current) {
    var ga = new GlideAggregate('duplicate_audit_result');
    ga.addAggregate('COUNT');
    ga.addQuery('follow_on_task', current.sys_id);
    ga.query();
    if (ga.next()) {
        return ga.getAggregate('COUNT');
    } else {
        return 0;
    }
})(current);
