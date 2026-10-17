/**
 * Handles all the details of formatting Mac OS name
 * 
 */
var MacOSNameHelper = Class.create();

MacOSNameHelper.prototype = {
    initialize: function() { /* do nothing */ },

    formatMacOSName: function(name, osVersion) {
        // do not classify this as a computer if OS name is not found
        if (JSUtil.nil(name))
            return null;

        var newName = this.osCleanupName(name, osVersion);
        newName = OSChoice.reconcile(newName);
        return newName;
    },

    /**
    *
    * sample input: osName:Mac OS X and osVersion:10.15.7
    *        output: Mac OS 10 (OS/X)
    * sample input: osName: macOS
    *        output: macOS
    *
    **/
    osCleanupName: function(osName, osVersion) {
        if (osName.startsWith("macOS")) {
            return osName;
        } else {
            var macOSMajorVersion = osVersion.split('.')[0];
            var macOSName = "Mac OS "+ macOSMajorVersion +" (OS/X)";

            return macOSName;
        }
    },
    
    type: "MacOSNameHelper"
}
