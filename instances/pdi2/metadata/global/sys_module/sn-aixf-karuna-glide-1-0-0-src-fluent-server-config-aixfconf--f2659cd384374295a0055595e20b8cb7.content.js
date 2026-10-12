import ConfigValueValidator from "./ConfigValueValidator.js";
import ConditionEvaluator from "./ConditionEvaluator.js";
import { GlideRecord, gs } from "@servicenow/glide";
import {
	currentUserId,
	mk_error,
	object_entries,
	parseBoolean,
	parseOrder,
} from "./utils.js";
import {
	FIELD_CONDITION,
	FIELD_EXPERIENCE_PATH,
	FIELD_ORDER,
	FIELD_PAGE_PATH,
	FIELD_PERSONALIZATION_DISALLOWED,
	FIELD_TAG,
	FIELD_USER,
	FIELD_VALUE,
	NAME,
	SYS_ID,
	SYS_SCOPE,
	TABLE_AIX_CONFIGURATION,
	TABLE_USER_PREFERENCES,
	WIRE_CONDITION,
	WIRE_EXPERIENCE_PATH,
	WIRE_NAME,
	WIRE_ORDER,
	WIRE_PAGE_PATH,
	WIRE_PERSONALIZATION_DISALLOWED,
	WIRE_SYS_ID,
	WIRE_TAG,
	WIRE_VALUE,
} from "./constants.js";
import { UserPrefNameCodec } from "./UserPrefCodec.js";
import { ConditionScriptValidator } from "./ConditionScriptEvaluator.js";

/**
 * @typedef {object} AdminConfigEntry
 * @property {string} value,
 * @property {boolean} personalizationDisallowed,
 * @property {"admin"|"user"} setBy,
 * @property {string} condition,
 * @property {number} order
 */

/**
 * Typed request for PATCH /api/now/aix/configure/{type}/{experiencePath}/{pagePath}.
 *
 * <p>The wire shape arrives as {@code Map<String, Object>}; {@link #from(Map)} validates and
 * narrows it. {@code data} is intentionally typed as {@code Map<String, Object>} because the
 * inner shape differs between the two write types:
 *   adminConfig          → each value is a {@code Map<String, Object>}
 *                          ({ value, personalization_disallowed, condition, order }).
 *   userPersonalization  → each value is a plain string.
 * The service layer dispatches based on type and validates inner shape per branch.
 *
 * @typedef {object} ConfigUpdateRequest
 * @property {string} tag
 * @property {Record<string, unknown>} data
 */

/**
 * @typedef {object} SaveResult
 * @property {number} saved
 * @property {PageConfigResponse} postState
 */

/**
 * @typedef {object} UpsertResult
 * @property {number} updated
 * @property {number} inserted
 * @property {PageConfigResponse} postState
 */

/**
 * @typedef {object} DeleteResult
 * @property {number} deleted
 * @property {PageConfigResponse} postState
 */

/**
 * @typedef {object} RawAdminRow
 * @property {string} sysId,
 * @property {string} sysScope,
 * @property {string} tag,
 * @property {string} name,
 * @property {string} value,
 * @property {boolean} personalizationDisallowed,
 * @property {string} condition,
 * @property {number} order
 */

/**
 * Response shape for page-scoped configuration reads and post-state of writes/deletes.
 * Two buckets, each keyed by tag → name → entry:
 *
 * @typedef {object} PageConfigResponse
 * @property {Record<string, unknown>} staticConfig unconditional admin entries (the default layer).</li>
 * @property {Record<string, unknown>} sessionConfig conditional admin entries (one winner per name via lowest-order short-circuit, marked {@code setBy=admin}) and user-personalization entries (marked {@code setBy=user}). On collision within sessionConfig, user wins unless the conditional admin has {@code personalizationDisallowed=true}.
 */

export default class AIXFConfigService {
	conditionEvaluator;
	valueValidator;

	constructor(
		conditionEvaluator = new ConditionEvaluator(),
		valueValidator = new ConfigValueValidator(),
	) {
		this.conditionEvaluator = conditionEvaluator;
		this.valueValidator = valueValidator;
	}

