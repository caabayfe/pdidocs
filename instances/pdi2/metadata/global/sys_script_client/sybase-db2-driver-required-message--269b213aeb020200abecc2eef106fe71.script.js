function onLoad() {
	var selectedFormat = g_form.getValue('format');
	var selectedFormatLabel = g_form.getOption('format', selectedFormat).text;
	var midServer = g_form.getValue('mid_server');
	if(selectedFormat === 'com.ibm.db2.jcc.DB2Driver' || selectedFormat === 'com.sybase.jdbc3.jdbc.SybDriver'){
		var link = '<a target="_blank" href="https://hi.service-now.com/kb_view.do?sysparm_article=KB0551236">Read More</a>. ';
		if(midServer){
		    var ignoreMsg = 'Disregard this message if the JDBC driver has been added to the MID server.';
			var informMsg = 'The MID server does not include the ' + selectedFormatLabel + ' JDBC driver by default, you must manually add it to use the ' +  selectedFormatLabel + ' format.';
			var msg = informMsg + ' ' + ignoreMsg + ' ' + link;
		    g_form.addInfoMessage(new GwtMessage().getMessage(msg));
	   } else {
		   var midRequiredMsg = 'The ' + selectedFormatLabel + ' integration is only supported through a MID server with the ' + selectedFormatLabel + ' JDBC driver. ' + link;
			g_form.addWarningMessage(new GwtMessage().getMessage(midRequiredMsg));
	   }
   }
}
