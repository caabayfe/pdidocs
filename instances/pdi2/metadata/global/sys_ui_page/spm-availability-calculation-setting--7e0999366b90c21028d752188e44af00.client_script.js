var commitmentPropertyValue = "${commitmentPropertyValue}";
if(commitmentPropertyValue == "true") {
	document.getElementById('sysparm_availability_global_tz').disabled = true;
	document.getElementById('warning_text').hidden=false;
}

function onCommitmentChange() {
	if(document.getElementById('sysparm_availability_commitment_tz').value == "true") {
		document.getElementById('sysparm_availability_global_tz').disabled = true;
		document.getElementById('warning_text').hidden=false;
	} else {
		document.getElementById('sysparm_availability_global_tz').disabled = false;
		document.getElementById('warning_text').hidden=true;
	}
}
