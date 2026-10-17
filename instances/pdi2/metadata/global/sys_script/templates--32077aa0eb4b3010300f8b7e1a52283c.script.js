(function executeRule(current, previous /*null when async*/ ) {
    if (gs.getSession().isInteractive()) {
        var view_name = gs.action.getGlideURI().get('sysparm_view');
        if (view_name && view_name == 'welcome_hub_template') {
            var condition = current.addQuery('type', 'b8c9bf330f3030108c9c5019c4767eb6');
        }
    }
})(current, previous);
