import AIXFConfigService from "./AIXFConfigService.js";
import {
	MSG_INVALID_EXPERIENCE_PATH,
	MSG_INVALID_PAGE_PATH,
} from "./constants.js";
import { error, success } from "./utils.js";

/**
 * GET - return every sys_aix_configuration row for the page+experience as raw entries.
 *
 * No condition evaluation, no merging, no personalization gating. Admin-side inspection
 * endpoint. Path: /{experiencePath}/{pagePath}/all.
 *
 * ```json
 *   { "result": { "all": [ { sysId, tag, name, value, personalizationDisallowed,
 *                            condition, order }, ... ] } }
 * ```
 *
 * @param {import('@servicenow/glide').RESTAPIRequest} request
 * @param {import('@servicenow/glide').RESTAPIResponse} response
 * @returns {void}
 */
export function process(request, response) {
	const experience = request.pathParams.experience;
	if (!experience) return error(response, MSG_INVALID_EXPERIENCE_PATH);

	const page = request.pathParams.page;
	if (!page) return error(response, MSG_INVALID_PAGE_PATH);

	const service = new AIXFConfigService();
	const rows = service.getAllAdminRows(page, experience);
	success(response, { all: rows });
}
