(function process(request, response) {
    var widgetIdOrSysId = request.pathParams.widgetIdOrSysId;
    if (gs.nil(widgetIdOrSysId)) {
        response.setStatus(400);
        response.setBody({ error: "Missing required path parameter: widgetIdOrSysId" });
        return;
    }

    try {
        var widgetApi = new AIXWidgetAPI();
        var widgets = widgetApi.getWithDependencies(widgetIdOrSysId);
        if (widgets.length === 0) {
            response.setStatus(404);
            response.setBody({ error: "Widget not found: " + widgetIdOrSysId });
            return;
        }

        // Collect standalone widget deps first so their sysIds can be included
        // in the single batch dep query below — without this, standalone widgets
        // are returned without their dependency sub-tables and the shared-module-
        // host import rewriter cannot resolve @shared/ imports for them.
        var standaloneWidgets = collectStandaloneWidgets(widgets, widgetApi);

        var widgetSysIds = [];
        for (var i = 0; i < widgets.length; i++) widgetSysIds.push(widgets[i].sys_id);
        for (var i = 0; i < standaloneWidgets.length; i++) widgetSysIds.push(standaloneWidgets[i].sys_id);

        var widgetDependency = new AIXM2MWidgetDependencyAPI()      .listByWidgets(widgetSysIds);
        var widgetBundle     = new AIXM2MWidgetDependencyBundleAPI().listByWidgets(widgetSysIds);

        var bundleSysIds     = AIXAPIBase.uniqueRefs(widgetBundle, 'bundle');
        var bundleDependency = new AIXM2MBundleDependencyAPI().listByBundles(bundleSysIds);

        var depSysIds    = AIXAPIBase.uniqueRefs(widgetDependency.concat(bundleDependency), 'dependency');
        var dependencies = new AIXDependencyAPI()      .listByIds('sys_id', depSysIds);
        var bundles      = new AIXDependencyBundleAPI().listByIds('sys_id', bundleSysIds);

        var body = {
            sys_aix_widget:                       widgets,
            sys_aix_dependency:                   dependencies,
            sys_aix_dependency_bundle:            bundles,
            sys_aix_m2m_widget_dependency:        widgetDependency,
            sys_aix_m2m_widget_dependency_bundle: widgetBundle,
            sys_aix_m2m_bundle_dependency:        bundleDependency
        };
        if (standaloneWidgets.length > 0) {
            body.standalone_widgets = standaloneWidgets;
        }
        response.setStatus(200);
        response.setBody(body);
    } catch (e) {
        gs.error("Widget Metadata failed for " + widgetIdOrSysId + ": " + e);
        response.setStatus(500);
        response.setBody({ error: "Failed to load widget metadata" });
    }

    /**
     * Scan all sys_aix_widget records in the graph for
     * component_compile_metadata.standalone_widget_deps, batch-fetch those
     * widgets from Glide, and return them. Tags already in the graph are
     * excluded to avoid duplication. Records with missing or malformed
     * component_compile_metadata are silently skipped.
     *
     * @param {Array} existingWidgets  - widgets already in the graph
     * @param {AIXWidgetAPI} api       - reused API instance
     * @returns {Array} standalone widget DTOs (may be empty)
     */
    function collectStandaloneWidgets(existingWidgets, api) {
        // knownScopesByTag[tag] holds the real scope of every widget with that
        // id already in the graph or already fetched — prevents duplicates and
        // cycle termination. Tracked per tag, not tag alone, since the same
        // tag can resolve to distinct widgets in different scopes.
        var knownScopesByTag = {};
        function markKnown(id, scope) {
            if (!knownScopesByTag[id]) knownScopesByTag[id] = {};
            knownScopesByTag[id][scope] = true;
        }
        // A dep is already satisfied if its exact scope is known, or if it
        // didn't name a scope (wildcard) and any scope is already known.
        function isKnown(tag, scope) {
            var scopes = knownScopesByTag[tag];
            if (!scopes) return false;
            return scope ? !!scopes[scope] : true;
        }
        for (var i = 0; i < existingWidgets.length; i++) {
            var ew = existingWidgets[i];
            markKnown(ew.id, ew.sys_scope.scopeName.toString());
        }

        var result = [];
        // BFS: start by scanning the original graph; each iteration scans the
        // newly fetched standalone widgets for their own standalone_widget_deps.
        var toScan = existingWidgets;

        while (true) {
            // Collect unseen {tag, scope?} deps from the current scan frontier,
            // grouped by tag so a single batch fetch can cover every scope
            // requested for that tag.
            var scopesByTag = {};
            for (var i = 0; i < toScan.length; i++) {
                var meta = toScan[i].component_compile_metadata;
                if (!meta || !meta.standalone_widget_deps) continue;
                var deps = meta.standalone_widget_deps;
                for (var j = 0; j < deps.length; j++) {
                    var dep = deps[j];
                    if (!dep || !dep.tag) continue;
                    var scope = dep.scope ? dep.scope.toString() : null;
                    if (isKnown(dep.tag, scope)) continue;
                    if (!scopesByTag[dep.tag]) scopesByTag[dep.tag] = [];
                    if (scopesByTag[dep.tag].indexOf(scope) === -1) scopesByTag[dep.tag].push(scope);
                }
            }

            var tags = Object.keys(scopesByTag);
            if (tags.length === 0) break;

            // Batch fetch all candidate records by id, then match each candidate
            // against the scopes requested for its tag — a per-candidate check
            // avoids the cross-product bug that a single DB-level IN filter on
            // scopes would introduce (id IN (a,b) AND scope IN (s1,s2) would
            // incorrectly match widget 'a' in scope s2 if it exists, even though
            // only 'a' in s1 was requested).
            var candidates = api.listByIds('id', tags);
            var newWidgets = [];
            for (var i = 0; i < candidates.length; i++) {
                var w = candidates[i];
                var scopes = scopesByTag[w.id];
                if (!scopes) continue;
                var wScope = w.sys_scope.scopeName.toString();
                var matched = false;
                for (var s = 0; s < scopes.length; s++) {
                    // No scope specified means "any scope" is acceptable.
                    if (!scopes[s] || scopes[s] === wScope) { matched = true; break; }
                }
                if (!matched) continue;
                markKnown(w.id, wScope);
                newWidgets.push(w);
            }

            if (newWidgets.length === 0) break;

            for (var i = 0; i < newWidgets.length; i++) result.push(newWidgets[i]);
            toScan = newWidgets;
        }

        return result;
    }
})(request, response);
