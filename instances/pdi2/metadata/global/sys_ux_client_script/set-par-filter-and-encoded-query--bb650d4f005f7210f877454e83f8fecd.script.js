function handler({ api, event, imports }) {

    const table = api.context.props.table;
    const applicationSysId = api.context.props.applicationSysId;
    const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;

    //--------------------------------------------------
    // Internal function: Standard Filters
    //--------------------------------------------------
    function handleStandardFilters() {

        const { appliedFilters } = event.payload;

        api.setState("parFilters", ({ currentValue }) => {

            const { parFilters, encodedQueries } =
                mergePARFiltersV2(currentValue, appliedFilters);

            const filterQuery = encodedQueries[table] || "";
            let query = filterQuery;

            const domainPath = api.state.selected_domain_path;

            if (domainPath && domainPath !== "all") {
                query = query
                    ? query + "^sys_domain_pathSTARTSWITH" + domainPath
                    : "sys_domain_pathSTARTSWITH" + domainPath;
            }

            const finalQuery =
                "error_count>0^source_application=" + applicationSysId +
                (query ? "^" + query : "");

            api.setState("encodedQueryApp", finalQuery);
            api.setState("filterEncodedQuery", filterQuery);

            return parFilters;
        });
    }

    //--------------------------------------------------
    // Internal function: Domain Selection
    //--------------------------------------------------
    function handleDomainSelection() {
        const domainPath = event.payload?.selectedDomain;

        if (!domainPath) {
            return;
        }

        api.setState("selected_domain_path", domainPath);

        let existingQuery = api.state.encodedQueryApp || "";

        let parts = existingQuery
            .split("^")
            .filter(p => p);

        // remove previous domain condition
        parts = parts.filter(p => !p.startsWith("sys_domain_pathSTARTSWITH"));

        if (domainPath !== "all") {
            parts.push("sys_domain_pathSTARTSWITH" + domainPath);
        }

        const finalQuery = parts.join("^");

        api.setState("encodedQueryApp", finalQuery);
    }

    //--------------------------------------------------
    // Internal function: Reset
    //--------------------------------------------------

    function handleReset() {
        const domainPath = api.state.selected_domain_path;
        let encodedQueryApp = api.state.encodedQueryApp;

        if (!domainPath || domainPath === "all")
            return;

        const finalQuery = encodedQueryApp + "^sys_domain_pathSTARTSWITH" + domainPath;
        api.setState("encodedQueryApp", finalQuery);
    }

    //--------------------------------------------------
    // Event Router
    //--------------------------------------------------
    if (event.name === "SN_COMPONENT_FILTER#APPLIED_ITEMS") {
        handleStandardFilters();
    }

    if (event.name === "EF_DOMAIN_PICKER_DOMAIN_SELECTED") {
        handleDomainSelection();
    }

    if (event.name === "NOW_BUTTON_BARE#CLICKED" && event.elementId === "button_clear") {
        handleReset();
    }
}
