class MobileComponentGenAiComposer {
  constructor() {
    this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
    this.nowAssistSkillWrapper = new NowAssistSkillWrapper();
    this.mappedCardComponentTransformer = new MappedCardComponentTransformer();
    this.cardTemplateUtility = new CardTemplateUtility();
  }

  generateCard(table, componentName, fields) {
    // AIS Call
    let query = `${table}${
      componentName && componentName.toLowerCase() !== 'default view'
        ? `, ${componentName}`
        : ''
    }`.trim();
    const recomendedTemplates =
      this.cardTemplateUtility.getRecommendedStarterTemplates(query);
    const topRecomendedTemplate =
      this.cardTemplateUtility.getStarterTemplateMetadataByName(
        recomendedTemplates.results[0].name
      );

    // Field & Template Metadata preperation for LLM
    const mappableTemplateFields =
      topRecomendedTemplate.templateSlotDescriptions
        .filter(
          (field) =>
            field.type === 'value' ||
            field.type === 'image' ||
            field.type === 'video'
        )
        .map(({ groupedWith, ...rest }) => rest);
    const textSlotsToFill = mappableTemplateFields.filter(
      (field) => field.type === 'value'
    ).length;
    const inputFields = this._splitAndParseFields(
      table,
      fields,
      textSlotsToFill
    );

    // Skill Call
    const cardMapping = this.nowAssistSkillWrapper.generateCardMapping(
      inputFields.textFields,
      inputFields.imageFields,
      inputFields.videoFields,
      mappableTemplateFields
    );
    const cardMappingObject = JSON.parse(cardMapping.modelOutputString);

    // Pass Prompt Params for Regen
    const log = {
      id: cardMapping.logId,
      table: table,
      templateId: topRecomendedTemplate.sys_id,
      textFields: inputFields.textFields,
      imageFields: inputFields.imageFields,
      videoFields: inputFields.videoFields,
      mappableTemplateFields: mappableTemplateFields,
      generatedMappings: [cardMappingObject],
    };

    // Tranformer Call
    const card = this.mappedCardComponentTransformer.transformToCardComponent(
      table,
      topRecomendedTemplate.sys_id,
      cardMappingObject.mapped_fields,
      log
    );

    return card;
  }

  regenerateCard(log) {
    // Rule: We need to 100% safeguard against the case where the LLM will provide a duplicate mapping
    let textFieldsToExclude = this._selectRandomMappedTextFields(log);
    let smallerTextFieldArray = log.textFields.filter(
      (field) => !textFieldsToExclude.includes(field.name)
    );

    // Skill Call
    const cardMapping = this.nowAssistSkillWrapper.generateCardMapping(
      smallerTextFieldArray,
      log.imageFields,
      log.videoFields,
      log.mappableTemplateFields
    );
    const cardMappingObject = JSON.parse(cardMapping.modelOutputString);

    // Update Log
    let updatedLog = { ...log };
    updatedLog.generatedMappings.unshift(cardMappingObject);
    // if there are more than 3 mappings, remove the last one
    if (updatedLog.generatedMappings.length > 3) {
      updatedLog.generatedMappings.pop();
    }
    updatedLog.id = cardMapping.logId;

    // Tranformer Call
    const card = this.mappedCardComponentTransformer.transformToCardComponent(
      log.table,
      log.templateId,
      cardMappingObject.mapped_fields,
      updatedLog
    );

    // Return the new card
    return card;
  }

  _splitAndParseFields(table, fields, textSlotsToFill) {
    let tableHelper = new TableMetadataHelper(table);
    let subsetOfFields = tableHelper.getSubsetOfFields(fields);

    const textFields = [];
    const textFieldsBackfill = [];
    const imageFields = [];
    const videoFields = [];
    const otherFields = [];

    fields.forEach((field, index) => {
      subsetOfFields[field].index = index;
    });
    const sortedFields = Object.keys(subsetOfFields).sort(
      (a, b) => subsetOfFields[a].index - subsetOfFields[b].index
    );

    for (const field of sortedFields) {
      if (
        tableHelper.textDisplayFieldTypes.includes(subsetOfFields[field].type)
      ) {
        // Rule: We want to limit the number of text fields to 1st 15 text fields in the ordered view
        if (textFields.length >= 15) {
          continue;
        }

        const fieldsPopulatedPercentage = parseFloat(
          tableHelper.calculatePopulatedPercentage(field.name).toFixed(2)
        );

        // Rule: We don't want large context size in cards
        // Rule: We don't want fields with less than %25 fields populated
        if (
          fieldsPopulatedPercentage < 25 ||
          subsetOfFields[field].length > 255
        ) {
          textFieldsBackfill.push({
            name: field,
            fieldsPopulatedPercentage: fieldsPopulatedPercentage,
            type: subsetOfFields[field].type,
            length: subsetOfFields[field].length,
          });
          continue;
        }

        textFields.push({
          name: field,
          fieldsPopulatedPercentage: fieldsPopulatedPercentage,
          type: subsetOfFields[field].type,
          length: subsetOfFields[field].length,
        });
      } else if (
        tableHelper.imageDisplayFieldTypes.includes(subsetOfFields[field].type)
      ) {
        imageFields.push(field);
      } else if (
        tableHelper.videoDisplayFieldTypes.includes(subsetOfFields[field].type)
      ) {
        videoFields.push(field);
      } else {
        otherFields.push(field);
      }
    }

    // Backfill with other fields if we don't have enough text fields
    if (textFields.length < textSlotsToFill) {
      textFields.push(
        ...textFieldsBackfill.splice(0, textSlotsToFill - textFields.length)
      );
    }

    return { textFields, imageFields, videoFields, otherFields };
  }

  /**
   * Selects random text fields from the mapped fields in the log.
   * @param {Object} log - The log object containing generated mappings.
   * @returns {string[]} - An array of randomly selected text fields.
   * Example:
   * Input:
   * {
   *   generatedMappings: [
   *     { 'text_01': 'short_description', 'text_02': 'assignment_group' },
   *     { 'text_01': 'business_service', 'image_01': 'photo' }
   *   ]
   * }
   *
   * Returns:
   * ['short_description', 'business_service']
   */
  _selectRandomMappedTextFields(log) {
    let textFieldsToExclude = [];
    let allMappedFields = log.generatedMappings.flatMap(
      (mapping) => mapping.mapped_fields
    );
    allMappedFields.forEach((mappedFields) => {
      let textFields = Object.keys(mappedFields).filter((field) =>
        field.startsWith('text')
      );
      if (textFields.length > 0) {
        let randomIndex = Math.floor(Math.random() * textFields.length);
        textFieldsToExclude.push(mappedFields[textFields[randomIndex]]);
      }
    });

    // Ensure we don't exclude more text fields than we have
    let totalTextFields = log.textFields.length;
    if (textFieldsToExclude.length > totalTextFields) {
      textFieldsToExclude = textFieldsToExclude.slice(0, totalTextFields - 1);
    }

    return textFieldsToExclude;
  }
}

module.exports = MobileComponentGenAiComposer;
