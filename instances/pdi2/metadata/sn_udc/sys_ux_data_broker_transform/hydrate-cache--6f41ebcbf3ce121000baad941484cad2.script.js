function transform(input) {
    let isFileNavigatorEnabled = false;

    try {
        // TODO: Remove the below code once DEF0589428 is fixed
        const studioShellConfig = input?.isFileNavigatorEnabled ?
            JSON.parse(input.isFileNavigatorEnabled) :
            null;
        isFileNavigatorEnabled = UDCUtil.shouldRenderAFN(studioShellConfig);
    } catch (error) {
        gs.error(`Error parsing isFileNavigatorEnabled: ${error.message}`);
    }

    if (isFileNavigatorEnabled) {
        FileTaxonomy.cacheAndGetTaxonomyStructure();
    }
}
