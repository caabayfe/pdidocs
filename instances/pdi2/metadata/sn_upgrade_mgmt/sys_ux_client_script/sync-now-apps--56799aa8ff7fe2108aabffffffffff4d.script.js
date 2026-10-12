/**
 * @param {object} params
 * @param {object} params.api
 * @param {object} params.helpers
 */
function handler({ api, helpers }) {

    // --- Step 1: Trigger sync with retry ---
    function triggerSync(maxRetries = 5, attempt = 1) {
        return helpers.snHttp("/api/sn_appclient/appmanager/sync_apps?request_type=trigger_apps_sync", {
            method: "GET",
            headers: { "Accept": "application/json" }
        })
        .then(function(response) {
            return response?.response?.result || {};
        })
        .catch(function(err) {
            if (attempt < maxRetries) {
                return helpers.timing.setTimeout(function() {
                    return triggerSync(maxRetries, attempt + 1);
                }, 2000);
            }
            throw new Error("Sync API failed after max retries");
        });
    }

    // --- Step 2: Poll sync status with retry ---
    function startPolling(trackerId) {
        let attempt = 1;
        const maxRetries = 5;

        function fetchAndUpdateStatus() {
            helpers.snHttp(`/api/sn_appclient/appmanager/sync_apps?request_type=get_apps_sync_status&tracker_id=${trackerId}`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            })
            .then(function(response) {
                const result = response?.response?.result;

                if (result?.isComplete) {
                    api.setState("isSyncNowBtnLoading", false);
                    api.setState("lastSyncTime", result?.appsLastSyncTime);

                    helpers.timing.setTimeout(function() {
                        if (this.window.syncPollInterval) {
                            helpers.timing.clearInterval(this.window.syncPollInterval);
                            this.window.syncPollInterval = null;
                        }
                    }, 0);
                }
            })
            .catch(function(error) {
                console.error(`Poll API failed (attempt ${attempt}):`, error);
                if (attempt >= maxRetries) {
                    api.setState("isSyncNowBtnLoading", false);

                    helpers.timing.setTimeout(function() {
                        if (this.window.syncPollInterval) {
                            helpers.timing.clearInterval(this.window.syncPollInterval);
                            this.window.syncPollInterval = null;
                        }
                    }, 0);
                }
            });

            attempt++;
        }

        // Start continuous polling every 2 seconds
        helpers.timing.setTimeout(function() {
            this.window.syncPollInterval = helpers.timing.setInterval(fetchAndUpdateStatus, 2000);
        }, 0);

        // Initial fetch immediately
        fetchAndUpdateStatus();
    }

    // --- Orchestration ---
    api.setState("isSyncNowBtnLoading", true);

    triggerSync()
        .then(function(syncResponse) {
            const trackerId = syncResponse?.trackerId;
            if (!trackerId) throw new Error("No trackerId returned from triggerSync");

            startPolling(trackerId);
        })
        .catch(function(err) {
            console.error("Sync flow failed:", err);
            api.setState("isSyncNowBtnLoading", false);
        });
}
