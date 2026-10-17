var FLUENT_SERVICE_NAME = 'IDEFluentService';
var IDERequestBuilder = Class.create();
/**
 * Create a logger for a particular action and scope when creating requests/handling responses
 * Also capture timings
 */
var createLogger = function(action, scope, transactionId) {
    var stopWatch = new sn_glider.StopWatch();
    return {
        info: function(msg) {
            return gs.info('[IDE][' + action + '][scope:' + scope + '][transactionId: ' + transactionId + '] ' + msg);
        },
        error: function(msg, err) {
            return gs.error('[IDE][' + action + '][scope:' + scope + '][transactionId: ' + transactionId + '] ' + msg, err);
        },
        time: stopWatch.time.bind(stopWatch),
        timeEnd: function(timerName) {
            return stopWatch.timeEnd(timerName, '[' + action + '][scope:' + scope + '][transactionId: ' + transactionId + ']');
        }
    };
};

// Correctly validates if a specific role is assigned to the user
var hasRoleExactly = function(role) {
    var roles = gs.getUser().getRoles() + "";
    return roles.split(',').includes(role);
};

var FORGE_VERSION = '/v1';
var FORGE_SERVICE_ROOT = FORGE_VERSION + '/forge';
IDERequestBuilder.prototype = {
    initialize: function() {
        this.buildSupport = new sn_glider.IDEBuildSupport();
        this.skipCleanup = gs.getProperty('sn_glider.service.debug.skip_cleanup', false) === 'true';
    },
    /**
     * Create a build request containing:
     */
    createBuildRequest: function(scopeId, transactionId, excludePaths) {
        var logger = createLogger('build:request', scopeId, transactionId);
        logger.time('build:request');
        logger.info('creating build request');
        // Get all application files as an array
        logger.time('build:request:getAppFiles');
        var defaultExcludePaths = ['/node_modules/', '/.git/'];
        var pathsToExclude = defaultExcludePaths.concat(excludePaths || []);
        var files = this.buildSupport.getAppFiles(scopeId, pathsToExclude);
        logger.timeEnd('build:request:getAppFiles');
        if (!files || files.length < 1) {
            throw new Error('Cannot build scope. It has no files.');
        }
        // Get the package.json from the scope
        var packageJson = this.buildSupport.getPackageJson(scopeId);
        if (!packageJson) {
            throw new Error('Cannot build scope. It has no package.json.');
        }
        logger.time('build:request:dependenciesFromPackageJson');
        // get the list of dependencies from the package.json#dependencies that are installed on the instance
        logger.info('checking package.json#dependencies for dependencies installed on instance');
        var installedPackages = this.buildSupport.getInstalledDependenciesFromPackageJson(scopeId, packageJson);
        // get a list of now ui dependencies that are on instance and their types following package.json#nowUiDependencies
        logger.info('checking package.json#nowUiDependencies for dependencies installed on instance and retrieved dependency types');
        var nowUiDependencies = this.buildSupport.getNowUiDependencyTypesFromPackageJson(scopeId, packageJson);
        // get a list of node_modules packages already on the filesystem (will contain list of known typedefs)
        logger.info('getting list of packages installed in node_modules');
        var installedNodeModules = this.buildSupport.getInstalledNodeModules(scopeId);
        logger.timeEnd('build:request:dependenciesFromPackageJson');
        var body = {
            'files': files,
            'installedPackages': installedPackages,
            'installedNodeModules': installedNodeModules,
            'nowUiDependencies': nowUiDependencies,
            'skipCleanup': this.skipCleanup
        };
        logger.info('finished creating request body');
        var restMessage = new sn_internal_services.ServiceRESTMessage(FLUENT_SERVICE_NAME);
        restMessage.setRequestHeader('Content-Type', 'application/json');
        restMessage.setRequestHeader('Accept', 'multipart/form-data');
        restMessage.setRequestHeader('X-Transaction-Id', transactionId);
        restMessage.setHttpMethod('POST');
        restMessage.setPath(FORGE_SERVICE_ROOT + '/build');
        restMessage.setRequestBody(JSON.stringify(body));
        logger.info('finished building request');
        logger.timeEnd('build:request');
        return restMessage;
    },
    /**
     * Handle a build response from the application build service.
     */
    handleBuildResponse: function(scopeId, buildResponse, transactionId) {
        var logger = createLogger('build:response', scopeId, transactionId);
        logger.time('build:response');
        logger.info('handling build response');
        if (!buildResponse)
            throw new Error("No build response received from service");
        //Handle rate limit status code
        this.handleRateLimitStatusCode('build', buildResponse, logger);
        var buildLogs = [];
        var mpp;
        try {
            logger.info('parsing multipart build response');
            // Parse a multipart response containing the application metadata as a zip payload
            var contentType = buildResponse.getHeader('Content-Type') || buildResponse.getHeader('content-type');
            var contentLength = buildResponse.getHeader('Content-Length') || buildResponse.getHeader('content-length');
            mpp = new sn_ide.IDEMultipartParser(buildResponse, contentType, contentLength);
            // Forge Service send a 300 status code when there is an error
            // Defect already created to have an API to expose error message in ScriptedRESTResponse Object
            if (buildResponse.getStatusCode() == 300) {
                var errorCause = mpp && mpp.getParamValue('cause') || 'Build Service Error';
                logger.error(errorCause);
                var forgeError = new Error(errorCause);
                throw forgeError;
            }
            /**
             * DO NOT access the stream before we install the app, it will break things
             */
            logger.info('Installing application from multipart response');
            // Install the zip payload from the multipart response onto the instance as metadata
            logger.time('build:response:installAppFromMultipart');
            this.buildSupport.installAppFromMultipart(mpp);
            logger.timeEnd('build:response:installAppFromMultipart');
            // With the zip installed, we can now access other things safely
            logger.info('finished installing from build response');
            // Add generated files to the table
            logger.info('getting generated files from mulitpart response');
            var generated = mpp.getParamValue('generated-files');
            buildLogs = JSON.parse(mpp.getParamValue('logs'));
            logger.info('Extracted logs from build multipart response');
            // handle the status and return status as well incase there is a BuildError from Forge
            // no need to return early incase of build Failure as that will be handled in UI only
            var status = mpp.getParamValue('status') || '';
            // If they don't exist, exit
            if (generated) {
                this.buildSupport.updateOrInsertSourceFromJson(scopeId, JSON.parse(generated));
                logger.info('Completed adding generated files');
            } else {
                logger.info('no files generated, skipping');
            }
            if (status === 'build_failure') {
                logger.error('Build Failure while running build. Please verify the source code');
                buildLogs.push('[service-now][ERROR] Your application could not be built. Check logs for errors.');
            } else {
                buildLogs.push('[service-now] Application Installed');
            }
            return {
                logs: buildLogs,
                status: status
            };
        } catch (e) {
            logger.error('build response could not be handled', e);
            // See if we already have logs or if the error was thrown before logs were parsed
            buildLogs = buildLogs && buildLogs.length ? buildLogs : mpp && JSON.parse(mpp.getParamValue('logs') || '[]');
            if (Array.isArray(buildLogs)) {
                var catchedError = e.message || e.toString();
                buildLogs.push('[service-now] ' + catchedError);
                var buildError = new Error(catchedError);
                buildError.detailedLog = JSON.stringify(buildLogs);
                throw buildError;
            }
            throw e;
        } finally {
            logger.timeEnd('build:response');
        }
    },
    /**
     * Create a sync request to synchronize metadata files with application metadata using the
     * application build service.
     */
    createSyncRequest: function(scopeId, transactionId) {
        var logger = createLogger('sync:request', scopeId, transactionId);
        logger.info('building sync request');
        logger.time('sync:request');
        logger.info('retrieving application files');
        // Get all application files as an array
        var files = this.buildSupport.getAppFiles(scopeId, ['/node_modules/', '/.git/']);
        if (!files || files.length < 1) {
            throw new Error('Cannot build scope. It has no files.');
        }
        try {
            logger.info('creating input stream from application metadata');
            // Create an input stream from application metadata on instance
            logger.time('sync:request:getAppMetadataInputStream');
            var appMetadataInputStream = this.buildSupport.getAppMetadataInputStream(scopeId, null);
            logger.timeEnd('sync:request:getAppMetadataInputStream');
            logger.info('creating multipart builder');
            // Build a multipart object
            logger.time('sync:request:multipartBuilder');
            var multipartBuilder = this.buildSupport.getMultipartBuilder();
            logger.info('adding files to multipart request as json');
            multipartBuilder.addTextBody('files', JSON.stringify({
                'files': files
            }));
            multipartBuilder.addTextBody('options', JSON.stringify({
                'skipCleanup': this.skipCleanup
            }));
            logger.info('adding application metadata to multipart request');
            multipartBuilder.addBinaryBody('metadata', appMetadataInputStream);
            logger.info('building multipart stream');
            // Build the multipart stream
            multipartBuilder.build();
            logger.timeEnd('sync:request:multipartBuilder');
            logger.info('constructing request');
            // Build the sync request
            var restMessage = new sn_internal_services.ServiceRESTMessage(FLUENT_SERVICE_NAME);
            logger.info('setting multipart content type on request');
            restMessage.setRequestHeader('Content-Type', multipartBuilder.getContentType());
            restMessage.setRequestHeader('Accept', 'application/json');
            restMessage.setRequestHeader('X-Transaction-Id', transactionId);
            restMessage.setHttpMethod('POST');
            restMessage.setPath(FORGE_SERVICE_ROOT + '/sync');
            logger.info('setting multipart stream on request');
            // Pass the stream from the multipart object
            logger.time('sync:request:setRequestBodyBytes');
            restMessage.setRequestBodyBytes(multipartBuilder.getBytes());
            logger.timeEnd('sync:request:setRequestBodyBytes');
            logger.info('completed building request');
            return restMessage;
        } catch (e) {
            logger.error('could not build sync request', e);
            throw e;
        } finally {
            logger.timeEnd('sync:request');
        }
    },
    /**
     * Handle the sync response and update the application source code from the build service
     */
    handleSyncResponse: function(scopeId, syncResponse, transactionId) {
        var logger = createLogger('sync:response', scopeId, transactionId);
        var syncLogs = [];
        try {
            logger.time('sync:response');
            logger.info('handling sync response');
            if (!syncResponse) return;
            //Handle rate limit status code
            this.handleRateLimitStatusCode('sync', syncResponse, logger);
            // Parse the sync response
            logger.info('parsing response body as json');
            var syncBody = JSON.parse(syncResponse.getBody());
            syncLogs = syncBody.logs || ['Sync logs cannot be fetched'];
            // handle the status and return status as well incase there is a BuildError from Forge
            // no need to return early incase of build Failure as that will be handled in UI only
            var status = syncBody.status || '';
            if (syncResponse.getStatusCode() == 300) {
                var cause = syncBody.cause || 'Sync Service Error';
                var forgeError = new Error(cause);
                throw forgeError;
            }
            logger.info('updating source files with changes from sync response');
            // Update/insert files from the build service
            logger.time('sync:response:updateOrInsertSourceFromJson');
            this.buildSupport.updateOrInsertSourceFromJson(scopeId, syncBody.files);
            logger.timeEnd('sync:response:updateOrInsertSourceFromJson');
            logger.info('finished updating application source from sync response');
            if (status === 'build_failure') {
                logger.error('Build Failure while running sync. Please verify the source code');
                syncLogs.push('[service-now][ERROR] Your application could not be synced. Check logs for errors.');
            } else {
                syncLogs.push('[service-now] Application metadata synced');
            }
            return {
                logs: syncLogs,
                status: status
            };
        } catch (e) {
            logger.error('sync response could not be handled', e);
            if (syncLogs && Array.isArray(syncLogs)) {
                var catchedError = e.message || e.toString();
                syncLogs.push('[service-now] ' + catchedError);
                var syncError = new Error(catchedError);
                syncError.detailedLog = JSON.stringify(syncLogs);
                throw syncError;
            }
            throw e;
        } finally {
            logger.timeEnd('sync:response');
        }
    },
    /**
     * Create a new scoped application that follows the Now SDK conventions using
     * the build service.
     */
    createScaffoldRequest: function(scopeName, appName, appDescription, packageName, transactionId) {
        var logger = createLogger('scaffold:request', scopeName, transactionId);
        logger.time('scaffold:request');
        logger.info('handling scaffold request, ' + JSON.stringify({
            scopeName: scopeName,
            appName: appName,
            appDescription: appDescription,
            packageName: packageName
        }));
        // Check if the scopename is valid for the instance
        logger.info('validating scope name: ' + scopeName);
        var scopeNameUtil = new GlideScopeNameUtil();
        if (!scopeNameUtil.isScopeNameValid(scopeName) || scopeName === 'global') {
            throw new Error('Invalid scope name: ' + scopeName);
        }
        if (!packageName || !this.buildSupport.validatePackageName(packageName)) {
            throw new Error('Invalid app package name.  Package name must be a valid npm package name.');
        }
        logger.info('constructing request body');
        var body = {
            'scopeName': scopeName,
            'packageName': packageName,
            'appName': appName,
            'appDescription': appDescription || '',
            'skipCleanup': this.skipCleanup
        };
        // Send off the request
        logger.info('constructing request');
        var restMessage = new sn_internal_services.ServiceRESTMessage(FLUENT_SERVICE_NAME);
        restMessage.setRequestHeader('Content-Type', 'application/json');
        restMessage.setRequestHeader('Accept', 'multipart/form-data');
        restMessage.setRequestHeader('X-Transaction-Id', transactionId);
        restMessage.setHttpMethod('POST');
        restMessage.setPath(FORGE_SERVICE_ROOT + '/scaffold');
        restMessage.setRequestBody(JSON.stringify(body));
        logger.info('finished creating scaffold request');
        logger.timeEnd('scaffold:request');
        return restMessage;
    },
    /**
     * Handle the application scaffolding response from the build service and install the relevant metadata
     * and application files from the build service.
     */
    handleScaffoldResponse: function(scopeName, scaffoldResponse, transactionId) {
        var logger = createLogger('scaffold:response', scopeName, transactionId);
        logger.time('scaffold:response');
        logger.info('handling scaffold response');
        if (!scaffoldResponse) return;
        //Handle rate limit status code
        this.handleRateLimitStatusCode('scaffold', scaffoldResponse, logger);
        var scaffoldLogs = [];
        var mpp;
        try {
            // Parse the multipart response from the build service
            logger.info('parsing multipart scaffold response');
            var contentType = scaffoldResponse.getHeader('Content-Type') || scaffoldResponse.getHeader('content-type');
            var contentLength = scaffoldResponse.getHeader('Content-Length') || scaffoldResponse.getHeader('content-length');
            mpp = new sn_ide.IDEMultipartParser(scaffoldResponse, contentType, contentLength);
            if (scaffoldResponse.getStatusCode() == 300) {
                var errorCause = mpp && mpp.getParamValue('cause') || 'Scaffold Service Error';
                logger.error(errorCause);
                var forgeError = new Error(errorCause);
                throw forgeError;
            }
            // Install the app metadata from the build service using the multipart response
            logger.info('installing app metadata from scaffold response');
            logger.time('scaffold:response:installAppFromMultipart');
            /**
             * DO NOT access the stream before we install the app, it will break things
             */
            var appGr = this.buildSupport.installAppFromMultipart(mpp);
            logger.timeEnd('scaffold:response:installAppFromMultipart');
            if (!appGr) {
                throw new Error('New app scaffolding failed to install. Check logs.');
            }
            // Pull the files from the multipart response
            logger.info('parsing json files from mulitpart response');
            var files = JSON.parse(mpp.getParamValue('files'));
            logger.info('Extracted logs from scaffold multipart response');
            scaffoldLogs = JSON.parse(mpp.getParamValue('logs'));
            // handle the status and return status as well incase there is a BuildError from Forge
            // no need to return early incase of build Failure as that will be handled in UI only
            var status = mpp.getParamValue('status') || '';
            // Insert the files from the scaffold response
            logger.info('inserting application files from scaffold response');
            logger.time('scaffold:response:updateOrInsertSourceFromJson');
            this.buildSupport.updateOrInsertSourceFromJson(appGr.getUniqueValue(), files.files);
            logger.timeEnd('scaffold:response:updateOrInsertSourceFromJson');
            logger.info('scaffolding complete');
            if (status === 'build_failure') {
                logger.error('Build Failure while running scaffold. Please verify the source code');
                scaffoldLogs.push('[service-now][ERROR] Your application could not be created. Check logs for errors.');
            } else {
                scaffoldLogs.push('[service-now] Application metadata synced');
            }
            scaffoldLogs.push('[service-now] Application created');
            return {
                scopeId: appGr.getUniqueValue(),
                logs: scaffoldLogs,
                status: status
            };
        } catch (e) {
            logger.error('scaffolding failed', e);
            // See if we already have logs or if the error was thrown before logs were parsed
            scaffoldLogs = scaffoldLogs && scaffoldLogs.length ? scaffoldLogs : mpp && JSON.parse(mpp.getParamValue('logs') || '[]');
            if (Array.isArray(scaffoldLogs)) {
                var catchedError = e.message || e.toString();
                scaffoldLogs.push('[service-now] ' + catchedError);
                var scaffoldError = new Error(catchedError);
                scaffoldError.detailedLog = JSON.stringify(scaffoldLogs);
                throw scaffoldError;
            }
            throw e;
        } finally {
            logger.timeEnd('scaffold:response');
        }
    },
    /**
     * Convert an existing scoped application into a Now SDK
     */
    createConvertRequest: function(appInfo, transactionId) {
        if (!this.shouldEnableFluentConvert()) {
            throw new Error(gs.getMessage('glider_ide:convert_app_disabled'));
        }


        const scopeId = appInfo.scopeId;
        const appName = appInfo.appName;
        const scopeName = appInfo.scopeName;

        var logger = createLogger('convert:request', scopeName, transactionId);
        logger.info('Building convert request');
        logger.time('convert:request');
        logger.info('retrieving application metadata');

        try {
            logger.info('Creating input stream from application metadata');

            // Create an input stream from application metadata on instance
            logger.time('convert:request:getAppMetadataInputStream');
            var appMetadataInputStream = this.buildSupport.getAppMetadataInputStream(scopeId, null);
            logger.timeEnd('convert:request:getAppMetadataInputStream');
            logger.info('creating multipart builder');

            // Build a multipart object
            logger.time('convert:request:multipartBuilder');
            var multipartBuilder = this.buildSupport.getMultipartBuilder();
            multipartBuilder.addTextBody('options', JSON.stringify({
                'projectType': 'fluent'
            }));

            var body = {
                'appName': appName,
                'scopeName': scopeName,
                'scopeId': scopeId
            };
            multipartBuilder.addTextBody('appInfo', JSON.stringify(body));
            logger.info('adding application metadata to multipart request');
            multipartBuilder.addBinaryBody('metadata', appMetadataInputStream);
            logger.info('building multipart stream');

            // Build the multipart stream
            multipartBuilder.build();
            logger.timeEnd('convert:request:multipartBuilder');
            logger.info('constructing request');

            logger.info('constructing request body');

            // Build the convert request
            var restMessage = new sn_internal_services.ServiceRESTMessage(FLUENT_SERVICE_NAME);
            logger.info('setting multipart content type on request');
            restMessage.setRequestHeader('Content-Type', multipartBuilder.getContentType());
            restMessage.setRequestHeader('Accept', 'application/json');
            restMessage.setRequestHeader('X-Transaction-Id', transactionId);
            restMessage.setHttpMethod('POST');
            restMessage.setPath(FORGE_SERVICE_ROOT + '/convert');
            logger.info('setting multipart stream on request');
            // Pass the stream from the multipart object
            logger.time('convert:request:setRequestBodyBytes');
            restMessage.setRequestBodyBytes(multipartBuilder.getBytes());
            logger.timeEnd('convert:request:setRequestBodyBytes');
            logger.info('completed building request');
            return restMessage;
        } catch (e) {
            logger.error('could not build convert request', e);
            throw e;
        } finally {
            logger.timeEnd('convert:request');
        }
    },
    handleConvertResponse: function(appInfo, convertResponse, transactionId) {
        if (!this.shouldEnableFluentConvert()) {
            throw new Error(gs.getMessage('glider_ide:convert_app_disabled'));
        }

        var scopeName = appInfo.scopeName;
        var scopeId = appInfo.scopeId;
        var logger = createLogger('convert:response', scopeId, transactionId);
        var convertLogs = [];
        try {
            logger.time('convert:response');
            logger.info('handling convert response');
            if (!convertResponse) return;

            //Handle rate limit status code
            this.handleRateLimitStatusCode('convert', convertResponse, logger);

            // Parse the multipart response from the build service
            logger.info('parsing multipart scaffold response');
            var contentType = convertResponse.getHeader('Content-Type') || convertResponse.getHeader('content-type');
            var contentLength = convertResponse.getHeader('Content-Length') || convertResponse.getHeader('content-length');
            mpp = new sn_ide.IDEMultipartParser(convertResponse, contentType, contentLength);

            if (convertResponse.getStatusCode() == 300) {
                var errorCause = mpp && mpp.getParamValue('cause') || 'Convert Service Error';
                var forgeError = new Error(errorCause);
                throw forgeError;
            }
            logger.info('create source files with changes from convert response');

            // Install the app metadata from the build service using the multipart response
            logger.info('installing app metadata from convert response');
            logger.time('convert:response:installAppFromMultipart');
            /**
             * DO NOT access the stream before we install the app, it will break things
             */
            var appGr = this.buildSupport.installAppFromMultipart(mpp);
            logger.timeEnd('scaffold:response:installAppFromMultipart');
            if (!appGr) {
                throw new Error('New app scaffolding failed to install. Check logs.');
            }

            // Pull the files from the multipart response
            logger.info('parsing json files from mulitpart response');
            var files = JSON.parse(mpp.getParamValue('files'));
            logger.info('Extracted logs from convert multipart response');
            convertLogs = JSON.parse(mpp.getParamValue('logs'));
            // handle the status and return status as well incase there is a BuildError from Forge
            // no need to return early incase of build Failure as that will be handled in UI
            var status = mpp.getParamValue('status') || '';

            // insert files from the build service
            logger.info('inserting application files from convert response');
            logger.time('convert:response:updateOrInsertSourceFromJson');
            this.buildSupport.updateOrInsertSourceFromJson(scopeId, files);
            logger.timeEnd('convert:response:updateOrInsertSourceFromJson');
            logger.info('conversion is complete');
            if (status === 'build_failure') {
                logger.error('Build Failure while running convert. Please verify the source code');
                convertLogs.push('[service-now][ERROR] Your application could not be converted. Check logs for errors.');
            } else {
                convertLogs.push('[service-now] Application metadata synced');
            }
            convertLogs.push('[service-now] Application converted');
            return {
                logs: convertLogs,
                status: status
            };
        } catch (e) {
            logger.error('convert response could not be handled', e);
            if (convertLogs && Array.isArray(convertLogs)) {
                var caughtError = e.message || e.toString();
                convertLogs.push('[service-now] ' + caughtError);
                var convertError = new Error(caughtError);
                convertError.detailedLog = JSON.stringify(convertLogs);
                throw convertError;
            }
            throw e;
        } finally {
            logger.timeEnd('convert:response');
        }
    },
    handleRateLimitStatusCode: function(serviceType, restResponse, logger) {
        if (restResponse.getStatusCode() === 429) {
            logger.error(`Request for ${serviceType} has exceeded the rate limit. Please try again after some time`);
            throw new Error(`Request for ${serviceType} has exceeded the rate limit. Please try again after some time`);
        }
    },
    failureResponse: function(msg, logs) {
        return {
            'type': 'error',
            'message': msg,
            'logs': logs || ''
        };
    },
    successResponse: function(msg, logs, status) {
        return {
            'type': 'success',
            'message': msg,
            'logs': logs || '',
            'status': status || '',
        };
    },
    shouldDisableIDE: function() {
        const isIDEEnabled = gs.getProperty('sn_glider.enable_ide', 'true') === 'true';
        const hasDisallowedRole = hasRoleExactly('sn_creatorstudio.restricted_user');
        return !isIDEEnabled || hasDisallowedRole;
    },

    shouldEnableFluentConvert: function() {
        return gs.getProperty('sn_glider.fluent_convert_enabled', 'false') === 'true';
    },
    type: 'IDERequestBuilder'
};
