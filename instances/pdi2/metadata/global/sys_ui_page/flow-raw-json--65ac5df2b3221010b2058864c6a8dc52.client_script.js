function getParmVal(name) {
    var url = document.URL.parseQuery();
    if(url[name] && isSysId(url[name])) {
        return url[name];
    }
    else {
        throw new Error('Invalid URL parameter');
    }
}

function getData() {
	var url = origin + "/api/now/processflow/operations/flow/plan/" + getParmVal('sysparm_context');
	try {
		fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-userToken': window.g_ck
			}
		}).then(function(response) {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();  // Assuming the response is in JSON format
		}).then(function(data) {
			if(this.readyState == this.DONE) {
				document.getElementById("raw-json").textContent = JSON.stringify(data, null, 4);
			}
		});
	} catch (ex) {
		console.error(ex);
	}

}

function isSysId(param) {
    return param.length === 32 && /^[a-zA-Z0-9]+$/.test(param);
}
