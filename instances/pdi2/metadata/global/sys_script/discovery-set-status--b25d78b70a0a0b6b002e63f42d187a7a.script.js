var dr = new DiscoveryResult(current.sys_id);

if (current.scratchpad.cancel) {
    current.state = "Canceled";
    dr.markCanceled();
} else {
    current.state = "Active";
    dr.markActive();
}
