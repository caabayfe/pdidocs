var ATFVariablesUtil = Class.create();
ATFVariablesUtil.prototype = {
	/**
	 * Returns a choice list of supported Jasmine versions for use with the "Run Server Side Script" test step.
	 */
	getJasmineChoiceList: function() {
		var str = GlidePropertiesDB.get('sn_atf.jasmine.versions', '3.1');
		var splitstr = str.split(',');
		var list = new GlideChoiceList();
		splitstr.forEach(function(item) {
			list.add(new GlideChoice(item, item));
		});
		return list;
	},

	/**
	 * Returns the default script for "Run Server Side Script" steps.
	 * Has to be done via script like this due to Oracle database limitations for default variable values.
	 */
	getDefaultServerSideScript: function(isReusableTest) {
		var closure = "(function(outputs, steps, params, stepResult, assertEqual) {\n" +
			"    // add test script here\n" +
			"\n" +
			"})(outputs, steps, params, stepResult, assertEqual);\n";

		// If this is a reusable test, replace "params" with "reusableInputs" in the closure
		if (isReusableTest)
			closure = closure.replaceAll("params", "reusableInputs");

		return "// You can use this step to execute a variety of server-side javascript tests including\n" +
			"// jasmine tests and custom assertions\n" +
			"//\n" +
			"//\n" +
			"// Pass or fail a step: Override the step outcome to pass or fail. This is ignored \n" +
			"//                      by jasmine tests\n" +
			"//\n" +
			"//  - Return true from the main function body to pass the step\n" +
			"//  - Return false from the main function body to fail the step\n" +
			"//\n" +
			"//\n" +
			"// outputs:        Pre-defined Step config Output variables to set on this step during \n" +
			"//                 execution that are available to later steps\n" +
			"//\n" +
			"// steps(SYS_ID):  A function to retrieve Output variable data from a step that executed\n" +
			"//                 earlier in the test. The desired step's sys_id is required\n" +
			"//\n" +
			"// params:         The current test run data set's parameter data including both \n" +
			"//                 exclusive and shared parameters (only used in parameterized tests)\n" +
			"//\n" +
			"// reusableInputs: Input values from the current reusable test (only used in reusable tests)\n" +
			"//\n" +
			"//  Example:\n" +
			"//\n" +
			"//      // Test step 1 - add data\n" +
			"//      var gr = new GlideRecord('sc_task');\n" +
			"//      // If parameterized testing is enabled, parameters are stored in the params object\n" +
			"//      gr.setValue('short_description', params.u_my_short_description)\n" +
			"//      gr.setValue('caller', params.u_my_user.manager)\n" +
			"//      // The syntax for reusable test inputs is similar\n" +
			"//      gr.setValue('short_description', reusableInputs.u_my_short_description)\n" +
			"//      // this sample step's Step config has Output variables named table and record_id\n" +
			"//      outputs.table = 'sc_task';\n" +
			"//      outputs.record_id = gr.insert();\n" +
			"//\n" +
			"//      // Test step 2 - access added data and validate\n" +
			"//      // check that the record exists (or that business logic changed it)\n" +
			"//      var gr = new GlideRecord(\"sc_task\");\n" +
			"//      gr.get(steps(PREVIOUS_STEP_SYS_ID).record_id);\n" +
			"//      assertEqual({name: \"task gr exists\", shouldbe: true, value: gr.isValidRecord()});\n" +
			"//\n" +
			"//\n" +
			"// stepResult.setOutputMessage: Log a message to step results after step executes.\n" +
			"//                              Can only be called once or will overwrite previous \n" +
			"//                              message\n" +
			"//\n" +
			"//  Example:\n" +
			"//\n" +
			"//      var gr = new GlideRecord('sc_task');\n" +
			"//      gr.setValue('short_description', 'verify task can be inserted');\n" +
			"//      var grSysId = gr.insert();\n" +
			"//      var justCreatedGR = new GlideRecord('sc_task');\n" +
			"//      if (justCreatedGR.get(grSysId)) {\n" +
			"//            stepResult.setOutputMessage(\"Successfully inserted task record\");\n" +
			"//            return true; // pass the step\n" +
			"//      } else { \n" +
			"//            stepResult.setOutputMessage(\"Failed to insert task record\");\n" +
			"//            return false; // fail the step\n" +
			"//      }\n" +
			"//\n" +
			"//\n" +
			"// Note: describe is only supported in Global scope.\n" +
			"// Use 'describe' to create a suite of test scripts and 'it' to define test expectations\n" +
			"//\n" +
			"//  Example jasmine test:\n" +
			"//\n" +
			"//      describe('my suite of script tests', function() {\n" +
			"//            it('should meet expectations', function() {\n" +
			"//                  expect(true).not.toBe(false);\n" +
			"//            });\n" +
			"//      });\n" +
			"//      // make sure to uncomment jasmine.getEnv().execute(); outside the function body\n" +
			"//\n" +
			"//\n" +
			"// assertEqual: A function used to compare that assertion.shouldbe == assertion.value;\n" +
			"//              in case of failure it throws an Error and logs that the assertion by\n" +
			"//              name has failed\n" +
			"//\n" +
			"//  Example:\n" +
			"//\n" +
			"//      var testAssertion = {\n" +
			"//            name: \"my test assertion\",\n" +
			"//            shouldbe: \"expected value\"\n" +
			"//            value: \"actual value\",\n" +
			"//      };\n" +
			"//      assertEqual(testAssertion); // throws Error, logs message to test step output\n" +
			"//\n" +
			closure +
			"// uncomment the next line to execute this script as a jasmine test\n" +
			"//jasmine.getEnv().execute();\n";
	},

	/**
	 * Returns the default script for server step configs.
	 * Has to be done via script like this due to Oracle database limitations for default variable values.
	 */
	getDefaultStepConfigScript: function() {
		return "// The inputs are a map of the variables defined in the inputs related list below.\n" +
			"// Inputs are consumed in the step configuration. Input\n" +
			"// values may be hardcoded or mapped from the outputs of a previous step.\n" +
			"// If a test author using your step uses mapping to pass in an output from a previous \n" +
			"// test step then when referencing the input variable the mapping will be resolved \n" +
			"// automatically\n" +
			"//  Example:\n" +
			"//      var myRecords = new GlideRecord(inputs.table);\n" +
			"//\n" +
			"// The outputs are a map of the variables defined in the outputs related list.\n" +
			"// Outputs should be set (assigned) in order to pass data out of a test step that\n" +
			"// can be consumed my mapping as an input to subsequent steps. \n" +
			"//  Example:\n" +
			"//      outputs.table = gr.getRecordClassName()\n" +
			"//\n" +
			"//\n" +
			"// Note that inputs and outputs are strongly typed as defined in their variable definition.\n" +
			"// Their behavior is the same as a dictionary defined field of the same type in a table.\n" +
			"//\n" +
			"// The stepResult is a simple API for controlling the step pass/fail and logging with three\n" +
			"// methods:\n" +
			"//      stepResult.setFailed: Causes step to fail\n" +
			"//\n" +
			"//      stepResult.setSuccess: Causes step to succeed\n" +
			"//\n" +
			"//      stepResult.setOutputMessage: Log a message to step results after step executes.\n" +
			"//            Can only be called once or will overwrite previous \n" +
			"//            message\n" +
			"//\n" +
			"// If neither setFailed or setSuccess is called the default is to succeed.\n" +
			"//\n" +
			"// Example usage of step timeout in script\n" +
			"//      var counter = 0;\n" +
			"//      // 'timeout' is a field on the step form\n" +
			"//      while (counter <= timeout) {\n" +
			"//            if (desiredOutcome) {\n" +
			"//                stepResult.setOutputMessage('Success!');\n" +
			"//                stepResult.setSuccess();\n" +
			"//                return;\n" +
			"//            }\n" +
			"//            counter++;\n" +
			"//\n" +
			"//            // When writing scripts in ATF, use waitOneSecond() instead of gs.sleep()\n" +
			"//            // since gs.sleep() may not work in non-global scopes\n" +
			"//            sn_atf.AutomatedTestingFramework.waitOneSecond();\n" +
			"//      }\n" +
			"//\n" +
			"//      // desired outcome did not occur within the timeout\n" +
			"//      stepResult.setOutputMessage('Failure!');\n" +
			"//      stepResult.setFailed();\n" +
			"//\n" +
			"(function executeStep(inputs, outputs, stepResult, timeout) {\n" +
			"\n" +
			"}(inputs, outputs, stepResult, timeout));\n";
	},

	/**
	 * Returns the default script for "UI Test Script" steps.
	 * Has to be done via script like this due to Oracle database limitations for default variable values.
	 */
	getDefaultUITestScript: function() {
		return "// Use this step to run a client-side UI test entirely in the browser.\n" +
			"//\n" +
			"// APIs:\n" +
			"//\n" +
			"// screen            — DOM and accessibility query API. Use screen.getBy*, screen.findBy*,\n" +
			"//                     screen.queryBy* to locate elements. Also provides:\n" +
			"//                       screen.waitFor(fn)    — poll until fn resolves\n" +
			"//                       screen.debug()        — log DOM to console\n" +
			"//\n" +
			"// user              — User interaction API. Simulates realistic browser events.\n" +
			"//                     All interactions return Promises — use await.\n" +
			"//                       user.click(element)\n" +
			"//                       user.type(element, 'text')\n" +
			"//                       user.keyboard('{Tab}')\n" +
			"//\n" +
			"// sn_atf            — Utility APIs.\n" +
			"//                     Navigation:\n" +
			"//                       sn_atf.navigate(url)   — navigate the test iframe and await load\n" +
			"//                       sn_atf.reload()        — reload the current page\n" +
			"//                       sn_atf.goBack()        — navigate back\n" +
			"//                       sn_atf.goForward()     — navigate forward\n" +
			"//                     Page context:\n" +
			"//                       sn_atf.evaluate(fn)    — run fn in the iframe's JavaScript realm;\n" +
			"//                                                returns a Promise with the result\n" +
			"//                     Impersonation:\n" +
			"//                       sn_atf.impersonate(userId) — accepts sys_id or user_name\n" +
			"//                     Attachments:\n" +
			"//                       sn_atf.upload(source)                      — classic SN form\n" +
			"//                       sn_atf.uploadInSP(source, table?, id?)     — Service Portal\n" +
			"//                       sn_atf.uploadInWS(source, table?, id?)     — Workspace\n" +
			"//                       sn_atf.uploadInSCVariable(source, varName) — classic catalog variable\n" +
			"//                       sn_atf.uploadInSPVariable(source, varName) — SP catalog variable\n" +
			"//                       sn_atf.getAttachmentFile(sysId)            — fetch as File object\n" +
			"//                       source is a sys_id string or a File object\n" +
			"//                     Utilities:\n" +
			"//                       sn_atf.delay(ms)                    — wait for ms milliseconds\n" +
			"//                       sn_atf.querySelector(root, sel)     — shadow-piercing querySelector\n" +
			"//                       sn_atf.querySelectorAll(root, sel)  — shadow-piercing querySelectorAll\n" +
			"//                       sn_atf.getActiveElement(root?)      — shadow-aware focused element\n" +
			"//                       sn_atf.waitForElementToBeRemoved(el) — wait until el leaves DOM\n" +
			"//\n" +
			"// expect(value)     — Assertions. Pass a screen.getBy* result for element assertions\n" +
			"//                     (.toBeVisible(), .toHaveTextContent(), etc.) or a plain value for\n" +
			"//                     value assertions (.toBe(), .toEqual(), etc.).\n" +
			"//\n" +
			"// waitFor(fn)       — Polls until fn stops throwing. Useful for async state changes.\n" +
			"//                     Options: { timeout, interval } (ms).\n" +
			"//\n" +
			"// within(element)   — Scopes subsequent queries to a subtree of the DOM.\n" +
			"//\n" +
			"// steps(stepSysId)  — Returns output variable values from a previously executed step.\n" +
			"//                     Example: steps('abc123').record_sys_id\n" +
			"//\n" +
			"// params(name)      — Returns a parameter value from the current ATF parameter set.\n" +
			"//                     Only available in parameterized tests.\n" +
			"//\n" +
			"// Synchronous element predicates (for use in .find() / .filter() callbacks):\n" +
			"//   isVisible(el), isHidden(el), isEnabled(el), isDisabled(el), isChecked(el),\n" +
			"//   isPartiallyChecked(el), isInDocument(el), isEmpty(el), hasFocus(el),\n" +
			"//   hasClass(el, ...classes), hasAttribute(el, name, value?), hasText(el, text),\n" +
			"//   hasValue(el, value), hasRole(el, role), hasStyle(el, styles),\n" +
			"//   hasFormValues(el, values), hasAccessibleName(el, name),\n" +
			"//   hasAccessibleDescription(el, desc), containsElement(el, child)\n" +
			"//\n" +
			"// Return a Promise (or use await) to signal async completion.\n" +
			"// Synchronous scripts auto-resolve.\n" +
			"//\n" +
			"// Example:\n" +
			"//\n" +
			"//   await sn_atf.navigate('/incident_list.do');\n" +
			"//   const heading = await screen.findByRole('heading', { name: /incidents/i });\n" +
			"//   expect(heading).toBeVisible();\n" +
			"//\n" +
			"await (async function executeStep(screen, user, sn_atf, expect, waitFor, within, steps, params) {\n" +
			"\n" +
			"}(screen, user, sn_atf, expect, waitFor, within, steps, params));\n";
	},

	/**
	 * Returns the default script for UI step configs.
	 * Has to be done via script like this due to Oracle database limitations for default variable values.
	 */
	getDefaultUIScript: function() {
		return "(function (step, stepResult, assertionObject) {\n" +
			"\n" +
			"})(step, stepResult, assertionObject);\n";
	},

	/**
	 * Returns all default step config scripts as a JSON object
	 */
	getDefaultStepConfigScriptsJSON: function() {
		return {
			server: this.getDefaultStepConfigScript(),
			ui: this.getDefaultUIScript()
		};
	},

	/**
	 * Returns the href attribute for links to the ATF properties page
	 */
	getATFPropertiesURL: function() {
		return "href='system_properties_ui.do?sysparm_title=Automated%20Test%20Framework%20Properties&amp;sysparm_category=Test%20and%20Test%20Suite%20Properties,Test%20Debugging%20Properties,Screenshot%20Properties,Custom%20UI%20Page%20Data%20Capture%20Properties,Test%20Runner%20Properties,Test%20Suite%20Report%20Properties,Email%20Properties'";
	},

    type: 'ATFVariablesUtil'
};
