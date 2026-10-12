function transform(input) {
    try {
        var buffer = (input && input.bufferMinutes != null) ? input.bufferMinutes : 5;
        return new sn_upgrade_mgmt.BulkUpdateAppUtils().getCurrentTime(buffer);
    } catch (e) {
        gs.error("Error in 'Get Schedule Picker Time' broker: " + e.message);
        return {
            isError: true,
            error: e.message
        };
    }
}
