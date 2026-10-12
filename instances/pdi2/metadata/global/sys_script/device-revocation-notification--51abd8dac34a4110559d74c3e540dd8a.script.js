(function executeRule(current, previous /*null when async*/ ) {

    if ((current.active.changes() && current.active == false) || current.operation() == 'delete') {
        gs.eventQueue('snc.trusted.device.revocation', current, gs.getUserID(), GlideTransaction.get().getRemoteAddr());
        var sampleMap = new GCFSampleMap();
        sampleMap.put('event_name', 'device_revoked');
        GCFCollector.recordUsageEvent('authentication', 'mobile_adaptive_auth', 'mobile_adaptive_auth_device_event', sampleMap);
    }
})(current, previous);
