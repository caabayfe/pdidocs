(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var chatGr = new GlideRecord('sys_cs_collab_chat');
    var title = "";
    if (chatGr.get(event.parm2))
        title = chatGr.getValue('title');
    var fontSize = 'font-size: 16px;';
    var fontFamily = 'font-family: Lato, Arial, sans-serif;';
    template.print('<div style="' + fontSize + fontFamily + '">');
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
    template.print('<a href="' + instanceUrl + 'incident.do%3Fsys_id%3D' + current.getUniqueValue() + '%26open-collab-chat%3Dtrue%26collab_chat_id%3D' + event.parm2 + '"');
    template.print('style="' + backgroundColor + color + fontSize + fontFamily + textDecoration + webKitBorder + mozBorder + display + padding);
    template.print('">');
    template.print(gs.getMessage('View discussion'));
    template.print('</a><br><br>');
    template.print(gs.getMessage('{0}About:{1}', ['<strong>', '</strong><br><br>']));
    template.print(gs.getMessage('Title: {0}{1}{2}', ['<strong>', title, '</strong><br>']));
})(current, template, email, email_action, event);
