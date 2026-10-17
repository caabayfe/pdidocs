(function executeRule(current, previous /*null when async*/ ) {

    if (isOOBConfig(current)) {
        g_scratchpad.isOOB = 'true';
    }

    function isOOBConfig(current) {
        // Microsoft translator exclusion provider pattern sys_id
        var MICROSOFT_EXCLUSION_PATTERN_SYS_ID = '803b8d77ff081210dc00ffffffffff0d';

        // Microsoft OEM 
        var MICROSOFT_OEM_EXCLUSION_PATTERN_SYS_ID = 'ef3fad06432012104df765e96fb8f2ff';

        // Google
        var GOOGLE_EXCLUSION_PATTERN_SYS_ID = 'cd65e646432012104df765e96fb8f285';

        // Check for OOB configuration records
        if (current.getValue('sys_id') === MICROSOFT_EXCLUSION_PATTERN_SYS_ID || current.getValue('sys_id') === MICROSOFT_OEM_EXCLUSION_PATTERN_SYS_ID || current.getValue('sys_id') === GOOGLE_EXCLUSION_PATTERN_SYS_ID)
            return true;
        return false;
    }

})(current, previous);
