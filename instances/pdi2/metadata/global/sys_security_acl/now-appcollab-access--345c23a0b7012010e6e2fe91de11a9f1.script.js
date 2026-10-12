answer = hasAccess();

function hasAccess() {

    if (gs.hasRole('admin') || gs.hasRole('appcollab.apiuser'))
        return true;

    if (!gs.hasRole('delegated_developer'))
        return false;

    var authContext = JSON.parse(current);
    var resourcePath = authContext.resourcePath;

    if (isGetRequestOnDescriptor(resourcePath))
        return true;

    var scopeId = authContext.scopeId;

    if (scopeId === undefined || scopeId === '')
        return false;

    return gs.hasRightsTo(resourcePath, { "scopeId" : scopeId });
}

// GET requests on `descriptors` is open for all `delegated_developers`
function isGetRequestOnDescriptor(resourcePath) {
    var pattern = new RegExp("descriptors/GET$");
    return pattern.test(resourcePath);
}
