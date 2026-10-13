
		var DiscoveryErrorsUtilities = Class.create();

		(function () {
			var FILE_NAME = 'DiscoveryErrorsUtilities',
					LOG_PREFIX = '[' + FILE_NAME + ']';

			var nodeLogger = new sn_automation.AutomationAPI().getNodeLogger();
			var discovery_app_id = 'd5069fe9e70332001a310a6103f6a94b';
			var authenticationFailedErrorByCredentialType = {
				'ssh password': 'SN-1005',
				'ssh private key': 'SN-1005',
				'windows': 'SN-1099',
				'cim': 'SN-1100'
			};
			var missingCredentialsErrorCode = 'SN-1068';
			var _customDefaults = null;

			var DiscoveryErrorsUtilitiesInternal = {
				addError: addError,
				useErrorFramework: useErrorFramework,
				retryPendingErrors: retryPendingErrors,
				getFirstMatchedItomErrorCodeByCredentialTypes:
				getFirstMatchedItomErrorCodeByCredentialTypes,
				setDefaults: setDefaults
			};

			for (var name in DiscoveryErrorsUtilitiesInternal)
				DiscoveryErrorsUtilities[name] = DiscoveryErrorsUtilitiesInternal[name];

			/**
			 * Adds an error to the Error Framework or legacy DiscoveryErrorManager.
			 *
			 * Supported forms:
			 * - addError('SN-1005', 'Auth failed')
			 * - addError({ code: 'SN-1005', message: 'Auth failed', ext: 'ssh', ci: 'CI123', contextMap: { device_class: 'Server' } })
			 * - addError('SN-1005', 'Auth failed', { ext: 'ssh', ci: 'CI123' })
			 *
			 * In positional form, code and message are required as the first two arguments;
			 * a single options object may follow for other fields (e.g., ext, ci, key, instance, contextMap).
			 *
			 * Mandatory params: code, message
			 * Optional params will be populated from defaults if not provided
			 */
			function addError() {
				var params = _normalizeAddErrorArgs(arguments);
				var useEF = DiscoveryErrorsUtilities.useErrorFramework();

				var updatedParams = fillFromDefaults(params);
				var optionalKeyExtension = updatedParams.ext ? updatedParams.ext : '';

				if (useEF) {
					var key = optionalKeyExtension ? updatedParams.key + '_' + optionalKeyExtension : updatedParams.key;

					if (updatedParams.message)
						updatedParams.contextMap.detailed_message = updatedParams.message;
					if (updatedParams.ci)
						updatedParams.contextMap.ci = updatedParams.ci;

					var dto = ErrorManager.buildError(addCodePrefix(updatedParams.code), key, {
						'source': updatedParams.source,
						'instance': updatedParams.instance,
						'context': updatedParams.contextMap
					});

					ErrorManager.addError(dto);
				} else {
					var manager = new SNC.DiscoveryErrorManager();
					manager.addError(new SNC.DiscoveryErrorMsg(updatedParams.code, updatedParams.key, updatedParams.instance, updatedParams.ci, updatedParams.message, updatedParams.contextMap.device_class, optionalKeyExtension));
				}

				function _normalizeAddErrorArgs(args) {
					var len = args.length;
					
					if (len === 0)
						throw new Error('Invalid arguments: addError requires parameters.');

					var first = args[0];

					// Object format
					if (first && typeof first === 'object') {
						var copy = {};
						
						for (var key in first) {
							if (first.hasOwnProperty(key))
								copy[key] = first[key];
						}

						if (len > 1)
							throw new Error('Invalid arguments: when object is passed as first param we do not expect additional function params');
						if (!copy.code)
							throw new Error('Invalid arguments: error code is required.');
						if (!copy.message)
							throw new Error('Invalid arguments: error message is required.');

						return copy;
					}

					// Positional format
					if (typeof first === 'string') {
						var out = { code: first };
						var i, mergedOptions = false, sawMessage = false;

						// Start on 2nd arg
						for (i = 1; i < len; i++) {
							var a = args[i];

							// 2nd string arg must only be message
							if (typeof a === 'string') {
								if (!sawMessage) {
									out.message = a;
									sawMessage = true;
									continue;
								}
								
								throw new Error('Invalid arguments: only one non-object (message) argument is allowed after code; provide other fields via the options object.');
							}
							
							if (a && typeof a === 'object') {
								if (!sawMessage)
									throw new Error('Invalid arguments: expected (code, message[, options]).');
								if (mergedOptions)
									throw new Error('Invalid arguments: only one options object is allowed.');
								
								for (var k2 in a) {
									if (a.hasOwnProperty(k2))
										out[k2] = a[k2];
								}
								
								mergedOptions = true;
							}
						}
						if (!out.message)
							throw new Error('Invalid arguments: message is required.');
						return out;
					}

					throw new Error('Invalid arguments: expected (object) or (code, message[, options]).');
				}

				/**
				 * Fills in missing fields from defaults
				 * key: g_device.source
				 * source: g_status.scheduleID
				 * instance: g_device.status
				 * ci: g_device.getCmdbCi() (if available, stored in contextMap)
				 * contextMap.ip_address: g_device.source
				 * contextMap.device_class: g_device.getClassifiedAs()
				 */
				function fillFromDefaults(errorParams) {
					var updatedParams = Object.assign({}, errorParams);
					var d = _customDefaults || {};

					// g_device / g_status are injected by the probe runtime; in Rhino,
					// referencing an undeclared global throws ReferenceError, so use typeof.
					var device = (typeof g_device !== 'undefined' && g_device) ? g_device : {};
					var status = (typeof g_status !== 'undefined' && g_status) ? g_status : {};

					// Precedence: caller > custom defaults > globals/null
					if (updatedParams.source === undefined || updatedParams.source === null)
						updatedParams.source = (d.source !== undefined ? d.source : status.scheduleID); // This is not set in old DiscoveryErrorManager

					if (updatedParams.ci === undefined) {
						if (d.ci !== undefined)
							updatedParams.ci = d.ci;
						else if (typeof device.getCmdbCi === 'function')
							updatedParams.ci = device.getCmdbCi();
						else
							updatedParams.ci = null;
					}

					if (!updatedParams.key)
						updatedParams.key = (d.key !== undefined ? d.key : (device.source || ''));
					if (!updatedParams.instance)
						updatedParams.instance = (d.instance !== undefined ? d.instance : device.status);

					// Apply any other top-level custom defaults not explicitly handled (except contextMap)
					for (var topKey in d) {
						if (!d.hasOwnProperty(topKey) || topKey === 'contextMap')
							continue;
						if (updatedParams[topKey] === undefined)
							updatedParams[topKey] = d[topKey];
					}

					// Ensure contextMap exists, then merge defaults for any missing keys
					if (!updatedParams.contextMap)
						updatedParams.contextMap = {};
					if (d.contextMap && typeof d.contextMap === 'object') {
						for (var mapKey in d.contextMap) {
							if (d.contextMap.hasOwnProperty(mapKey) && updatedParams.contextMap[mapKey] === undefined)
								updatedParams.contextMap[mapKey] = d.contextMap[mapKey];
						}
					}

					// Legacy/global fallbacks for key context fields
					if (updatedParams.contextMap.ip_address === undefined)
						updatedParams.contextMap.ip_address = device.source;
					if (updatedParams.contextMap.device_class === undefined &&
							typeof device.getClassifiedAs === 'function')
						updatedParams.contextMap.device_class = device.getClassifiedAs();

					return updatedParams;
				}

				function addCodePrefix(code) {
					if (code.startsWith("SN-DISC-"))
						return code;

					return code.replace("SN-", "SN-DISC-");
				}
			}

			function setDefaults(defaults, options) {
				options = options || {};
				if (_customDefaults && options.override !== true)
					throw new Error('Custom defaults already set. Pass {override: true} to change them.');

				var sanitized = sanitizeDefaults(defaults || {});
				_customDefaults = deepFreeze(sanitized);

				return _customDefaults;

				function sanitizeDefaults(d) {
					var out = {};
					if (d && typeof d === 'object') {
						if (d.source !== undefined)
							out.source = d.source;
						if (d.key !== undefined)
							out.key = d.key;
						if (d.instance !== undefined)
							out.instance = d.instance;
						if (d.ci !== undefined)
							out.ci = d.ci;
						if (d.ext !== undefined)
							out.ext = d.ext;
						if (d.contextMap && typeof d.contextMap === 'object') {
							out.contextMap = {};
							for (var prop in d.contextMap) {
								if (d.contextMap.hasOwnProperty(prop))
									out.contextMap[prop] = d.contextMap[prop];
							}
						}
					}
					return out;
				}

				function deepFreeze(obj) {
					if (!obj || typeof obj !== 'object')
						return obj;
					if (typeof Object.freeze === 'function') {
						Object.freeze(obj);
						for (var key in obj) {
							if (obj.hasOwnProperty(key))
								deepFreeze(obj[key]);
						}
					}
					return obj;
				}
			}

			function useErrorFramework() {
				var efPluginActive = GlidePluginManager.isActive('com.glide.error_framework');
				var isAustraliaPlus = checkForAustraliaPlusBuild();
				var useErrorFramework = gs.getProperty('sn_disco_workspace.enable_error_framework', false);
				var useEFBool = (useErrorFramework === true || useErrorFramework === 'true');

				return efPluginActive && isAustraliaPlus && useEFBool;

				function checkForAustraliaPlusBuild() {
					var gdtAusRelease = new GlideDateTime('03-15-2026 00:00:00'); // Not exact but close enough for release dates
					var buildTag = gs.getProperty('glide.buildtag.last', '');
					var instanceName = gs.getProperty('instance_name', '');

					if (!buildTag && instanceName !== 'glide_db_dump')
						return false;
					if (!buildTag && (instanceName === 'glide_db_dump' || !instanceName))
						return true; // It's not definitive that test instances will be on A+ but it's a safe bet

					var dateMatches = buildTag.match(/\d{2}-\d{2}-\d{4}/g);
					var buildDate = dateMatches ? dateMatches[dateMatches.length - 1] : null;

					if (!buildDate)
						return false;

					var gdtBuildDate = new GlideDateTime(buildDate + " 00:00:00");

					return gdtBuildDate.after(gdtAusRelease);
				}
			}

			// Run quick discovery on all errors that are in "pending" state.
			// Place the errors in "in discovery" state before kicking off the discovery
			function retryPendingErrors() {
				// Find (in batches) all of the errors that are in "pending" state
				// For each pending error, attempt a quick discovery
				var error = new GlideRecord('automation_error_msg');
				error.addQuery('status', '4'); // "Pending discovery" errors.
				error.addQuery('application', discovery_app_id);
				error.orderBy('sys_updated_on'); // fifo
				error.setLimit(gs.getProperty('glide.discovery.errors.retry.batchsize', 100));
				error.query();
				while (error.next()) {
					retrySingleError(error.getValue('sys_id'));
				}
			}

			function retrySingleError(errorSysId) {
				var manager = new sn_svcerr.ErrorMgrScript(discovery_app_id);
				// Retry a single error but in the context of Retry All so that we get the correct UI behavior
				manager.retrySingleErrorForMultiple(errorSysId);
			}

			function getFirstMatchedItomErrorCodeByCredentialTypes(credentialTypes) {
				if (!Array.isArray(credentialTypes))
					throw TypeError('Invalid Argument: Expected argument to be an array');

				if (credentialTypes.length == 0)
					throw new Error('No credential types were provided');
				nodeLogger.debug(LOG_PREFIX
						+ ' Trying to find the first error code matching to one of the following values: '
						+ JSON.stringify(credentialTypes));

				var errorCode = missingCredentialsErrorCode;

				for (var index in credentialTypes) {
					var credentialType = credentialTypes[index];
					if (isMappedToErrorCode(credentialType)) {
						errorCode = authenticationFailedErrorByCredentialType[credentialType];
						break;
					}
				}
				return errorCode;
			}

			function isMappedToErrorCode(credentialType) {
				nodeLogger.debug(LOG_PREFIX
						+ ' Looking for "'
						+ credentialType
						+ '" in '
						+ JSON.stringify(
								Object.keys(
										authenticationFailedErrorByCredentialType
								)));
				var found = authenticationFailedErrorByCredentialType[credentialType] !== undefined;
				nodeLogger.debug(LOG_PREFIX + '"' + credentialType + '" was ' + (!found ? 'not' : '') + 'found');

				return found;
			}
		})();
		
