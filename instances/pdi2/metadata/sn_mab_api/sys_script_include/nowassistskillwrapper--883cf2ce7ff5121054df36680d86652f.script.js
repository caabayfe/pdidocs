/**
 * This wrapper class is intended to handle the communication between the NowAssist skill scriptable api and the MAB API script includes.
 */
class NowAssistSkillWrapper {
  constructor() {
    this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
  }

  WEB_TO_MOBILE_CAPABILITY_ID = '8c79caf57f71121054df36680d86653e';
  CARD_GEN_SKILL_CONFIG_ID = '4879c2397f71121054df36680d866510';

  /**
   * Transforms a web component to mobile component metadata.
   *
   * @param {Object} textFieldsToMapJsonObject - Source of the web component.
   * @param {Object} imageFieldsToMapJsonObject - Options for transformation.
   * @param {Object} cardSlotDescriptionsJsonObject - Options for transformation.
   *
   * @returns {Object} generateCardMappingResponse - The response object containing the model output and log ID.
   * @returns {Object} generateCardMappingResponse.modelOutputString - The field to template mappings to be converted to a card.
   * @returns {String} generateCardMappingResponse.logId - The sys ID of the log for the requestr.
   *
   * Example of generateCardMappingResponse:
   * {
   *   modelOutputString: {
   *     "mapped_fields": {
   *       "text_01": "number",
   *       "text_02": "",
   *       "text_03": "short_description",
   *       "text_05": "priority",
   *       "text_07": "assigned_to",
   *       "image_01": "assigned_to_DOT_photo"
   *     }
   *   },
   *   logId: "159df1dfff77121054dfffffffffff59" // id of the log in the sys_generative_ai_log table
   * }
   */
  generateCardMapping(
    textFieldsToMapJsonObject,
    imageFieldsToMapJsonObject,
    videoFieldsToMapJsonObject,
    cardSlotDescriptionsJsonObject
  ) {
    this.validateCardMappingSkillIsAvailable();

    const inputsPayload = {
      text_fields_to_map: textFieldsToMapJsonObject,
      image_fields_to_map: imageFieldsToMapJsonObject,
      video_fields_to_map: videoFieldsToMapJsonObject,
      card_slot_descriptions: cardSlotDescriptionsJsonObject,
    };

    let request = {
      executionRequests: [
        {
          payload: inputsPayload,
          capabilityId: this.WEB_TO_MOBILE_CAPABILITY_ID,
          meta: {
            skillConfigId: this.CARD_GEN_SKILL_CONFIG_ID,
          },
        },
      ],
      mode: 'sync',
    };

    const skillPayloadObject = sn_one_extend.OneExtendUtil.execute(request);

    const generateCardMappingResponse =
      this._parseCardMappingSkillResponse(skillPayloadObject);

    this._validateCardMappingOutput(
      generateCardMappingResponse.modelOutputString,
      textFieldsToMapJsonObject,
      imageFieldsToMapJsonObject,
      videoFieldsToMapJsonObject,
      cardSlotDescriptionsJsonObject
    );

    return generateCardMappingResponse;
  }

  validateCardMappingSkillIsAvailable() {
    let nowAssistAdminUtil = new sn_nowassist_admin.NowAssistSkillConfig();
    if (
      !nowAssistAdminUtil.isSkillConfigurationActive(
        this.CARD_GEN_SKILL_CONFIG_ID
      )
    ) {
      this.customErrorHandler.throwInternalError(
        'CARD_MAPPING_SKILL_NOT_AVAILABLE',
        `Did not generate card mapping. The skill is configuration is not active. Skill config id: ${this.CARD_GEN_SKILL_CONFIG_ID}`
      );
    }
  }

