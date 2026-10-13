current.state = 'Closed';
if (gs.getProperty('evt_mgmt.alert_ack_on_close') == 'true') { // if property is turned on
	current.acknowledged = true;
}
current.update();
