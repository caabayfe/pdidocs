(function(context) {
    try {
        var vars = JSON.parse(context.props_details.vars || '{}');
        vars.heading = gs.getMessage('Get targeted routing capabilities');
        if (gs.hasRole('admin')) {
            vars.desc = gs.getMessage('Install an org-specific AWA plugin to route work items to the right agents.');
        } else {
            vars.desc = gs.getMessage('Ask your admin to install one of these org-specific AWA plugins to begin routing work items to the right agents.');
        }
        context.props_details.vars = JSON.stringify(vars);
    } catch (e) {
        gs.error('Error in translating messages in vars : ' + e.toString());
    }
})(context);
