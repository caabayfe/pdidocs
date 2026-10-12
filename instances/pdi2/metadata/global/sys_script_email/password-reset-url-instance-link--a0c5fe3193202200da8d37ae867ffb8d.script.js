(function runMailScript(current, template, email, email_action, event) {
        var instanceURL = gs.getProperty('glide.servlet.uri');
        template.print('A password reset was requested for your user account on the ServiceNow instance: ' + '<a href=' + instanceURL + '>' + instanceURL + '</a>' + ".");

    })(current, template, email, email_action, event);
