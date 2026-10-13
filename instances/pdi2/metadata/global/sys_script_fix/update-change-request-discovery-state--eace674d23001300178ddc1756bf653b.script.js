var stateProp = new GlideRecord('sys_properties');
//Updating "com.snc.change_request.disco.manual.state" to State model values if not modified
if (stateProp.get('7da6986c23481300178ddc1756bf6519')) {
	if (sn_collision.CollisionAPI.willBeReplacedOnUpgrade(stateProp)) {
		stateProp.setValue('value', 'Implement, Review');
		stateProp.update();
	}
}

//Updating "com.snc.change_request.disco.auto.state" to State model value if not modified
if (stateProp.get('4e9c62a423101300178ddc1756bf657c')) {
	if (sn_collision.CollisionAPI.willBeReplacedOnUpgrade(stateProp)) {
		stateProp.setValue('value', 'Review');
		stateProp.update();
	}
}
