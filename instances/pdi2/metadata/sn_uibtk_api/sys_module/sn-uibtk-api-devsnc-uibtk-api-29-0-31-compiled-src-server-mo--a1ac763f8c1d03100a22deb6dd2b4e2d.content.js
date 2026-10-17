
      "use strict";
exports.__esModule = true;
exports.IMPROVING_PERFORMANCE_CATEGORY = exports.NOTIFICATION_TEXT_FOR_EARLY_EVAL_RULE = exports.DESCRIPTION_FOR_EARLY_EVAL_RULE = exports.EARLY_EVAL_RULE_SYS_ID = exports.EARLY_EVAL_RULE_LEVEL = void 0;
var glide_1 = require("@servicenow/glide");
exports.EARLY_EVAL_RULE_LEVEL = 'warning';
exports.EARLY_EVAL_RULE_SYS_ID = 'd2e524a4ffa52210763dffffffffff7d';
exports.DESCRIPTION_FOR_EARLY_EVAL_RULE = glide_1.gs.getMessage('To benefit from early evaluation, avoid binding eager data broker inputs to state unless the initial state value is server-resolvable.');
exports.NOTIFICATION_TEXT_FOR_EARLY_EVAL_RULE = glide_1.gs.getMessage('This data broker is not eligible for early evaluation with its current configuration. Review the data binding configuration to ensure performance and functionality.');
exports.IMPROVING_PERFORMANCE_CATEGORY = 'improving_performance';
