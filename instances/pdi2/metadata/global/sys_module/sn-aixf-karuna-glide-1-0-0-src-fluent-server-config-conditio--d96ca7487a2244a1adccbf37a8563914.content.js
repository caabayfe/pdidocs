import { ServiceError } from "@servicenow/glide";

/**
 * Static blocklist scan for sys_aix_configuration.condition scripts.
 *
 * <p>Conditions must be read-only boolean expressions (e.g. {@code gs.getUser().hasRole('aix_admin')}).
 * Any reference to a write API or out-of-sandbox global causes the script to be rejected, both
 * at PUT save (so unsafe conditions never reach the database) and at GET evaluate (so a condition
 * smuggled past save still cannot run).
 *
 * <p>Defense-in-depth only — the actual sandbox is {@code GlideScopedEvaluator} running in the
 * row's {@code sys_scope}. This validator catches the obvious-bad cases early and produces a
 * clear error for the admin author. Limitations of the substring approach:
 * <ul>
 *   <li>Unicode-escape evasion (e.g. {@code Packages.}) is not normalized.</li>
 *   <li>Dynamic property access (e.g. {@code gs[someExpr]()}) is not detected.</li>
 *   <li>Reflection or code-loaded-from-property would slip through.</li>
 * </ul>
 * For those cases the scope sandbox is the load-bearing control.
 */
export const ConditionScriptValidator = {
	validate,
};
/**
 * Substrings rejected anywhere in the normalized condition source. Conservative — these tokens
 * cannot appear in a legitimate boolean expression that only reads {@code gs.getUser()},
 * {@code gs.getSession()}, and {@code current}.
 */
const BLOCKED = [
	"Packages.",
	"sn_ws.",
	"eval(",
	"Function(",
	"gs.update",
	"gs.insert",
	"gs.delete",
	".update(",
	".insert(",
	".delete(",
	".setValue(",
	".setDisplayValue(",
	".savePreference(",
	"deleteRecord",
	"deleteMultiple",
	"GlideRecord",
	"GlideAggregate",
	"GlideSysAttachment",
	"GlideRecordSecure",
];

/**
 * @param {string} script
 * @throws {ServiceError} if the script contains any blocked token after JS comments
 *         are stripped and whitespace is collapsed.
 */
function validate(script) {
	if (!script) return;
	const normalized = normalize(script);
	for (const token of BLOCKED) {
		if (normalized.includes(token)) {
			const e = new ServiceError();
			e.setMessage(
				"condition script contains blocked symbol '" +
					token +
					"'. Conditions must be read-only boolean expressions over gs.getUser(), " +
					"gs.getSession(), and current.",
			);
			throw e;
		}
	}
}

/**
 * Strip JS comments (line {@code //...} and block {@code /* ... *}{@code /}) and collapse all
 * whitespace runs. Defeats simple obfuscation like {@code gs . update(} and tokens hidden in
 * comments. Does not defend against unicode-escape or dynamic property access — see class
 * javadoc.
 * @param {string} script
 * @returns {string}
 */
function normalize(script) {
	let out = "";
	let i = 0;
	const n = script.length;
	while (i < n) {
		let c = script.charAt(i);
		if (c == "'" || c == '"') {
			// String literal — replace entire literal with empty quotes so its contents
			// don't influence the blocklist scan (blocked tokens and whitespace inside data
			// strings are data, not code). The original source is what runs in the evaluator;
			// normalization is for static scanning only.
			const quote = c;
			out = out + quote + quote;
			i++;
			while (i < n) {
				const qc = script.charAt(i);
				i++;
				if (qc == "\\" && i < n) {
					i++; // skip escaped char
				} else if (qc == quote) {
					break;
				}
			}
		} else if (c == "/" && i + 1 < n && script.charAt(i + 1) == "/") {
			// line comment
			const eol = script.indexOf("\n", i + 2);
			i = eol < 0 ? n : eol + 1;
		} else if (c == "/" && i + 1 < n && script.charAt(i + 1) == "*") {
			// block comment
			const end = script.indexOf("*/", i + 2);
			i = end < 0 ? n : end + 2;
		} else if (/\W/.test(c)) {
			// drop whitespace entirely (so "gs . update(" → "gs.update(")
			i++;
		} else {
			out = out + c;
			i++;
		}
	}
	return out.toString();
}
