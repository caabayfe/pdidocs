(function(context) {
    try {
        var vars = JSON.parse(context.props_details.vars || '{}');
        vars.heading = gs.getMessage('First, install a required plugin');
        vars.desc = gs.getMessage('With the Advanced Work Assignment (AWA) plugin, you can automatically assign work items based on agent availability, capacity, skills, or other criteria you define.');

        context.props_details.vars = JSON.stringify(vars);
    } catch (e) {
        gs.error('Error in translating messages in vars : ' + e.toString());
    }
})(context);
