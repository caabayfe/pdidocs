function exportPDF(){
	var pdfExportConfig = {
		dataDoctype: true,
		margins: '10mm',
		mediaPrint: true,
		smartShrink: true,
		zoomFactor: '100',
		paperSize: 'A4',
		orientation: 'portrait'
	};
	var dialog = new GwtPollDialog($('url').getValue(), JSON.stringify(pdfExportConfig), 0, '', 'whtpexport');
	dialog.on('beforeclose', function() {
		window.setTimeout(function(){
		   $j('.download-report').focus();
		}, 100);
	});
	dialog.execute();
}
