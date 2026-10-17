function onCondition() {
    var b = isUseExcludedChar() === 'true';
    g_form.setDisplay('whitelisted_special_characters', !b);
    g_form.setDisplay('excluded_special_characters', b);


}

function isUseExcludedChar() {
    var propGR = new GlideRecord('sys_properties');
    propGR.addQuery('name', 'glide.password_policy.use_excluded_special_char');
    propGR.query();
    if (propGR.next())
        return propGR.value;
    return 'false';

}
