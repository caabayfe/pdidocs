function transform(input) {
    let isStatusBarEnabled = false;
    let sessionScopeAndUpdateSet = {};

    try {
        // TODO: Remove the below code once DEF0589428 is fixed
        const studioShellConfig = input?.isStatusBarEnabled ?
            JSON.parse(input.isStatusBarEnabled) :
            null;
        isStatusBarEnabled = studioShellConfig?.enableStatusBar ?? false;
    } catch (error) {
        gs.error(`Error parsing isStatusBarEnabled: ${error.message}`);
    }

    if (isStatusBarEnabled) {
        sessionScopeAndUpdateSet = global.UDCGlobal.getCurrentScopeAndUpdateSet();
        sessionScopeAndUpdateSet.scopeOfLastModifiedUpdateSet = DeveloperSessionWatch.getCurrentUpdateSetScopeForUser();
    }

    return sessionScopeAndUpdateSet;
}
