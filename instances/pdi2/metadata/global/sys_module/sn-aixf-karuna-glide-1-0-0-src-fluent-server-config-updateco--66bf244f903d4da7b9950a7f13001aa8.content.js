import AIXFConfigService from "./AIXFConfigService.js";
import { CONFIG_TYPE_ADMIN } from "./constants.js";
import { baseResponse, success } from "./utils.js";

/**
 * PATCH - upsert admin configurations.
 * Partial-update semantics: only fields present in the request body are written; existing
 * fields not in the payload are preserved. To clear a field (e.g. condition) explicitly send
 * it as the empty string.
 *
 * Request body:
 * ```json
 *   {
 *     "tag": "aix_home",
 *     "data": {
 *       "<name>": {
 *         "value": "...",
 *         "personalization_disallowed": "true",
 *         "condition": "gs.user.hasRole('aix_admin')",
 *         "order": "100"
 *       }
 *     }
 *   }
 * ```
 *
 * Status: 201 if any row was inserted, 200 otherwise. Body is the post-state PageConfigResponse.
 *
 * @param {import('@servicenow/glide').RESTAPIRequest} request
 * @param {import('@servicenow/glide').RESTAPIResponse} response
 * @returns {void}
 */
export function process(request, response) {
	const experiencePath = request.pathParams.experience;
	const pagePath = request.pathParams.page;
	const service = new AIXFConfigService();
	const update = service.parseUpdateRequest(request.body.data);
	const res = baseResponse(
		CONFIG_TYPE_ADMIN,
		pagePath,
		experiencePath,
		update.tag,
	);

	const result = service.upsertAdminConfig(
		pagePath,
		experiencePath,
		update.tag,
		update.data,
	);
	res["status"] = "success";
	res["message"] = "Admin configuration saved";
	res["updated"] = result.updated;
	res["inserted"] = result.inserted;
	res["staticConfig"] = result.postState.staticConfig;
	res["sessionConfig"] = result.postState.sessionConfig;
	const status = result.inserted > 0 ? 201 : 200;

	success(response, res, status);
}
