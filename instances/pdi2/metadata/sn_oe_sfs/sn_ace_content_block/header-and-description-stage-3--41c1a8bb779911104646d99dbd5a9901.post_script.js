(function(context) {
    try {
        var vars = JSON.parse(context.props_details.vars || '{}');
        vars.heading = gs.getMessage('Get the most popular plugins');
        if (gs.hasRole('admin')) {
            vars.desc = gs.getMessage('Install these powerful plugins to boost your AWA experience');
        } else {
            vars.desc = gs.getMessage('Ask your admin to install these plugins to boost your AWA experience.');
        }
        context.props_details.vars = JSON.stringify(vars);
    } catch (e) {
        gs.error('Error in translating messages in vars : ' + e.toString());
    }
})(context);