	/**
	 * Return every sys_aix_configuration row for (page, experience) as raw rows — no condition
	 * evaluation, no merging, no personalization gating. AIX columns only.
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @returns {{[key: string]: Object}[]}
	 */
	getAllAdminRows(pagePath, experiencePath) {
		gs.debug("getAllAdminRows pagePath={0} experiencePath={1}", [
			pagePath,
			experiencePath,
		]);
		/** @type {Record<string, Object>[]} */
		const rows = [];
		const gr = new GlideRecord(TABLE_AIX_CONFIGURATION);
		gr.addQuery(FIELD_PAGE_PATH, pagePath);
		gr.addQuery(FIELD_EXPERIENCE_PATH, experiencePath);
		gr.addActiveQuery();
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		while (gr.next()) {
			const row = {};

			row[WIRE_SYS_ID] = gr.getValue(SYS_ID);
			row[WIRE_TAG] = gr.getValue(FIELD_TAG);
			row[WIRE_NAME] = gr.getValue(NAME);
			row[WIRE_VALUE] = gr.getValue(FIELD_VALUE);
			row[WIRE_PERSONALIZATION_DISALLOWED] = parseBoolean(
				gr.getValue(FIELD_PERSONALIZATION_DISALLOWED),
				false,
			);
			row[WIRE_CONDITION] = gr.getValue(FIELD_CONDITION);
			row[WIRE_ORDER] = parseOrder(gr.getValue(FIELD_ORDER));
			row[WIRE_EXPERIENCE_PATH] = gr.getValue(FIELD_EXPERIENCE_PATH);
			row[WIRE_PAGE_PATH] = gr.getValue(FIELD_PAGE_PATH);

			rows.push(row);
		}
		gs.debug("getAllAdminRows count={0}", [rows.length]);
		return rows;
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {boolean} includeStatic
	 * @param {boolean} includeSession
	 * @returns {PageConfigResponse}
	 */
	getConfig(pagePath, experiencePath, includeStatic, includeSession) {
		gs.debug(
			"getConfig pagePath={0} experiencePath={1} static={2} session={3}",
			[pagePath, experiencePath, includeStatic, includeSession],
		);
		if (!includeSession && !includeStatic) {
			return {
				staticConfig: {},
				sessionConfig: {},
			};
		}
		const adminRows = this.fetchAdminRows(pagePath, experiencePath);
		/** @type {Record<string, Record<string, AdminConfigEntry>>} */
		const staticByTag = {};
		/** @type {Record<string, Record<string, RawAdminRow[]>>} */
		const conditionalsByTagName = {};
		for (const r of adminRows) {
			gs.debug("[{1} / {2}] Row: {0}", [
				JSON.stringify(r, null, 2),
				includeStatic,
				includeSession,
			]);
			if (r.condition) {
				if (!includeSession) continue;
				if (!conditionalsByTagName[r.tag]) {
					conditionalsByTagName[r.tag] = {};
				}
				if (!conditionalsByTagName[r.tag][r.name]) {
					conditionalsByTagName[r.tag][r.name] = [];
				}
				conditionalsByTagName[r.tag][r.name].push(r);
			} else {
				if (!includeStatic) continue;
				if (!staticByTag[r.tag]) {
					staticByTag[r.tag] = {};
				}
				staticByTag[r.tag][r.name] = this.toEntry(r);
			}
		}

		// sessionConfig: condition admin winner (lowest-order short-circuit) by (tag, name)
		/** @type {Record<string, Record<string, AdminConfigEntry>>} */
		const sessionByTag = {};
		if (includeSession) {
			for (const targetEntry of object_entries(conditionalsByTagName)) {
				for (const nameEntry of object_entries(targetEntry[1])) {
					const rows = nameEntry[1];
					rows.sort((a, b) => a.order - b.order);
					for (const r of rows) {
						if (
							this.conditionEvaluator.evaluateTrue(
								r.condition,
								r.sysId,
							)
						) {
							if (!sessionByTag[r.tag]) {
								sessionByTag[r.tag] = {};
							}
							sessionByTag[r.tag][r.name] = this.toEntry(r);
							break;
						}
					}
				}
			}
			const userByTagName = this.fetchUserPersonalization(
				pagePath,
				experiencePath,
			);
			for (const tagEntry of object_entries(userByTagName)) {
				const tag = tagEntry[0];
				if (!sessionByTag[tag]) {
					sessionByTag[tag] = {};
				}
				const tagBucket = sessionByTag[tag];
				for (const nameEntry of object_entries(tagEntry[1])) {
					const name = nameEntry[0];
					const user = nameEntry[1];
					const existingAdmin = tagBucket[name];
					if (
						existingAdmin !== null &&
						existingAdmin.setBy === "admin" &&
						existingAdmin.personalizationDisallowed
					) {
						continue;
					}
					const staticTag = staticByTag[tag];
					if (staticTag !== null) {
						const staticAdmin = staticTag[name];
						if (
							staticAdmin !== null &&
							staticAdmin.personalizationDisallowed
						) {
							continue;
						}
					}
					tagBucket[name] = user;
				}
			}

			/** @type {PageConfigResponse} */
			const response = {
				sessionConfig: sessionByTag,
				staticConfig: staticByTag,
			};
			gs.debug("getConfig staticTags={0} sessionTags={1}", [
				Object.keys(staticByTag).length,
				Object.keys(sessionByTag).length,
			]);
			return response;
		}
		return {
			staticConfig: staticByTag,
			sessionConfig: sessionByTag,
		};
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @returns {Record<string, Record<string, AdminConfigEntry>>}
	 */
	fetchUserPersonalization(pagePath, experiencePath) {
		/** @type {Record<string, Record<string, AdminConfigEntry>>} */
		const byTagName = {};
		const effectiveUserId = gs.getUser().getID();
		const userPrefRecord = new GlideRecord(TABLE_USER_PREFERENCES);
		userPrefRecord.addQuery(
			NAME,
			"STARTSWITH",
			UserPrefNameCodec.buildPrefix(experiencePath, pagePath),
		);
		userPrefRecord.addQuery(FIELD_USER, effectiveUserId);
		userPrefRecord.addQuery(FIELD_VALUE, "!=", "null");
		userPrefRecord.addActiveQuery();
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		userPrefRecord.query();
		while (userPrefRecord.next()) {
			const fullName = userPrefRecord.getValue(NAME);
			const parsed = UserPrefNameCodec.parse(
				fullName,
				pagePath,
				experiencePath,
			);
			if (!parsed) continue;
			if (!byTagName[parsed.tag]) {
				byTagName[parsed.tag] = {};
			}
			byTagName[parsed.tag][parsed.name] = {
				value: userPrefRecord.getValue(FIELD_VALUE),
				personalizationDisallowed: false,
				setBy: "user",
				condition: null,
				order: 0,
			};
		}
		return byTagName;
	}

	/**
	 *
	 * @param {RawAdminRow} r
	 * @returns {AdminConfigEntry}
	 */
	toEntry(r) {
		return {
			value: r.value,
			personalizationDisallowed: r.personalizationDisallowed,
			setBy: "admin",
			condition: r.condition,
			order: r.order,
		};
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @returns {RawAdminRow[]}
	 */
	fetchAdminRows(pagePath, experiencePath) {
		/** @type {RawAdminRow[]} */
		const rows = [];
		const gr = new GlideRecord(TABLE_AIX_CONFIGURATION);
		gr.addQuery(FIELD_PAGE_PATH, pagePath);
		gr.addQuery(FIELD_EXPERIENCE_PATH, experiencePath);
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		while (gr.next()) {
			rows.push({
				sysId: gr.getValue(SYS_ID),
				sysScope: gr.getValue(SYS_SCOPE),
				tag: gr.getValue(FIELD_TAG),
				name: gr.getValue(NAME),
				value: gr.getValue(FIELD_VALUE),
				personalizationDisallowed: parseBoolean(
					gr.getValue(FIELD_PERSONALIZATION_DISALLOWED),
					false,
				),
				condition: gr.getValue(FIELD_CONDITION),
				order: parseOrder(gr.getValue(FIELD_ORDER)),
			});
		}
		return rows;
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string} tag
	 * @param {Record<string, unknown>} data
	 * @returns {SaveResult}
	 */
	saveUserPersonalization(pagePath, experiencePath, tag, data) {
		let saved = 0;
		for (const entry of object_entries(data)) {
			const fullName = UserPrefNameCodec.buildName(
				pagePath,
				experiencePath,
				tag,
				String(entry[0]),
			);
			if (fullName.length > UserPrefNameCodec.MAX_NAME_LENGTH) {
				const e = mk_error(
					gs.getMessage(
						"preference name exceeds {0} character limit: name='{1}' length={2}",
						[
							UserPrefNameCodec.MAX_NAME_LENGTH,
							fullName,
							fullName.length,
						],
					),
				);
				throw e;
			}
			gs.getUser().savePreference(fullName, String(entry[1]));
			gs.debug("saveUserPersonalization op=save user={0}", [
				gs.getUser().getID(),
			]);
			saved++;
		}
		return {
			saved,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string} tag
	 * @param {Record<string, unknown>} data
	 * @returns {UpsertResult}
	 */
	upsertAdminConfig(pagePath, experiencePath, tag, data) {
		let updated = 0,
			inserted = 0;
		gs.debug(
			"tag={0} data={1} object_entries type={2} Object.entries type={3}",
			[
				tag,
				JSON.stringify(data),
				typeof object_entries,
				typeof Object.entries,
			],
		);
		for (const entry of object_entries(data)) {
			const name = entry[0];
			const updatedConfig = entry[1];
			if (typeof updatedConfig !== "object" || !updatedConfig) {
				const e = mk_error(
					gs.getMessage(
						"Invalid config payload for key '{0}': expected an object with value/personalization_disallowed/condition/order",
						[name],
					),
				);
				throw e;
			}
			if (FIELD_VALUE in updatedConfig) {
				const v = updatedConfig[FIELD_VALUE];
				if (v) {
					this.valueValidator.validate(tag, name, String(v));
				}
			}
			const configRecord = new GlideRecord(TABLE_AIX_CONFIGURATION);
			configRecord.addQuery(FIELD_PAGE_PATH, pagePath);
			configRecord.addQuery(FIELD_EXPERIENCE_PATH, experiencePath);
			configRecord.addQuery(FIELD_TAG, tag);
			configRecord.addQuery(NAME, name);
			//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
			configRecord.query();

			if (configRecord.next()) {
				this.applyConfigFields(
					configRecord,
					/** @type {Record<string, unknown>} */ (updatedConfig),
				);
				configRecord.update();
				gs.debug("upsertAdminConfig op=update sys_id={0} user={1}", [
					configRecord.getValue(SYS_ID),
					currentUserId(),
				]);
				updated++;
			} else {
				configRecord.initialize();
				configRecord.setValue(FIELD_PAGE_PATH, pagePath);
				configRecord.setValue(FIELD_EXPERIENCE_PATH, experiencePath);
				configRecord.setValue(FIELD_TAG, tag);
				configRecord.setValue(NAME, name);
				this.applyConfigFields(
					configRecord,
					/** @type {Record<string, unknown>} */ (updatedConfig),
				);
				const newSysId = configRecord.insert();
				gs.debug("upsertAdminConfig op=insert sys_id={0} user={1}", [
					newSysId,
					currentUserId(),
				]);
				inserted++;
			}
		}
		return {
			updated,
			inserted,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/**
	 *
	 * @param {GlideRecord} gr
	 * @param {Record<string, unknown>} source
	 */
	applyConfigFields(gr, source) {
		if (FIELD_CONDITION in source) {
			const cond = source[FIELD_CONDITION];
			if (cond !== null) {
				ConditionScriptValidator.validate(String(cond));
			}
		}
		for (const field of [
			FIELD_VALUE,
			FIELD_PERSONALIZATION_DISALLOWED,
			FIELD_CONDITION,
			FIELD_ORDER,
		]) {
			if (field in source) {
				const v = source[field];
				gr.setValue(field, v == null ? "" : String(v));
			}
		}
	}

	/**
	 *
	 * @param {any} data
	 * @returns {AdminConfigEntry}
	 * @throws {Error}
	 */
	parseConfigEntry(data) {
		if (
			typeof data !== "object" ||
			!data ||
			typeof data["value"] !== "string" ||
			typeof data["personalizationDisallowed"] !== "boolean" ||
			typeof data["setBy"] !== "string" ||
			["admin", "user"].indexOf(data["setBy"]) === -1 ||
			typeof data["condition"] !== "string" ||
			typeof data["order"] !== "number"
		) {
			throw new Error("Could not parse update request");
		}

		return data;
	}

	/**
	 *
	 * @param {any} requestBody
	 * @returns {ConfigUpdateRequest}
	 * @throws {Error}
	 */
	parseUpdateRequest(requestBody) {
		if (
			typeof requestBody !== "object" ||
			!requestBody ||
			typeof requestBody["tag"] !== "string" ||
			typeof requestBody["data"] !== "object"
		) {
			throw new Error("Could not parse update request");
		}

		return {
			tag: requestBody["tag"],
			data: requestBody["data"],
		};
	}

	/**
	 * Delete admin rows by sys_id list, scoped to (page, experience). Sys_ids that don't belong to
	 * the URL-supplied scope are silently ignored — caller cannot cross-scope delete.
	 *
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string[]} sysIds
	 * @returns {DeleteResult}
	 */
	deleteAdminConfigBySysIds(pagePath, experiencePath, sysIds) {
		const gr = new GlideRecord(TABLE_AIX_CONFIGURATION);
		gr.addQuery(FIELD_PAGE_PATH, pagePath);
		gr.addQuery(FIELD_EXPERIENCE_PATH, experiencePath);
		gr.addQuery(SYS_ID, "IN", sysIds.join(","));
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		const matched = gr.getRowCount();
		gr.deleteMultiple();
		gs.debug("deleteAdminConfigBySysIds op=delete deleted={0} user ={1}", [
			matched,
			currentUserId(),
		]);
		return {
			deleted: matched,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/** Delete admin rows by name list scoped to (page, experience, tag).
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string} tag
	 * @param {string[]} keys
	 * @returns {DeleteResult}
	 */
	deleteAdminConfigByKeys(pagePath, experiencePath, tag, keys) {
		const gr = new GlideRecord(TABLE_AIX_CONFIGURATION);
		gr.addQuery(FIELD_PAGE_PATH, pagePath);
		gr.addQuery(FIELD_EXPERIENCE_PATH, experiencePath);
		gr.addQuery(FIELD_TAG, tag);
		gr.addQuery(NAME, "IN", keys.join(","));
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		const matched = gr.getRowCount();
		gr.deleteMultiple();
		gs.debug("deleteAdminConfigByKeys op=delete deleted={0} user={1}", [
			matched,
			currentUserId(),
		]);
		return {
			deleted: matched,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/** Delete every admin row for this (page, experience, tag).
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string} tag
	 * @returns {DeleteResult}
	 */
	deleteAllAdminConfig(pagePath, experiencePath, tag) {
		const gr = new GlideRecord(TABLE_AIX_CONFIGURATION);
		gr.addQuery(FIELD_PAGE_PATH, pagePath);
		gr.addQuery(FIELD_EXPERIENCE_PATH, experiencePath);
		gr.addQuery(FIELD_TAG, tag);
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		const matched = gr.getRowCount();
		gr.deleteMultiple();
		gs.debug("deleteAllAdminConfig op=delete deleted={0} user={1}", [
			matched,
			currentUserId(),
		]);
		return {
			deleted: matched,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/** Delete user-personalization rows by sys_user_preference sys_id. Constrained to caller.
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string[]} sysIds
	 * @returns {DeleteResult}
	 */
	deleteUserPersonalizationBySysIds(pagePath, experiencePath, sysIds) {
		const gr = new GlideRecord(TABLE_USER_PREFERENCES);
		gr.addQuery(SYS_ID, "IN", sysIds.join(","));
		gr.addQuery(FIELD_USER, gs.getUser().getID());
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		const matched = gr.getRowCount();
		gr.deleteMultiple();
		gs.debug(
			"deleteUserPersonalizationBySysIds op=delete deleted={0} user={1}",
			[matched, gs.getUser().getID()],
		);
		return {
			deleted: matched,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string} tag
	 * @param {string[]} keys
	 * @returns  {DeleteResult}
	 */
	deleteUserPersonalizationByKeys(pagePath, experiencePath, tag, keys) {
		let removed = 0;
		for (const key of keys) {
			const fullName = UserPrefNameCodec.buildName(
				pagePath,
				experiencePath,
				tag,
				key,
			);
			const prefRow = new GlideRecord(TABLE_USER_PREFERENCES);
			prefRow.addQuery(NAME, fullName);
			prefRow.addQuery(FIELD_USER, gs.getUser().getID());
			//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
			prefRow.query();
			if (prefRow.next()) {
				gs.getUser().savePreference(fullName, null);
				removed++;
			}
		}
		gs.debug(
			"deleteUserPersonalizationByKeys op=delete cleared={0} user={0}" +
				[removed, gs.getUser().getID()],
		);
		return {
			deleted: removed,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}

	/**
	 *
	 * @param {string} pagePath
	 * @param {string} experiencePath
	 * @param {string} tag
	 * @returns  {DeleteResult}
	 */
	deleteAllUserPersonalization(pagePath, experiencePath, tag) {
		const prefix =
			UserPrefNameCodec.buildPrefix(experiencePath, pagePath) + tag + ".";
		const gr = new GlideRecord(TABLE_USER_PREFERENCES);
		gr.addQuery(NAME, "STARTSWITH", prefix);
		gr.addQuery(FIELD_USER, gs.getUser().getID());
		//@ts-ignore GlideRecord.query signature is wrong is @servicenow/glide
		gr.query();
		const matched = gr.getRowCount();
		gr.deleteMultiple();
		gs.debug(
			"deleteAllUserPersonalization op=delete deleted={0} user={1}" +
				[matched, gs.getUser().getID()],
		);
		return {
			deleted: matched,
			postState: this.getConfig(pagePath, experiencePath, true, true),
		};
	}
}
