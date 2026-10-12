var NLUScopedEvaluator = Class.create();

(function() {
    var tables = NLUWorkbenchConstants.tables;

    NLUScopedEvaluator.prototype = {

        /*
        Ex:
        ---
        var evaluator = new NLUScopedEvaluator();
        gs.debug('Result: ' + evaluator.evaluate('a * b', { a: 10, b: 5 }));
        */
        evaluate: function(script, params) {
            this._getDummyRecord();
            this.gr.script = this._getScript(script, params);

            var evaluator = new GlideScopedEvaluator();
            if (params) {
                for (var key in params)
                    evaluator.putVariable(key, params[key]);
            }
            return evaluator.evaluateScript(this.gr, 'script', null);
        },

        _getScript: function(script, params) {
            var keys = params ? Object.keys(params).join(',') : '';
            // Wrap the script with a dummy function which will return the evaluated result
            return '(function dummyFunction(' + keys + ') {' +
                'return ' + script + ';' +
                '})(' + keys + ');';
        },

        _getDummyRecord: function() {
            if (!this.gr) {
                var gr = new GlideRecord(tables.SYS_SCRIPT_INCLUDE);
                gr.addQuery('sys_policy', 'read'); // Select Read only to prevent accidental updates
                gr.addQuery('sys_scope.scope', gs.getCurrentScopeName());
                gr.orderByDesc('sys_updated_on');
                gr.setLimit(1);
                gr.query();
                if (gr.next())
                    this.gr = gr;
                else {
                    // Ideally it should not occur, as there will be atleast one script include in nlu-workbench scope. 
                    throw new Error(gs.getMessage('Unable to evaluate the script'));
                }
            }
        },

        initialize: function() {},

        type: 'NLUScopedEvaluator'
    };
})();
