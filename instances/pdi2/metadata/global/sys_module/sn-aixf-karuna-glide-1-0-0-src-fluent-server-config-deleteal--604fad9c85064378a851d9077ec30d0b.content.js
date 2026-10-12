import AIXFConfigService from "./AIXFConfigService.js";
import {
	CONFIG_TYPE_ADMIN,
	MSG_INVALID_EXPERIENCE_PATH,
	MSG_INVALID_PAGE_PATH,
} from "./constants.js";
import { validateSegment, error, baseResponse } from "./utils.js";

/**
 *
 * @param {import('@servicenow/glide').RESTAPIRequest} request
 * @param {import('@servicenow/glide').RESTAPIResponse} response
 * @returns {void}
 */
export function process(request, response) {
	try {
		const experiencePath = request.pathParams.experience;
		const pagePath = request.pathParams.page;
		const tag = request.pathParams.tag;
		if (!validateSegment(experiencePath)) {
			error(response, MSG_INVALID_EXPERIENCE_PATH);
			return;
		}
		if (!validateSegment(pagePath)) {
			error(response, MSG_INVALID_PAGE_PATH);
			return;
		}

		const body = baseResponse(
			CONFIG_TYPE_ADMIN,
			pagePath,
			experiencePath,
			tag,
		);

		const service = new AIXFConfigService();

		// IMPLEMENTATION
		const res = service.deleteAllAdminConfig(pagePath, experiencePath, tag);

		body["status"] = "success";
		body["message"] = res.deleted == 0 ? "Nothing to delete" : "Deleted";
		body["deleted"] = res.deleted;
		body["staticConfig"] = res.postState.staticConfig;
		body["sessionConfig"] = res.postState.sessionConfig;

		response.setBody(body);
		response.setStatus(200);
	} catch (e) {
		response.setError(e);
	}
}
