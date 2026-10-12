var AIXTranslationsAPI = Class.create();
AIXTranslationsAPI.prototype = {

    initialize: function() {},

    /**
     * Collect the content widget sys_ids of a dashboard by reading its
     * sys_aix_dashboard_item rows (each references a widget). Returns a
     * de-duplicated array of sys_aix_widget sys_ids.
     */
    _collectDashboardWidgetSysIds: function(dashboardSysId) {
        var items = new AIXDashboardItemAPI().listByDashboards([dashboardSysId]);
        return AIXAPIBase.uniqueRefs(items, 'widget');
    },

    /**
     * Walk a layout chain starting from a root layout sys_id and following
     * parent_layout references. Returns layout-widget sys_ids in render
     * order (innermost first). Delegates to AIXLayoutAPI.getChain which
     * is cycle-safe.
     */
    _walkLayoutChain: function(rootLayoutSysId) {
        if (!rootLayoutSysId) return [];
        var chain = new AIXLayoutAPI().getChain(rootLayoutSysId);
        return AIXAPIBase.uniqueRefs(chain, 'widget');
    },

    /**
     * Collect the content widget sys_ids of a composed page (one with no
     * page_widget) by walking its container tree:
     *   sys_aix_container (by page) -> sys_aix_widget_instance (by container)
     *   -> the instance's `widget` reference.
     * Delegates BFS to AIXContainerAPI.listByPageHierarchy and instance
     * lookup to AIXWidgetInstanceAPI.listByContainers.
     * Returns a de-duplicated array of sys_aix_widget sys_ids.
     */
    _collectComposedPageWidgetSysIds: function(pageSysId) {
        var containers = new AIXContainerAPI().listByPageHierarchy(pageSysId);
        if (containers.length === 0) return [];

        var containerSysIds = [];
        for (var i = 0; i < containers.length; i++) {
            containerSysIds.push(containers[i].sys_id);
        }

        var instances = new AIXWidgetInstanceAPI().listByContainers(containerSysIds);
        return AIXAPIBase.uniqueRefs(instances, 'widget');
    },

    // ─── Aggregation methods ──────────────────────────────────────────────
    //
    // The endpoint always returns translations grouped by record sys_id:
    //   {<recordSysId>: [{code, message}], ...}
    // Each record (widget or dependency) gets its own entry, keyed by its
    // sys_id. This allows karuna to write per-widget translation caches
    // and serve them individually on cache-miss or dynamic-load recovery.

    /**
     * Iterate widget or dependency records, parse their required_translations
     * field, and populate a grouped map:
     *   grouped[record.sys_id] = [{code, message}, ...]
     * Keys are NOT globally deduplicated — each record gets its own full set.
     * Deduplication within a single record still applies.
     */
    _collectFromRecordsGrouped: function(records, grouped, KEY_SEP) {
        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            if (!rec.sys_id) continue;
            var rt = rec.required_translations;
            if (!rt) continue;

            var entries;
            try {
                entries = (typeof rt === 'string') ? JSON.parse(rt) : rt;
            } catch (e) {
                continue;
            }
            if (!Array.isArray(entries) || entries.length === 0) continue;

            var recordKeys = grouped[rec.sys_id] || [];
            var recordSeen = {};
            // Rebuild seen set from existing keys for this record
            for (var e = 0; e < recordKeys.length; e++) {
                var ek = recordKeys[e];
                var ec = ek.code ? ek.code + KEY_SEP + ek.message : ek.message;
                recordSeen[ec] = true;
            }

            for (var j = 0; j < entries.length; j++) {
                var entry = entries[j];
                if (!entry || !entry.message) continue;
                var canonical = entry.code
                    ? entry.code + KEY_SEP + entry.message
                    : entry.message;
                if (!recordSeen[canonical]) {
                    recordSeen[canonical] = true;
                    recordKeys.push({code: entry.code || '', message: entry.message});
                }
            }
            if (recordKeys.length > 0) {
                grouped[rec.sys_id] = recordKeys;
            }
        }
    },

    /**
     * Collect required_translations from the sys_aix_dependency records
     * reachable from allWidgets, grouped by dependency sys_id. Dependencies
     * are resolved via direct widget→dependency m2m plus widget→bundle→
     * dependency chain (mirrors the Widget Metadata endpoint).
     */
    _collectDependenciesGrouped: function(allWidgets, grouped, KEY_SEP) {
        if (allWidgets.length === 0) return;
        var widgetSysIdMap = {};
        for (var w = 0; w < allWidgets.length; w++) {
            widgetSysIdMap[allWidgets[w].sys_id] = true;
        }
        var widgetSysIds = Object.keys(widgetSysIdMap);
        var widgetDeps = new AIXM2MWidgetDependencyAPI().listByWidgets(widgetSysIds);
        var widgetBundles = new AIXM2MWidgetDependencyBundleAPI().listByWidgets(widgetSysIds);
        var bundleSysIds = AIXAPIBase.uniqueRefs(widgetBundles, 'bundle');
        var bundleDeps = bundleSysIds.length > 0
            ? new AIXM2MBundleDependencyAPI().listByBundles(bundleSysIds)
            : [];
        var depSysIds = AIXAPIBase.uniqueRefs(
            widgetDeps.concat(bundleDeps),
            'dependency'
        );
        if (depSysIds.length > 0) {
            var dependencies = new AIXDependencyAPI().listByIds('sys_id', depSysIds);
            this._collectFromRecordsGrouped(dependencies, grouped, KEY_SEP);
        }
    },

    /**
     * Aggregate required_translations for a page, grouped by record sys_id.
     * Content widgets come from page_widget BFS (regular pages) or the
     * container→widget_instance tree (composed pages), plus the page's own
     * layout chain. Experience layout is fetched separately via
     * aggregateGroupedForExpLayout so caches stay independent.
     *
     * @param {string} pageSysId - sys_aix_page (or sys_aix_dashboard) sys_id
     * @param {string} [experienceId] - reserved for future use (currently unused)
     * @returns {Object} {<recordSysId>: [{code, message}], ...}
     */
    aggregateGroupedForPage: function(pageSysId, experienceId) {
        if (!pageSysId) return {};
        var pageApi = new AIXPageAPI();
        var page = pageApi.get(pageSysId);
        if (!page) return {};

        var KEY_SEP = ':\x1f:';
        var grouped = {};
        var widgetApi = new AIXWidgetAPI();
        var allWidgets = [];

        var pageWidgetSysId = AIXAPIBase.refVal(page.page_widget);
        if (pageWidgetSysId) {
            var pageWidgets = widgetApi.getWithDependencies(pageWidgetSysId);
            this._collectFromRecordsGrouped(pageWidgets, grouped, KEY_SEP);
            allWidgets = allWidgets.concat(pageWidgets);
        } else {
            var composedWidgetSysIds = this._collectComposedPageWidgetSysIds(pageSysId);
            for (var ci = 0; ci < composedWidgetSysIds.length; ci++) {
                var composedWidgets = widgetApi.getWithDependencies(composedWidgetSysIds[ci]);
                this._collectFromRecordsGrouped(composedWidgets, grouped, KEY_SEP);
                allWidgets = allWidgets.concat(composedWidgets);
            }
        }

        var pageLayoutSysId = AIXAPIBase.refVal(page.layout);
        var pageLayoutWidgetSysIds = this._walkLayoutChain(pageLayoutSysId);
        for (var pl = 0; pl < pageLayoutWidgetSysIds.length; pl++) {
            var plWidgets = widgetApi.getWithDependencies(pageLayoutWidgetSysIds[pl]);
            this._collectFromRecordsGrouped(plWidgets, grouped, KEY_SEP);
            allWidgets = allWidgets.concat(plWidgets);
        }

        // NOTE: experienceId is intentionally NOT used here — page content
        // does not include the experience layout chain. The experience layout
        // is fetched separately via aggregateGroupedForExpLayout so that its
        // cache is independent of any specific page.
        this._collectDependenciesGrouped(allWidgets, grouped, KEY_SEP);

        return grouped;
    },

    /**
     * Aggregate required_translations for a dashboard, grouped by record
     * sys_id. Content widgets come from sys_aix_dashboard_item rows.
     *
     * @param {string} dashboardSysId - sys_aix_dashboard sys_id
     * @returns {Object} {<recordSysId>: [{code, message}], ...}
     */
    aggregateGroupedForDashboard: function(dashboardSysId) {
        if (!dashboardSysId) return {};
        var KEY_SEP = ':\x1f:';
        var grouped = {};
        var widgetApi = new AIXWidgetAPI();
        var allWidgets = [];

        var itemWidgetSysIds = this._collectDashboardWidgetSysIds(dashboardSysId);
        for (var di = 0; di < itemWidgetSysIds.length; di++) {
            var itemWidgets = widgetApi.getWithDependencies(itemWidgetSysIds[di]);
            this._collectFromRecordsGrouped(itemWidgets, grouped, KEY_SEP);
            allWidgets = allWidgets.concat(itemWidgets);
        }

        this._collectDependenciesGrouped(allWidgets, grouped, KEY_SEP);
        return grouped;
    },

    /**
     * Aggregate required_translations for an app-shell's slot widgets
     * (header, start, end, footer), grouped by record sys_id.
     *
     * @param {string} appShellSysId - sys_aix_app_shell sys_id
     * @returns {Object} {<recordSysId>: [{code, message}], ...}
     */
    aggregateGroupedForAppShell: function(appShellSysId) {
        if (!appShellSysId) return {};
        var appShellApi = new AIXAppShellAPI();
        var appShell = appShellApi.get(appShellSysId);
        if (!appShell) return {};

        var KEY_SEP = ':\x1f:';
        var grouped = {};
        var widgetApi = new AIXWidgetAPI();
        var allWidgets = [];

        var slots = ['header', 'start', 'end', 'footer'];
        for (var s = 0; s < slots.length; s++) {
            var slotSysId = AIXAPIBase.refVal(appShell[slots[s]]);
            if (!slotSysId) continue;
            var slotWidgets = widgetApi.getWithDependencies(slotSysId);
            this._collectFromRecordsGrouped(slotWidgets, grouped, KEY_SEP);
            allWidgets = allWidgets.concat(slotWidgets);
        }

        this._collectDependenciesGrouped(allWidgets, grouped, KEY_SEP);
        return grouped;
    },

    /**
     * Aggregate required_translations from the experience layout chain and
     * lifecycle module ONLY — no page content, no app-shell. Grouped by
     * record sys_id. Cached per-experience on the karuna side and shared
     * across all pages, so only one Glide call is needed per experience.
     *
     * @param {string} experienceId - sys_aix_experience sys_id
     * @returns {Object} {<recordSysId>: [{code, message}], ...}
     */
    aggregateGroupedForExpLayout: function(experienceId) {
        if (!experienceId) return {};
        var expApi = new AIXExperienceAPI();
        var experience = expApi.get(experienceId);
        if (!experience) return {};

        var KEY_SEP = ':\x1f:';
        var grouped = {};
        var widgetApi = new AIXWidgetAPI();
        var allWidgets = [];

        var layoutSysId = AIXAPIBase.refVal(experience.layout);
        var layoutWidgetSysIds = this._walkLayoutChain(layoutSysId);
        for (var i = 0; i < layoutWidgetSysIds.length; i++) {
            var layoutWidgets = widgetApi.getWithDependencies(layoutWidgetSysIds[i]);
            this._collectFromRecordsGrouped(layoutWidgets, grouped, KEY_SEP);
            for (var j = 0; j < layoutWidgets.length; j++) {
                allWidgets.push(layoutWidgets[j]);
            }
        }

        var lifecycleSysId = AIXAPIBase.refVal(experience.lifecycle_module);
        if (lifecycleSysId) {
            var lcWidgets = widgetApi.getWithDependencies(lifecycleSysId);
            this._collectFromRecordsGrouped(lcWidgets, grouped, KEY_SEP);
            for (var k = 0; k < lcWidgets.length; k++) {
                allWidgets.push(lcWidgets[k]);
            }
        }

        this._collectDependenciesGrouped(allWidgets, grouped, KEY_SEP);
        return grouped;
    },

    /**
     * Aggregate required_translations for specific widgets by their sys_ids,
     * returning results grouped by widget sys_id.
     *
     * Primary use cases:
     *   1. Cache-miss recovery: when per-widget translation caches are
     *      tombstoned, only the affected widgets are re-fetched.
     *   2. Dynamic widget loading: when widgets are loaded at runtime outside
     *      the page tree (e.g. playbook renderDynamicWidget, dashboard canvas
     *      additions, <aiux-widget-loader>), their translations can be fetched
     *      on-demand by resolving tagName → sys_id via the widget_id_lookup
     *      Valkey index and calling this endpoint with the resolved sys_ids.
     *
     * @param {string[]} widgetSysIds - Array of sys_aix_widget sys_ids
     * @returns {Object} {<recordSysId>: [{code, message}], ...}
     */
    aggregateGroupedByWidgetIds: function(widgetSysIds) {
        if (!widgetSysIds || widgetSysIds.length === 0) return {};
        var KEY_SEP = ':\x1f:';
        var grouped = {};
        var widgetApi = new AIXWidgetAPI();
        var allWidgets = [];

        for (var i = 0; i < widgetSysIds.length; i++) {
            var widgets = widgetApi.getWithDependencies(widgetSysIds[i]);
            this._collectFromRecordsGrouped(widgets, grouped, KEY_SEP);
            for (var j = 0; j < widgets.length; j++) {
                allWidgets.push(widgets[j]);
            }
        }

        this._collectDependenciesGrouped(allWidgets, grouped, KEY_SEP);
        return grouped;
    },

    type: 'AIXTranslationsAPI'
};
