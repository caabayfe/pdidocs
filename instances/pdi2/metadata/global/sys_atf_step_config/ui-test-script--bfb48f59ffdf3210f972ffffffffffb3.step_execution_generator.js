(function(step, stepResult, assertionObject) {
    var uiTest = window.snUiTest;

    assertionObject.executeStep = function(step, stepResult) {

        var testScript = step.inputs.script ? step.inputs.script.toString() : '';

        // Capture the original user before any impersonation happens.
        var _originalUserId = (window.g_user && window.g_user.userID) ? window.g_user.userID : '';

        // _sn_atf is set after createSNATF() inside the try block; declared here so
        // _unimpersonate() can close over it regardless of when it is called.
        var _user = null;
        var _sn_atf = null;

        // Updates the "Currently executing as" display in the ATF runner page.
        // Uses Angular $http so the .then() callback runs inside a digest cycle,
        // which triggers Angular's binding update without a manual $apply().
        // Fire-and-forget: errors emit a console.warn but do not affect impersonation.
        function _updateTestRunnerUser(userId) {
            if (!/^[0-9a-f]{32}$/.test(userId)) return;
            try {
                var runnerEl = document.querySelector('[ng-controller="TestRunner as testRunner"]');
                if (!runnerEl) return;
                var $http = window.angular.element(runnerEl).injector().get('$http');
                $http.get('/api/now/ui/user/' + userId, { params: { atf_do_not_rollback: 'true' } })
                    .then(function(response) {
                        try {
                            var scope = window.angular.element(runnerEl).scope();
                            if (scope && scope.testRunner) scope.testRunner.setCurrentUser(response.data.result);
                        } catch(e) {
                            console.warn('[ATF] Could not update scope after user resolution: ' + e);
                        }
                    });
            } catch(e) {
                console.warn('[ATF] Could not update the "Currently executing as" display in the test runner.');
            }
        }

        // Called by createExecutor's beforeFinish hook on every exit path (pass, fail, timeout).
        // Skipped entirely when no impersonation occurred. Always resolves — unimpersonation
        // errors are non-fatal (console.warn only).
        function _unimpersonate() {
            if (!_sn_atf || (!_sn_atf.wasImpersonated() && !_sn_atf.impersonationInFlight())) {
                return Promise.resolve();
            }
            console.log('[UNIMPERSONATE] Reverting session to original user: ' + _originalUserId);
            return new Promise(function(resolve) {
                var fallback = setTimeout(function() {
                    console.warn('[UNIMPERSONATE] Timed out after 5s');
                    _updateTestRunnerUser(_originalUserId);
                    resolve();
                }, 5000);
                var ajax = new GlideAjax('TestExecutorAjax');
                ajax.addParam('atf_do_not_rollback', 'true');
                ajax.addParam('sysparm_name', 'unimpersonate');
                ajax.addParam('sysparm_expected_user_id', _originalUserId);
                ajax.getXMLAnswer(function(answer) {
                    clearTimeout(fallback);
                    if (!answer) console.warn('[UNIMPERSONATE] Server returned empty — session may still be impersonated');
                    _updateTestRunnerUser(_originalUserId);
                    resolve();
                });
            });
        }

        var _executor  = uiTest.createExecutor(step, stepResult, _unimpersonate);
        var _settle    = _executor.settle;
        var _wrapAsync = _executor.wrapAsync;

        try {
            var frameWindow = g_ui_testing_util.getTestIFrameWindow();

            // Inject DTL into the test iframe so DOM traversal runs in the iframe's
            // JS realm. waitFor / expect are pure logic (no DOM access) so they stay
            // in the test runner realm to keep step Promise microtasks alive across
            // iframe navigations.
            var _frameDTL = uiTest.injectDTL(frameWindow);

            // Build the screen object (DOM queries only).
            var _screen = uiTest.createScreen(frameWindow, _frameDTL);

            // -----------------------------------------------------------------------
            // Execute the test script in the TEST RUNNER's realm (window.Function),
            // NOT in the iframe's realm. This is critical for navigation correctness:
            // if the async IIFE ran in frameWindow's realm, its Promise microtasks
            // would be cleared when the iframe navigates to a new page — the await
            // continuation after screen.navigate() would be dropped, the step
            // Promise would never settle, and the step would hang until timeout.
            //
            // Using window.Function keeps the async IIFE's Promise in the test
            // runner's realm, which is unaffected by iframe navigation.
            //
            // ServiceNow page globals (g_form, g_user, $j, GlideAjax) are injected
            // explicitly, captured from frameWindow at step start. They are valid for
            // the initial page; after screen.navigate() they still reference the
            // pre-navigation page — use screen.getBy*() queries for post-nav state.
            // -----------------------------------------------------------------------
            var expect                    = window.DTL.expect;             // pure logic — test runner realm
            var waitFor                   = window.DTL.waitFor;            // pure logic — test runner realm
            var within                    = _frameDTL.within;              // DOM queries — iframe realm

            // steps(stepId) returns the output variable map of a completed prior step.
            // params(paramName) returns the value of a parameter from the active parameter set.
            // Both are fetched lazily — the GlideAjax round-trip is skipped entirely when
            // the test script never calls them.
            var _steps  = uiTest.createStepsAccessor(step.test_result_id, step.atf_callable_step_result_id);
            var _params = uiTest.createParametersAccessor(step.test_result_id, step.atf_parameter_set_order);

            // Wrap async helpers so call-site stacks are captured for line-number reporting.
            waitFor                   = _wrapAsync(waitFor);
            try {
                for (var _k in _screen) {
                    if (/^find/.test(_k) && typeof _screen[_k] === 'function') {
                        _screen[_k] = _wrapAsync(_screen[_k], _screen);
                    }
                }
            } catch(e) {}

            // Build user and sn_atf together via the single init entry point.
            // GlideAjax is always taken from the runner window — UXF pages do not expose it
            // as an iframe global, so using window.GlideAjax is the correct reference.
            // getIframe and setPendingNavCancel are passed so sn_atf can implement navigate,
            // reload, goBack, goForward, and evaluate without depending on factory.js.
            var _ctx = _frameDTL._init({
                screen: _screen,
                GlideAjax: window.GlideAjax,
                updateRunnerUser: _updateTestRunnerUser,
                getIframe: function() { return g_ui_testing_util.getTestIFrame(); },
                setPendingNavCancel: function(fn) { _executor.setPendingNavCancel(fn); }
            });
            _user   = _ctx.user;
            _sn_atf = _ctx.sn_atf;
            _sn_atf.waitForElementToBeRemoved = _wrapAsync(_sn_atf.waitForElementToBeRemoved);

            // Wrap impersonate to handle the race condition where the step times out
            // while the impersonate Ajax is still in-flight. If the step has already
            // settled when the Ajax resolves, fire _unimpersonate() immediately so the
            // session is not left impersonated.
            var _origImpersonate = _sn_atf.impersonate;
            _sn_atf.impersonate = function(userId) {
                return _origImpersonate.call(_sn_atf, userId).then(function(result) {
                    if (_executor.isSettled()) {
                        _unimpersonate().catch(function(e) {
                            console.warn('[ATF] Post-settle unimpersonate failed:', e);
                        });
                    }
                    return result;
                });
            };

            var _AVAILABLE_APIS_HINT = ' — Available APIs: screen, user, sn_atf, expect, waitFor, within, steps, params, isVisible, isHidden, isEnabled, isDisabled, isChecked, isPartiallyChecked, isInDocument, isEmpty, hasFocus, hasClass, hasAttribute, hasAccessibleName, hasAccessibleDescription, hasStyle, hasText, hasValue, hasFormValues, containsElement, hasRole. ServiceNow-specific APIs (navigate, evaluate, upload, impersonate, getAttachmentFile) are on sn_atf.';
            function _annotateRefError(e) {
                if (e instanceof ReferenceError) e.message += _AVAILABLE_APIS_HINT;
            }

            var _injected = {
                screen: _screen,
                user: _user,
                sn_atf: _sn_atf,
                expect: expect,
                waitFor: waitFor,
                within: within,
                steps: _steps,
                params: _params,
                // Synchronous predicate helpers — for use in .find() / .filter() callbacks.
                isVisible:               _frameDTL.isVisible,
                isHidden:                _frameDTL.isHidden,
                isEnabled:               _frameDTL.isEnabled,
                isDisabled:              _frameDTL.isDisabled,
                isChecked:               _frameDTL.isChecked,
                isPartiallyChecked:      _frameDTL.isPartiallyChecked,
                isInDocument:            _frameDTL.isInDocument,
                isEmpty:                 _frameDTL.isEmpty,
                hasFocus:                _frameDTL.hasFocus,
                hasClass:                _frameDTL.hasClass,
                hasAttribute:            _frameDTL.hasAttribute,
                hasAccessibleName:       _frameDTL.hasAccessibleName,
                hasAccessibleDescription: _frameDTL.hasAccessibleDescription,
                hasStyle:                _frameDTL.hasStyle,
                hasText:                 _frameDTL.hasText,
                hasValue:                _frameDTL.hasValue,
                hasFormValues:           _frameDTL.hasFormValues,
                containsElement:         _frameDTL.containsElement,
                hasRole:                 _frameDTL.hasRole
            };
            var _paramNames  = Object.keys(_injected).filter(function(k) { return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k); });
            var _paramValues = _paramNames.map(function(k) { return Object.freeze(_injected[k]); });
            /* jshint evil: true */
            var fn = new window.Function(
                _paramNames.join(', '),
                'return (async function() {\n"use strict";\n' + testScript + '\n})();'
            );
            var result = fn.apply(null, _paramValues);

            // If the script returns a Promise, chain to step completion
            if (result && typeof result.then === 'function') {
                result.then(function() { _settle(null, 'UI test script passed'); }, function(e) {
                    _annotateRefError(e);
                    _settle(e);
                });
                return;
            }

            // Synchronous script — auto-resolve
            _settle(null, 'UI test script passed');

        } catch (e) {
            _annotateRefError(e);
            _settle(e);
        }

    };

    assertionObject.canMutatePage = step.can_mutate_page;

})(step, stepResult, assertionObject);
