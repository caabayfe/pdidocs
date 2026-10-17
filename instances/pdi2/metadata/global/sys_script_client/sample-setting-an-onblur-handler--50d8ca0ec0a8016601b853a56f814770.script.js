function onLoad() {
    var control = g_form.getControl('priority');
    jslog('control = ' + control);
    control.onblur = myOnBlur;
}

function myOnBlur() {
    alert(getMessage('I blurred'));
}
