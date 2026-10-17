
    var title = getMessage('Connection Test');
    
    function testAccountConnection() {
	var gm = new GlideModal('email_connection_test', false /*read-only*/);
	gm.setTitle(title);
	gm.setWidth(500);
	gm.render();
}
