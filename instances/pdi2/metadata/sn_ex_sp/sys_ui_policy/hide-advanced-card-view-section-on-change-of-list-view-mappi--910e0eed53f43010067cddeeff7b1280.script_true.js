function onCondition() {
    g_form.clearValue('badge_color');
    g_form.clearValue('badge');
    g_form.clearValue('title');
    g_form.clearValue('description');
    g_form.clearValue('image');
    g_form.clearValue('field_1');
    g_form.clearValue('field_2');
	g_form.setSectionDisplay('basic_cardview', false);
	g_form.setDisplay('target_page',false);
	g_form.setDisplay('internal_link', false);
	g_form.setDisplay('external_link', false);
    g_form.setSectionDisplay('advanced_cardview', true);





}
