(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template, /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action, /* Optional GlideRecord */ event) {

    var state = current.getValue('state');
    var emailBody = "Data extraction for Process Mining project <a href='" + current.getLink() +"' target='_blank'>" + current.getValue("number") +" - " + current.getValue("name") + "</a> has been ";

    if (state == 'AVAILABLE') {
        emailBody += 'successfully completed.<br/><br/>' + getLinkForWorkbench() + ' to view in analyst workbench.';

    } else if (state == 'ERROR') {
        emailBody += 'completed with error. <br/> <br/>' + getLinkForProminProjectDef() + ' to view project definition.';
    } else if (state == 'CANCELLED') {
        emailBody += 'cancelled. <br/> <br/>' + getLinkForProminProjectDef() + ' to view project definition.';
    }

    template.print(emailBody);

    function getLinkForProminProjectDef() {
        return "<a href='" + current.getLink() + "' target='_blank'>Click here</a>";
    }

    function getLinkForWorkbench() {
        var graphLink = gs.getProperty('glide.servlet.uri');
		graphLink = graphLink.substring(0, graphLink.length - 1);
		var workbenchLink = new global.ProminUtilsAJAX().getWorkBenchUrl(current.getUniqueValue());
		if(!gs.nil(workbenchLink)) {
			graphLink += workbenchLink;
		}
		return "<a href='" + graphLink + "' target='_blank'>Click here</a>";
    }

})(current, template, email, email_action, event);
