(function executeRule(current, previous /*null when async*/) {
    var target = new GlideRecord('sys_app_module');
    if (target.get("d083cb52b706001032d189fbde11a943")) {
        target.active = (current.value.toString() == 'true');
        target.update();
    }

})(current, previous);
