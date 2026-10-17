function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue == null) {
        return;
    }

    if (newValue === 'ALL NODES') {
        g_form.showFieldMsg("system_id", getMessage("Selecting 'ALL NODES' creates child jobs on all nodes."), "info");
        return;
    }

    if (newValue === 'ACTIVE NODES') {
        g_form.showFieldMsg("system_id", getMessage("Selecting 'ACTIVE NODES' creates child jobs on nodes having the 'schedulers' field set to 'any'. For example, worker nodes."), "info");
        return;
    }

    if (newValue === 'PRIMARY NODES') {
        g_form.showFieldMsg("system_id", getMessage("Selecting 'PRIMARY NODES' creates child jobs on nodes having the 'participation' field set to 'primary'."), "info");
        return;
    }

    //Avoid specifying an individual node as that node may not be available. In that case, scheduled events may not be executed.
    g_form.showFieldMsg("system_id", getMessage("SCHEDULER: Avoid specifying an individual node."), "warning");

}
