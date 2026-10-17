(function(finding, current) {
    var count = 0;
    var ga = new GlideRecord('sys_user_has_role');
    ga.addQuery('role', current.sys_id);
    ga.query();
    while (ga.next()) {
        count++;
    }
    if (count > 10) {
        finding.increment();
    }
    count = 0;

})(finding, current);
