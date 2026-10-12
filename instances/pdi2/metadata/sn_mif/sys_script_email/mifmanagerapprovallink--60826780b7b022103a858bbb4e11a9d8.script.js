(function runMailScript(current, template, email, email_action, event) {

	var link = 'sn_mif_managed_by_instance.do?sys_id=' + current.sys_id;

    var backgroundColor = 'background-color: #4F52BD;';
    var border = 'border: 1px solid #4F52BD;';
    var color = 'color: #ffffff;';
    var fontSize = 'font-size: 16px;';
    var textDecoration = 'text-decoration: none; border-radius: 4px;';
    var webKitBorder = '-webkit-border-radius: 4px;';
    var mozBorder = '-moz-border-radius: 4px;';
    var display = 'display: inline-block;';
    var padding = 'padding: 6px 16px;';
    var margin = 'margin-top:16px;';

    template.print('<a href="' + link + '"');
    template.print('style="' + backgroundColor + border + color + fontSize + textDecoration + webKitBorder + mozBorder + display + padding + margin);
    template.print('">');
    template.print(gs.getMessage('Open request'));
    template.print('</a>');

})(current, template, email, email_action, event);
