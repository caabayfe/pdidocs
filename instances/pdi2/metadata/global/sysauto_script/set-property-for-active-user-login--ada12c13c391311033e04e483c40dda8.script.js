function setProperty() {
        GlidePropertiesDB.set('glide.authenticate.only.allow.active.user.login', true);
    }

try {
	var ga = new GlideAggregate('sys_user');
	ga.addQuery('active', false);
	ga.addQuery('locked_out', false);
	ga.addAggregate('COUNT');
	ga.query();
	gs.info('Executing fix script');
	if (!ga.next() || ga.getAggregate('COUNT') == 0) {
		/*Setting property - glide.authenticate.only.allow.active.user.login on the instance, when there
		are not users on the instance with active false and locked_out false.
		Once this property is set on the instance, it will not allow logins for inactive users.
		*/
		gs.info("Setting property - glide.authenticate.only.allow.active.user.login on the instance");
		setProperty();
	}
} catch(e) {
	gs.info("Exception in setting active user login only property. " + e);
}
