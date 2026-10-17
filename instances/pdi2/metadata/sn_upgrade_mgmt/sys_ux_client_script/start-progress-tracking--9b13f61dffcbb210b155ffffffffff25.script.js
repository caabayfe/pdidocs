/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const trackerId = api.state.gctracker;

    function renderAccordionHTML(data) {
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
                if (item.name === "UpgradeManagementConsoleSuiteUpdate_") return "Suite Update";
                if (item.name.startsWith("UpgradeManagementConsoleSuiteUpdate_")) {
                    var label = item.name.split("_")[1] || item.name;
                    return label.startsWith("@") ? "\u200B" + label : label;
                }
            }
            return item.name;
        }

        function renderItems(items, level) {
            var html = '';
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var hasChildren = item.children && item.children.length > 0;
                var percentComplete = Number(item.percent_complete || 0);
                var header = getHeaderLabel(item, level === 0);

                html += '<now-accordion-item expanded header="' + header + '">';
                html += '<div slot="metadata" style="display:flex;gap:0.5rem;align-items:center">';
                html += '<arc-heading level="4">' + getStatusText(item, percentComplete) + '</arc-heading>';
                if (percentComplete !== 100) {
                    html += '<now-loader size="sm"></now-loader>';
                }
                html += '</div>';
                html += '<div slot="content">';
                html += '<now-progress-bar value="' + percentComplete + '" ';
                html += 'label="' + getProgressLabel(item, percentComplete).replace(/"/g, '&quot;') + '" ';
                html += 'path-type="' + getPathType(item) + '" ';
                html += 'size="sm" label-position="bottom" max="100">';
                html += '</now-progress-bar>';

                if (hasChildren) {
                    html += '<now-accordion heading-level="5" hide-dividers trigger-icon=\'{"position":"start"}\'>';
                    html += renderItems(item.children, level + 1);
                    html += '</now-accordion>';
                }

                html += '</div></now-accordion-item>';
            }
            return html;
        }

        return '<now-accordion heading-level="5" hide-dividers trigger-icon=\'{"position":"start"}\'>' +
            renderItems([data], 0) +
            '</now-accordion>';
    }

    function stopPolling() {
        api.data.get_app_upgrade_list_1.refresh();
        helpers.timing.setTimeout(function() {
            if (this.window.suiteProgressInterval) {
                helpers.timing.clearInterval(this.window.suiteProgressInterval);
                this.window.suiteProgressInterval = null;
            }
        }, 0);
    }

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
            if (response && response.response) {
                rawXml = Object.values(response.response).join("");
            }

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
                    
                    var state = trackerData?.state;   
                    console.log("aaaa trackerData ",trackerData);             
                    if (trackerData) {
                        var htmlData = renderAccordionHTML(trackerData);
                        api.setState("gctrackerState",state);
                        api.setState('gcprogressTrackerHtmlString', htmlData);
                        if (state === '2') {
                            console.log("Update COMPLETE");
                            stopPolling();
                        } else if (state === '3') {
                            console.log("Update FAILED");
                            stopPolling();
                        }
                    }
                } catch (e) {
                    console.error("Parse error:", e);
                    api.setState('gcprogressTrackerHtmlString', "<div>Error parsing tracker data</div>");
                }
            }
        })
        .catch(function(error) {
            if (attempt < maxRetries) {
                helpers.timing.setTimeout(function() {
                    fetchAndUpdateTracker(maxRetries, attempt + 1);
                }, 500);
            } else {
                api.setState('gcprogressTrackerHtmlString', "<div>Error fetching progress status after multiple attempts</div>");

            }
        });
    }

    // Start continuous polling every 2 seconds
    helpers.timing.setTimeout(function() {
        this.window.suiteProgressInterval = helpers.timing.setInterval(fetchAndUpdateTracker, 2000);
    }, 0);

    fetchAndUpdateTracker();
}
