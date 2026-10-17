(function runMailScript(/* GlideRecord */ current,
		/* TemplatePrinter */ template,
        /* Optional EmailOutbound */ email,
		/* Optional GlideRecord */ email_action,
        /* Optional GlideRecord */ event) {

	/*Current is the signal record in pa_xmr_signals*/
	/*event.parm1 is display value of UUID 
	and event.parm2 is the link to Agent Workspace as a string */

	var signalTypeChoice = current.signal_type;
	var signalType = current.signal_type.getDisplayValue();
	var uuidDisplayValue = '<strong>' + event.parm1 + '</strong>';
	
	if(signalTypeChoice == 5) {
		setEmailPropertiesForAntiSignal(template, email, uuidDisplayValue, signalType);
	} else {
		setEmailPropertiesForSignal(template, email, uuidDisplayValue, signalType, event.parm2);
	}
	
})(current, template, email, email_action, event);

function setEmailPropertiesForAntiSignal(template, email, uuidDisplayValue, signalType) {
	var lineOneArgs = [];
	var signalTypeStrong = '<strong>' + signalType + '</strong>';
	lineOneArgs.push(signalTypeStrong);
	lineOneArgs.push(uuidDisplayValue);
	var lineOne = gs.getMessage('A new {0} is detected in the scores of {1}. This suggests that the workflow that {1} represents, is considered to be in control, i.e. stable with predictable outcomes.', lineOneArgs);
	var staticText = getStaticContentForAntiSignal();
	var subject = gs.getMessage('A new {0} is detected', signalType);
	template.print('<p>' + lineOne + '</p>');
	template.print(staticText);
	email.setSubject(subject);
}

function getStaticContentForAntiSignal() {
	var text = gs.getMessage("This is the window of opportunity to start an initiative that fundamentally improves the outcomes of the workflow. The sustainable improvement will be evidenced in the scores of the indicator. On the KPI Signal page, the result of the improvement initiative is shown in the chart by a process control band that");
	var listLineOne = gs.getMessage("-has a higher/lower average score in line with the desired outcome or target score");
	var listLineTwo = gs.getMessage("and/or");
	var listLineThree = gs.getMessage("-is a more narrow band thereby indicating less variation and thus more predictable outcomes.");
	var combined =
		"<p>" + 
			text + 
			"<br>" + listLineOne +
			"<br>" + listLineTwo +
			"<br>" + listLineThree +
		"</p>";
	return combined;
}

function setEmailPropertiesForSignal(template, email, uuidDisplayValue, signalType, linkURL) {
	var lineOneArgs = [];
	var signalTypeStrong = '<strong>' + signalType + '</strong>';
	lineOneArgs.push(signalTypeStrong);
	lineOneArgs.push(uuidDisplayValue);
	var hrefTag = getLinkForEmail(linkURL);
	
	var lineOne = gs.getMessage('A new {0} is detected in the scores of {1}.', lineOneArgs);
	var lineTwo = gs.getMessage('Please investigate, and take the appropriate action on the {0}.', hrefTag);
	var subject = gs.getMessage('A new {0} is detected', signalType);

	template.print('<p>' + lineOne + '</p>');
	template.print('<p>' + lineTwo + '</p>');
	email.setSubject(subject);
}

//Param: Complete URL
//Returns: Anchor tag with href to KPI Signals Page
function getLinkForEmail(linkURL) {
	var attachLink = '<a href="' + linkURL + '">' + gs.getMessage('signal page') + '</a>';
	return attachLink;
}
