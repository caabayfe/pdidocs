function onLoad() {
    var done = false;
	var translate = new GwtMessage();
    var interval = setInterval(function() {
        var el = g_form.getFormElement();
        el = el.getElementsByTagName("sn-form-name-values")[0];

        if (!el) {
            clearInterval(interval);
            return;
        }

        Array.prototype.forEach.call(el.getElementsByTagName("button"), function(el) {
            el.style.display = "none";
            done = true;
        });
        Array.prototype.forEach.call(el.querySelectorAll("[id^=name]"), function(el) {
            el.readOnly = true;
            done = true;
        });
        Array.prototype.forEach.call(el.querySelectorAll("[id^=value]"), function(el) {
            el.value = translate.getMessage(el.value);
            done = true;
        });
        if (done)
            clearInterval(interval);
    }, 100);
}
