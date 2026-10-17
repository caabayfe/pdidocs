function transform(input) {
    var user = input.user;
    var tour = input.tour;

	if (user && tour) {
		var gr = new GlideRecord('sys_guided_tour_user_overrides');
		gr.addQuery('user', user);
		gr.addQuery('tour', tour);
		gr.query();
		
		if (gr.next()) {
			gr.disable_autolaunch = true;
			gr.update();
		} else {
			// Record does not exist → Insert
			var newGr = new GlideRecord('sys_guided_tour_user_overrides');
			newGr.initialize();
			newGr.user = user;
			newGr.tour = tour;
			newGr.disable_autolaunch = true;
			newGr.insert();
		}
	}

    return;
}
