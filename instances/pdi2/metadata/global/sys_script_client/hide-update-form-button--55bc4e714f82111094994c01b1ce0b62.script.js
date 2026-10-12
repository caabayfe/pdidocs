function onLoad() {
    //Type appropriate comment here, and begin script below
	var items = $$('BUTTON').each(function(item) {
			if (item.innerHTML.indexOf('Update') > -1) {
				item.hide();
			}
        });
}
