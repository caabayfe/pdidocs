import AIXFConfigService from "./AIXFConfigService.js";
import {
	CONFIG_TYPE_USER,
	MSG_INVALID_EXPERIENCE_PATH,
	MSG_INVALID_PAGE_PATH,
	MSG_SYSIDS_MUST_BE_LIST,
} from "./constants.js";
import { validateSegment, error, baseResponse, parseList } from "./utils.js";

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
			CONFIG_TYPE_USER,
			pagePath,
			experiencePath,
			tag,
		);

		const service = new AIXFConfigService();

		// IMPLEMENTATION
		const sysIds = parseList(request.pathParams.sysIds);
		if (sysIds.length === 0) {
			error(response, MSG_SYSIDS_MUST_BE_LIST);
			return;
		}
		const res = service.deleteUserPersonalizationBySysIds(
			pagePath,
			experiencePath,
			sysIds,
		);
		response["sysIds"] = sysIds;

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
