import AIXFConfigService from "./AIXFConfigService.js";
import { CONFIG_TYPE_USER } from "./constants.js";
import { baseResponse, error, success } from "./utils.js";

/**
 * PATCH - upsert or save user personalization.
 * Partial-update semantics: only fields present in the request body are written; existing
 * fields not in the payload are preserved. To clear a field (e.g. condition) explicitly send
 * it as the empty string.
 *
 * Request body:
 * ```json
 *   {
 *     "tag": "aix_home",
 *     "data": { "<name>": "<value>" }
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
	try {
		const experiencePath = request.pathParams.experience;
		const pagePath = request.pathParams.page;
		const service = new AIXFConfigService();
		const update = service.parseUpdateRequest(request.body.data);
		const res = baseResponse(
			CONFIG_TYPE_USER,
			pagePath,
			experiencePath,
			update.tag,
		);
		const saveResult = service.saveUserPersonalization(
			pagePath,
			experiencePath,
			update.tag,
			update.data,
		);
		res["status"] = "success";
		res["message"] = "User personalization saved";
		res["saved"] = saveResult.saved;
		res["staticConfig"] = saveResult.postState.staticConfig;
		res["sessionConfig"] = saveResult.postState.sessionConfig;
		const status = saveResult.saved ? 201 : 200;

		success(response, res, status);
	} catch (e) {
		response.setError(e);
	}
}
