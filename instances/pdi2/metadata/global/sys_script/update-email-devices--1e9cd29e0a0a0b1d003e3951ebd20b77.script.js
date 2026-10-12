var thisSysID = current.sys_id;
var device = new GlideRecord('cmn_notif_device');
device.addQuery('user', thisSysID);
device.addQuery('type', 'Email');
device.addQuery('primary_email', true);
device.query();

while (device.next()) {
	gs.log('Updating ' + current.name + '\'s primary email device based on change to user record email address');
	device.email_address = current.email; 
	device.setWorkflow(false);
	device.update();
}
