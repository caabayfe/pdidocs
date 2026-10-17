var logMessages = [];
logMessages.push('EM - deactivate Add to changed alerts queue BR in EM Core from Global scope: Started running');
var startTime = new GlideDateTime(); // Start time measurement

var scopedBRsysId = "52c226fb07f62510b34ce06b0fd300cb";
var scopedBRgr = new GlideRecord("sys_script");

if (scopedBRgr.get(scopedBRsysId)) {
    if (scopedBRgr.getValue("sys_updated_by") === "admin") {
        if (scopedBRgr.getValue("active") == 1) {
            scopedBRgr.setValue("active", false);
            scopedBRgr.update();
            logMessages.push('Finished executing successfully, deactivated the scoped BR.');
        } else {
            logMessages.push('Finished executing, scoped BR was already deactivated.');
        }
    } else {

        var globalBRsysId = "07afd90f2f5212105b78b72db83f9b4b";
        var globalBRgr = new GlideRecord("sys_script");
        globalBRgr.get(globalBRsysId);

        if (globalBRgr.getValue("active") == 1) {
            globalBRgr.setValue("active", false);
            if (globalBRgr.update())
                logMessages.push('Finished executing, deactivated the Global BR because a user has updated the scoped BR.');
        } else {
            logMessages.push('Finished executing, no updates were made. A user has updated the scoped BR and Global BR was already deactivated.');
        }
    }
} else {
    logMessages.push('Finished executing, no updates were made. No scoped BR found');
}



var endTime = new GlideDateTime(); // End time measurement
var elapsedSeconds = (endTime.getNumericValue() - startTime.getNumericValue()) / 1000; // Calculate time in seconds
logMessages.push('Script took ' + elapsedSeconds + ' seconds to execute.');

gs.info(logMessages.join('\n'));