  _validateCardMappingOutput(
    modelOutputString,
    textFieldsToMapJsonObject,
    imageFieldsToMapJsonObject,
    videoFieldsToMapJsonObject,
    cardSlotDescriptionsJsonObject
  ) {
    // Validate output is not empty
    if (!modelOutputString) {
      this.customErrorHandler.throwInternalError(
        'CARD_MAPPING_SKILL_OUTPUT_ERROR',
        'Failed to generate card mapping. The skill output is empty.'
      );
    }

    // Validate output is a valid JSON
    try {
      JSON.parse(modelOutputString);
    } catch (error) {
      this.customErrorHandler.throwInternalError(
        'CARD_MAPPING_SKILL_OUTPUT_ERROR',
        `Failed to generate card mapping. The skill output is not a valid JSON. Error: ${error}`
      );
    }

    // Validate output is structured with mapped_fields root object
    // Example: modelOutputString = { "mapped_fields": { ... } }
    const mappedFieldsObject = JSON.parse(modelOutputString).mapped_fields;
    if (!mappedFieldsObject) {
      this.customErrorHandler.throwInternalError(
        'CARD_MAPPING_SKILL_OUTPUT_ERROR',
        'Failed to generate card mapping. The skill output does not contain the mapped_fields object.'
      );
    }

    // Validate output is deconstructable
    // Example modelOutputString = { "mapped_fields": { } }
    let mappedTemplateFieldNames;
    let allFields;
    try {
      mappedTemplateFieldNames = cardSlotDescriptionsJsonObject.map(
        (field) => field.name
      );
      allFields = {
        ...textFieldsToMapJsonObject,
        ...imageFieldsToMapJsonObject,
        ...videoFieldsToMapJsonObject,
      };
    } catch (error) {
      this.customErrorHandler.throwInternalError(
        'CARD_MAPPING_SKILL_OUTPUT_ERROR',
        `Failed to generate card mapping. The skill output is not deconstructable. Error: ${error}`
      );
    }

    for (const mappedFieldName in mappedFieldsObject) {
      // Validate mapped_fields keys exist as names in the mapped template fields
      // Example: modelOutputString = { "mapped_fields": { "text_01": "...", ... } } && cardSlotDescriptionsJsonObject = [ { "name": "text_01", ... } ]
      if (!mappedTemplateFieldNames.includes(mappedFieldName)) {
        this.customErrorHandler.throwInternalError(
          'CARD_MAPPING_SKILL_OUTPUT_ERROR',
          `Failed to generate card mapping. The skill output contains a mapped field that does not exist in the mapped template fields. Field: ${mappedFieldName}`
        );
      }

      /** TODO: Validation is disabled, out of date now that input fields are arrays
            Validate mapped_fields values exist as keys in the textFields or imageFields
            Example modelOutputString = { "mapped_fields": { "...": "number", ... } } && textFieldsToMapJsonObject = { "number": { ... }, ... }
            if (mappedFieldsObject[mappedFieldName] === undefined || mappedFieldsObject[mappedFieldName] === '') {
                continue;
            }
            if (!allFields[mappedFieldsObject[mappedFieldName]]) {
                this.customErrorHandler.throwInternalError(
                    'CARD_MAPPING_SKILL_OUTPUT_ERROR',
                    `Failed to generate card mapping. The skill output contains a mapped field that does not exist in the input fields. Field: ${mappedFieldsObject[mappedFieldName]}`
                );
            } */
    }
  }

  _parseCardMappingSkillResponse(skillPayloadObject) {
    try {
      const responseString =
        skillPayloadObject.capabilities[this.WEB_TO_MOBILE_CAPABILITY_ID]
          .response;
      const logId =
        skillPayloadObject.capabilities[this.WEB_TO_MOBILE_CAPABILITY_ID].logId;
      const responseObject = JSON.parse(responseString);
      const modelOutputString = responseObject.model_output;

      return { modelOutputString, logId };
    } catch (error) {
      this.customErrorHandler.throwInternalError(
        'CARD_MAPPING_SKILL_RESPONSE_ERROR',
        `Failed to parse card mapping skill response. Error: ${error}`
      );
    }
  }
}

module.exports = NowAssistSkillWrapper;
