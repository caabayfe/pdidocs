(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var userGr = new GlideRecord('sys_user');
    userGr.get(event.parm2);
    var username = userGr.getValue('name');
	
    template.print(username);

})(current, template, email, email_action, event);
