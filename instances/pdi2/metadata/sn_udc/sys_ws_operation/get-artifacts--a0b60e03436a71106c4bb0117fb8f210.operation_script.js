(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    //const params = UDCUtil.normalizeQueryParams(request.queryParams, true);
    const requestData = request.body.data;

    const files = requestData.files || [];
    const builders = requestData.builders || [];
    const types = requestData.types || [];

    // sets the current requesting studio platform
    const studioPlatform = requestData.studioPlatform;

    // Fetch only max no.of artifacts mentioned in the system property.
    // If the request count is more, then skip the remaining artifacts. Default count is 10
    const MAX_ARTIFACT_COUNT = 10;
    let maxArtifactCount = parseInt(gs.getProperty('sn_udc.artifact_details_max_count', MAX_ARTIFACT_COUNT), 10);
    maxArtifactCount = isNaN(maxArtifactCount) ? MAX_ARTIFACT_COUNT : maxArtifactCount;

    try {
        if (files.length + builders.length > maxArtifactCount)
            throw UDCConstants.errors.ARTIFACT_COUNT_EXCEEDED;

        const artifacts = {
            files: [],
            builders: [],
            types: []
        };

        // Fetch files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileTable = file.table;
            const fileSysId = file.sysId;
            const fileBuilder = file.builder;
            const fileScopeSysId = file.scopeSysId;
            const additionalParams = file.additionalParams;
            artifacts.files.push(FileTaxonomy.getFileDetails({
                fileTable,
                fileSysId,
                fileBuilder,
                fileScopeSysId,
                additionalParams,
                studioPlatform
            }));
        }

        // Fetch builders
        for (let i = 0; i < builders.length; i++) {
            const builder = builders[i];
            artifacts.builders.push(FileTaxonomyBuilder.getBuilderDetails(builder));
        }

        // Fetch types
        for (const {
                typeSysId,
                sysId,
                builder,
                scopeSysId,
                additionalParams
            }
            of types) {
            artifacts.types.push(FileTaxonomy.getTypeDetailsForNewRecord({
                typeSysId,
                sysId,
                fileBuilder: builder,
                scopeSysId,
                additionalParams,
                studioPlatform
            }));
        }


        return artifacts;
    } catch (e) {
        switch (e) {
            case UDCConstants.errors.ARTIFACT_COUNT_EXCEEDED:
                throw new sn_ws_err.ServiceError()
                    .setStatus(400)
                    .setMessage(gs.getMessageLang("Requested artifact count exceeded the limit of {0}", "en", maxArtifactCount))
                    .setDetail(gs.getMessage("Requested artifact count exceeded the limit of {0}", maxArtifactCount));

            default:
                throw new sn_ws_err.ServiceError()
                    .setStatus(500)
                    .setMessage(gs.getMessageLang("Unhandled exception: {0}", "en", [e]))
                    .setDetail(gs.getMessage("Unhandled exception: {0}", [e]));
        }
    }
})(request, response);
