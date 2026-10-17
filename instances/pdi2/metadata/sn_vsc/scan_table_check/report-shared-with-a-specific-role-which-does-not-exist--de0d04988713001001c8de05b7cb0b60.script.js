(function(finding, current) {

    var list = current.roles.split(',');
    for (var i = 0; i < list.length; i++) {
        var validator = new GlideRecord('sys_user_role');
        if (!validator.get('name', list[i])) {
            finding.increment();
        }
    }

})(finding, current);
