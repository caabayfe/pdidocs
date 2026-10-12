(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

          // Add your code here
		template.print('Data Successfully Downloaded for the following Product category (s): <br>');
	    var categoryList= event.parm2.split();
	    var msg= '<br>' + categoryList.join('<br>');
        template.print(msg);

})(current, template, email, email_action, event);
