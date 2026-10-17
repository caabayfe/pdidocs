var emAIInsighet = new EmAiInsight();
var alertGr = new GlideRecord("em_alert");
//This is a workaround because of bug in the ML
var getAlertNumbers = function(sysids) {
	var alertMap = {};
	var gr = new GlideRecord("em_alert");
	gr.addQuery("sys_id","IN",sysids);
	gr.query();
	while(gr.next()) {
		alertMap[gr.sys_id] = String(gr.number);
	}
	return alertMap;
};
var returnArray = emAIInsighet.getSimilarAlertQuery(alertGr,current);
if (returnArray.length == 0) {
	gs.addInfoMessage(gs.getMessage(" No similar alerts found by the Machine Learning algorithm"));
	
} else {
    var infoString = "<TABLE style='background-color: transparent;'><TR><TH>"+
		               gs.getMessage('Alert Number')+"</TH><TH>"+
		               gs.getMessage('Sys ID')+ "</TH><TH>"+
		               gs.getMessage('Confidence')+"</TH>";
	
	var spaces = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	
	var sysids = "";
	for (var i = 0; i < returnArray.length; i++) {
		sysids = sysids + "," +returnArray[i].number;
	}
	
	var alNumberMap = getAlertNumbers(sysids);
	
	for (var i = 0; i < returnArray.length; i++) {
		var arr = returnArray[i];
		var alertNumber = alNumberMap[arr.number];
		infoString = infoString + "<TR><TD>" + spaces+
			"<a href='./em_alert.do?sys_id=" + arr.number  +"' >"+  alertNumber +" </a>" + 
			spaces + "</TD><TD>" + spaces + arr.number + spaces +"</TD><TD>" + 
			spaces + arr.confidence + spaces + "</TD></TR>"; 
	}
	infoString = infoString + "</TABLE>";
	gs.addInfoMessage(infoString);
}
action.setRedirectURL(current);
