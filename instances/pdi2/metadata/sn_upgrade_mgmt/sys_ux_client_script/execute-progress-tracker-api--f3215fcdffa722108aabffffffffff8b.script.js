/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var payload = event.payload || {};
    var detail = payload.detail || {};
    var detailType = detail.type;

    function renderAccordionHTML(data) {
        // --- helper functions ---
        function getStatusText(item, percentComplete) {
            if (item.state === '2' && percentComplete === 100) {
                return 'Succeeded 100%';
            }
            if (item.state === '3') {
                return 'Failed ' + percentComplete + '%';
            }
            return 'Running ' + percentComplete + '%';
        }

        function getProgressLabel(item, percentComplete) {
            if (item.state === '2' && percentComplete === 100) {
                return item.duration ? 'Succeeded in ' + item.duration : 'Succeeded';
            }
            return item.message;
        }

        function getPathType(item) {
            if (item.state === '3') return 'error';
            return 'initial';
        }

        function getHeaderLabel(item, isRoot) {
            if (isRoot) {
                if (item.name === "UpgradeManagementConsoleBatchUpdate") return "Batch Update";
                if (item.name.startsWith("UpgradeManagementConsoleBatchUpdate_")) {
                    var label = item.name.split("_")[1] || item.name;
                    return label.startsWith("@") ? "\u200B" + label : label;
                }
            }
            return item.name;
        }

        // --- recursive renderer ---
        function renderItems(items, level) {
            let html = '';
            for (const item of items) {
                const hasChildren = item.children && item.children.length > 0;
                const percentComplete = Number(item.percent_complete || 0);
                const header = getHeaderLabel(item, level === 0);

                html += `<now-accordion-item expanded header="${header}">`;

                html += `<div slot="metadata" style="display:flex;gap:0.5rem;align-items:center">
                <arc-heading level="4">${getStatusText(item, percentComplete)}</arc-heading>
                ${percentComplete !== 100 ? '<now-loader size="sm"></now-loader>' : ''}
            </div>`;

                html += `<div slot="content">
                <now-progress-bar
                    value="${percentComplete}"
                    label=${JSON.stringify(getProgressLabel(item, percentComplete))}
                    path-type="${getPathType(item)}"
                    size="sm"
                    label-position="bottom"
                    max="100">
                </now-progress-bar>`;

                if (hasChildren) {
                    html += `<now-accordion heading-level="5" hide-dividers trigger-icon='{"position":"start"}'>`;
                    html += renderItems(item.children, level + 1);
                    html += `</now-accordion>`;
                }

                html += `</div></now-accordion-item>`;
            }
            return html;
        }

        // --- wrap root as accordion item too ---
        return '<now-accordion heading-level="5" hide-dividers trigger-icon=\'{"position":"start"}\'>' +
            renderItems([data], 0) +
            '</now-accordion>';
    }

    function stopPolling(installProgressModalHeader) {
        api.data.get_app_upgrade_list_1.refresh();
        helpers.timing.setTimeout(function() {
            if (this.window.modalPollInterval) {
                helpers.timing.clearInterval(this.window.modalPollInterval);
                this.window.modalPollInterval = null;
            }
        }, 0);
        api.setState("installProgressModalHeader", installProgressModalHeader);
    }

    if (detailType === "NOW_TEXT_LINK#CLICKED" && payload.cellContext && payload.cellContext.column.key === "state") {
        var cells = payload.cellContext.row.cells;
        var cellProps = cells.state.componentProps || {};
        var href = cellProps.installHref;
        var label = cellProps.label.toLowerCase();
        if (!label.includes("running") && !label.includes("pending") && !label.includes('failed')) {
            helpers.timing.setTimeout(function() {
                this.window.open(href, '_blank');
            }, 0);
        } else if (cellProps.showTracker) {
            var trackerId = cellProps.trackerId;

            // Open modal immediately
            helpers.modal.open('progress_completion_modal');

            // Function to fetch tracker data and update state with retry logic
            function fetchAndUpdateTracker(maxRetries = 5, attempt = 1) {
                var bodyParams =
                    "sysparm_processor=AJAXProgressStatusChecker" +
                    "&sysparm_scope=global" +
                    "&sysparm_want_session_messages=true" +
                    "&sysparm_name=getStatus" +
                    "&sysparm_execution_id=" + trackerId +
                    "&ni.nolog.x_referer=ignore" +
                    "&x_referer=batchInstallPopup.do%3Fexecution_tracker_id%3D" + trackerId + "%26sysparm_use_polaris%3Dtrue";

                helpers.snHttp("/xmlhttp.do", {
                        method: "POST",
                        headers: {
                            "Accept": "*/*",
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        body: bodyParams
                    })
                    .then(function(response) {
                        var rawXml = "";
                        if (response && response.response) rawXml = Object.values(response.response).join("");

                        var match = rawXml.match(/answer="([\s\S]*?)"/);

                        if (match && match[1]) {
                            try {
                                var trackerData = JSON.parse(
                                    match[1]
                                    .replace(/&quot;/g, '"')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&amp;/g, '&')
                                );
                                const state = trackerData?.state;
                                if (trackerData) {
                                    var htmlData = renderAccordionHTML(trackerData);
                                    api.setState('progressTrackerHtmlString', htmlData);
                                    if (state === '2') {
                                        stopPolling("Installed");
                                        api.setState("isUpdateComplete", true);
                                    } else if (state === '3') {
                                        stopPolling("Failed");
                                    }
                                }
                            } catch (e) {
                                api.setState('progressTrackerHtmlString', "<div>Error parsing tracker data</div>");
                            }
                        }
                    })
                    .catch(function(error) {
                        if (attempt < maxRetries) {
                            helpers.timing.setTimeout(function() {
                                fetchAndUpdateTracker(maxRetries, attempt + 1);
                            }, 500); // wait 0.5 seconds before retry
                        } else {
                            api.setState('progressTrackerHtmlString', "<div>Error fetching progress status after multiple attempts</div>");
                        }
                    });
            }

            // Start continuous polling every 2 seconds
            helpers.timing.setTimeout(function() {
                this.window.modalPollInterval = helpers.timing.setInterval(fetchAndUpdateTracker, 2000);
            }, 0);

            // Initial fetch
            fetchAndUpdateTracker();

        } else if (href) {
            helpers.timing.setTimeout(function() {
                this.window.open(href, '_blank');
            }, 0);
        }
    }
}
