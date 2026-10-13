function onLoad() {
	
	// find remote incident id
    var href = window.location.href;
	var remoteidAppearence = href.indexOf("remoteid");  

	// if remote incident exists, its data and URL and open URL in seporate TAB
	if (remoteidAppearence > 0) {
		
		// http://..../&remoteid=<number of task>&remoteurl=<URL>
		var getParams = href.substr(remoteidAppearence).split('&');
		var remoteidParam = getParams[0].split('=');
		var urlParam = getParams[1].split('=');

		var win = window.open(urlParam[1] + '/incident.do?sysparm_query=number='+remoteidParam[1], '_blank');
		if(win){
		//Browser has allowed it to be opened
			win.focus();
		}else{
		//Broswer has blocked it
			alert('Please allow popups for this site');
		}
	}   
}
