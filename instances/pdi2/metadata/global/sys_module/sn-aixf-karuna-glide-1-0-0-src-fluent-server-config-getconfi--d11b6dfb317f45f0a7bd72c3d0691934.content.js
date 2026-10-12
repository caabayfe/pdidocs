import { validateSegment, parseTypes, error, success } from "./utils.js";
import AIXFConfigService from "./AIXFConfigService.js";
import {
	MSG_INVALID_EXPERIENCE_PATH,
	MSG_INVALID_PAGE_PATH,
	MSG_INVALID_TYPES,
} from "./constants.js";

/**
 *
 * @param {import('@servicenow/glide').RESTAPIRequest} request
 * @param {import('@servicenow/glide').RESTAPIResponse} response
 * @returns {void}
 */
export function process(request, response) {
	const experiencePath = request.pathParams.experience;
	if (!validateSegment(experiencePath)) {
		return error(response, MSG_INVALID_EXPERIENCE_PATH);
	}

	const pagePath = request.pathParams.page;
	if (!validateSegment(experiencePath)) {
		return error(response, MSG_INVALID_PAGE_PATH);
	}

	const typesRaw = request.pathParams.types;
	const { includeSession, includeStatic } = parseTypes(typesRaw);
	if (!includeStatic && !includeSession) {
		return error(response, MSG_INVALID_TYPES);
	}

	const configService = new AIXFConfigService();
	const full = configService.getConfig(
		pagePath,
		experiencePath,
		includeStatic,
		includeSession,
	);

	const body = {};
	if (includeStatic) body["staticConfig"] = full.staticConfig;
	if (includeSession) body["sessionConfig"] = full.sessionConfig;
	success(response, body);
}
