var UXADownloader = Class.create();
UXADownloader.prototype = {
    initialize: function() {
        this.restMessageUtil = new UXARestMessageUtil();
    },

    // ========== ABSTRACT GETTERS (Must be overridden) ==========

    getCallerName: function() {
        var error = 'UXADownloader: getCallerName() must be overridden in child class';
        gs.warn(error);
    },

    getEndpoint: function() {
        var error = 'UXADownloader: getEndpoint() must be overridden in child class';
        gs.warn(error);
    },

    getHttpMethod: function() {
        var error = 'UXADownloader: getHttpMethod() must be overridden in child class';
        gs.warn(error);
    },

    getHeaders: function() {
        // Optional: defaults to empty object
        return {};
    },

    getRequestBody: function() {
        return {};
    },

    // Main template method that accepts configuration
    downloadAndProcessResult: function() {
        if (!this.shouldDownload()) {
            gs.warn('UXADownloader: Validation checks failed');
            return false;
        }

        var data = this.download();
        if (!data) {
            return false;
        }

        this.postProcess();
        return true;
    },

    // Basic validation
    shouldDownload: function() {
        // Core validation (on-premises, maintenance mode)
        if (!sn_app_analytics.SNAnalytics.isEnabled() || !sn_app_analytics.UsageInsightsUtil.shouldDownloadRunOnInstance()) {
            gs.debug('UXADownloader: Skipping download - Analytics disabled or on-premises/selfhosted instance detected');
            return false;
        }

        return true;
    },

    download: function() {
        return this.downloadData(
            this.getEndpoint(),
            this.getHttpMethod(),
            this.getRequestBody(),
            this.getHeaders()
        );
    },

    // Generic download data method with retry logic
    downloadData: function(endpoint, httpMethod, requestBody, customHeaders) {
        var maxAttempts = 3;
        var callerName = this.getCallerName();

        for (var attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                var restMessage = this.restMessageUtil.setupRestMessage(endpoint, httpMethod, requestBody, customHeaders);

                if (!restMessage) {
                    return null;
                }

                var response = restMessage.execute();
                var status = response.getStatusCode();
                var body = response.getBody();

                if (status >= 200 && status < 300) {
                    gs.debug('UXADownloader: Download successful, status: ' + status + ' (' + callerName + ')');
                    return body;
                } else {
                    if (this._isRetryableStatus(status)) {
                        if (attempt < maxAttempts) {
                            gs.info('UXADownloader: Retryable error (status=' + status + '), attempt ' + attempt + '/' + maxAttempts + ' (' + callerName + ')');
                            // gs.sleep(retryDelayMs); // Uncomment if needed
                            continue; // Retry
                        }
                    }

                    // Non-retryable error or max attempts reached
                    gs.warn('UXADownloader: Non-retryable error or max attempts reached, status=' + status + ', body=' + body + ' (' + callerName + ')');
                    return null;
                }

            } catch (e) {
                if (attempt < maxAttempts) {
                    gs.warn('UXADownloader: Exception on attempt ' + attempt + '/' + maxAttempts + ': ' + e.message + ' (' + callerName + ')');
                    // gs.sleep(retryDelayMs); // Uncomment if needed
                    continue;
                }

                gs.warn('UXADownloader: All retry attempts failed: ' + e.message + ' (' + callerName + ')');
                return null;
            }
        }
    },

    postProcess: function() {
        // add any post processing here
        gs.debug('UXADownloader: Post-processing completed (' + this.getCallerName() + ')');
    },

    // Determine if status code is retryable
    _isRetryableStatus: function(status) {
        // Retry on server errors and specific client errors
        return status === 408 || // Request Timeout
            status === 429 || // Too Many Requests
            status === 500 || // Internal Server Error
            status === 502 || // Bad Gateway
            status === 503 || // Service Unavailable
            status === 504; // Gateway Timeout
    },

    type: 'UXADownloader'
};
