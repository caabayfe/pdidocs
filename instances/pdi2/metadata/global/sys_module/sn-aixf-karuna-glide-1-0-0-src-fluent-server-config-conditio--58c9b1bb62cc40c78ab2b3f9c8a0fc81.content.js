import { GlideRecord, GlideScopedEvaluator, gs } from "@servicenow/glide";
import { ConditionScriptValidator } from "./ConditionScriptEvaluator.js";
import { TABLE_AIX_CONFIGURATION } from "./constants.js";

const METRIC_COUNT = "aix.configuration.condition.eval.count";
const METRIC_DURATION = "aix.configuration.condition.eval.duration";

export default class ConfigEvaluator {
	constructor() {}

	/**
	 *
	 * @param {string} condition
	 * @param {string} sysId
	 * @returns {boolean}
	 */
	evaluateTrue(condition, sysId) {
		const start = gs.nowGlideDateTime().getNumericValue();
		try {
			ConditionScriptValidator.validate(condition);
			const currentRow = new GlideRecord(TABLE_AIX_CONFIGURATION);
			// @ts-ignore Apparently GlideRecord::get has the wrong signature too
			if (!currentRow.get(sysId)) {
				gs.error(
					"aix-config condition skipped: sys_id={0} row not found",
					[sysId],
				);
				return false;
			}
			const evaluator = new GlideScopedEvaluator();
			return !!evaluator.evaluateScript(currentRow, "condition");
		} catch (e) {
			gs.error(
				"aix-config condition rejected by validator: sys_id={0} reason={0}",
				[sysId, e.getMessage()],
			);
			return false;
		} finally {
			const duration = gs.nowGlideDateTime().getNumericValue() - start;
			gs.debug("metric={0} value=1 sys_id={1}", [METRIC_COUNT, sysId]);
			gs.debug("metric={0} value={1} sys_id={2}", [
				METRIC_DURATION,
				duration,
				sysId,
			]);
		}
	}
}
