(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          // Add your code here
	var gr = new GlideRecord('sys_user');
	gr.get('user_name', current.getValue('sys_updated_by'));
	template.print(gr.getValue('first_name'));

})(current, template, email, email_action, event);
