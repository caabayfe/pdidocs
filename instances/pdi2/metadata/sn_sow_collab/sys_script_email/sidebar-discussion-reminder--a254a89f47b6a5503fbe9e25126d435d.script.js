(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var incidentSysIds = event.parm1;
    var incidentsData = {};
    var incidentGr = new GlideRecord('incident');
    incidentGr.addEncodedQuery('sys_idIN' + incidentSysIds);
    incidentGr.query();
    while (incidentGr.next()) {
        incidentsData[incidentGr.getUniqueValue()] = {
            'number': incidentGr.getValue('number'),
            'short_description': incidentGr.getValue('short_description'),
            'urgency': incidentGr.getValue('urgency')
        };
    }
    incidentSysIds = incidentSysIds.split(',');
    var chatSysIds = event.parm2;
    var chatsData = {};
    var chatGr = new GlideRecord('sys_cs_collab_chat');
    chatGr.addEncodedQuery('sys_idIN' + chatSysIds);
    chatGr.query();
    while (chatGr.next()) {
        chatsData[chatGr.getUniqueValue()] = {
            'title': chatGr.getValue('title')
        };
    }
    chatSysIds = chatSysIds.split(',');
    for (var i = 0; i < chatSysIds.length; i++) {
        var fontSize = 'font-size: 16px;';
        var fontFamily = 'font-family: Lato, Arial, sans-serif;';
        var lineBreakBorder = 'border: 0.5px solid #cdcdcd;';
        template.print('<div style="' + fontSize + fontFamily + '">');
        template.print(gs.getMessage('There are unread message(s) on {0}{1}{2}', ['<strong>', incidentsData[incidentSysIds[i]].number, '</strong><br><br>']));
        var backgroundColor = 'background-color: #4F52BD;';
        var color = 'color: #ffffff;';
        var textDecoration = 'text-decoration: none; border-radius: 4px;';
        var webKitBorder = '-webkit-border-radius: 4px;';
        var mozBorder = '-moz-border-radius: 4px;';
        var display = 'display: inline-block;';
        var padding = 'padding: 6px 16px;';
        var instanceUrl = gs.getProperty('glide.servlet.uri');
        if (instanceUrl.substr(-1) != '/') instanceUrl += '/';

        // The sidebar only works with the Polaris nav bar
        instanceUrl += 'now/nav/ui/classic/params/target/';
        template.print('<a href="' + instanceUrl + 'incident.do%3Fsys_id%3D' + incidentSysIds[i] + '%26open-collab-chat%3Dtrue%26collab_chat_id%3D' + chatSysIds[i] + '"');
        template.print('style="' + backgroundColor + color + fontSize + fontFamily + textDecoration + webKitBorder + mozBorder + display + padding);
        template.print('">');
        template.print(gs.getMessage('View discussion'));
        template.print('</a><br><br>');
        template.print(gs.getMessage('{0}About:{1}', ['<strong>', '</strong><br><br>']));
        template.print(gs.getMessage('Title: {0}{1}{2}', ['<strong>', chatsData[chatSysIds[i]].title, '</strong><br><br>']));
        template.print(gs.getMessage('Short description: {0}{1}{2}', ['<strong>', incidentsData[incidentSysIds[i]].short_description, '</strong><br><br>']));
        template.print(gs.getMessage('Urgency: {0}{1}{2}', ['<strong>', incidentsData[incidentSysIds[i]].urgency, '</strong><br><br>']));
        if (i != chatSysIds.length - 1)
            template.print('<hr style="' + lineBreakBorder + '"><br></div>');
    }
})(current, template, email, email_action, event);
