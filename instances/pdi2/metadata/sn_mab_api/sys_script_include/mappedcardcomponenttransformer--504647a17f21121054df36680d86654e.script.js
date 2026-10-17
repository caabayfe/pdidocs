/**
 * The MappedCardComponentTransformer class is responsible for transforming a generated template mapping JSON object to a mobile mobile components.
 */
class MappedCardComponentTransformer {
  constructor() {
    this.validationHandler = new ValidationHandler();
    this.customErrorHandler = new CustomErrorHandler(this.constructor.name);
    this.cardTemplateUtility = new CardTemplateUtility();
    this.SOURCE_ID = 'Now Assist';
  }

  /**
   * Transforms a generated template mapping JSON Object to mobile card records.
   *
   * @param {string} table - name (not the label) of the table the values from the mapped json come from.
   *
   * Exaple
   * "sys_user"
   *
   * @param {string} templateId - sys id of the template that the fields from the mapped json come from.
   * @param {Object} mappedCardJsonObject - field to template mappings to be converted to a card.
   * @param {Object} log - The LLM conversation history provided by the MobileComponentGenAiComposer.
   *
   * @returns {Object} - An object containing a flat set of card records.
   *
   * Example
   * {
   *   sysSgViewConfig: {...},
   *   sysSgViewConfigElement: [{...}, {...}, ...],
   *   sysSgViewConfigElementAttribute: [{...}, {...}, ...]
   * }
   *
   */
  transformToCardComponent(table, templateId, mappedCardJsonObject, log) {
    this._validateTableExists(table);
    const template = this.cardTemplateUtility.getCardTemplate(templateId);
    const templateMetadata =
      this.cardTemplateUtility.getStarterTemplateMetadataByName(template.name);
    const tableMetadata = new TableMetadataHelper(table);
    this._validateCardMappedJson(mappedCardJsonObject);

    const cardRecord = this._createCardRecord(table, templateId, log);

    const cardElements = [];
    const cardElementAttributes = [];
    for (const slotName in mappedCardJsonObject) {
      const templateSlotId = template.slots.find(
        (slot) => slot.name === slotName
      )?.id;

      const cardElement = this._createCardRecordElement(
        cardRecord.sysId,
        slotName,
        templateSlotId
      );
      cardElements.push(cardElement);

      const cardElementAttribute = this._createCardRecordElementAttribute(
        cardElement.sysId,
        mappedCardJsonObject[slotName],
        'FieldValue'
      );
      cardElementAttributes.push(cardElementAttribute);
    }

    // Create a new object of only the templateSlotDescriptions that are of type 'label'
    const labelTemplateSlotDescriptions =
      templateMetadata.templateSlotDescriptions.filter(
        (slot) => slot.type === 'label'
      );
    for (const labelSlotDescription of labelTemplateSlotDescriptions) {
      const valueSlotDescription =
        templateMetadata.templateSlotDescriptions.find(
          (slot) =>
            slot.groupedWith.includes(labelSlotDescription.name) &&
            slot.type === 'value'
        );
      const valueSlotMapping = mappedCardJsonObject[valueSlotDescription.name];

      if (!valueSlotMapping) {
        continue;
      }

      const templateSlotId = template.slots.find(
        (slot) => slot.name === labelSlotDescription.name
      )?.id;
      const cardElement = this._createCardRecordElement(
        cardRecord.sysId,
        labelSlotDescription.name,
        templateSlotId
      );
      cardElements.push(cardElement);

      const cardElementAttribute = this._createCardRecordElementAttribute(
        cardElement.sysId,
        valueSlotMapping,
        'FieldLabel'
      );
      cardElementAttributes.push(cardElementAttribute);
    }

    return {
      sysSgViewConfig: cardRecord,
      sysSgViewConfigElement: cardElements,
      sysSgViewConfigElementAttribute: cardElementAttributes,
    };
  }

  /**
   * validates that the table exists in the instance.
   *
   * @param {string} tableName - name of the table the values from the mapped json come from.
   *
   * @returns {boolean} true if the mapped json is valid, false otherwise.
   */
  _validateTableExists(tableName) {
    if (!this.validationHandler.isValidTable(tableName)) {
      this.customErrorHandler.throwBadRequestError(
        'TABLE_NOT_FOUND',
        `Failed mapping. Table does not exist: ${tableName}`
      );
    }
  }

  /**
   * Validates the mapped json object is parsable and confroms to the needed structure.
   *
   * @param {Object} mappedCardJsonObject - field to template mappings to be converted to a card.
   *
   * The structure of the mappedCardJsonObject object is as follows:
   * {
   *     "slot_name": "table_field_name",
   *     "slot_name": "table_field_name",
   *     ...
   * }
   *
   * @returns {boolean} true if the mapped json is valid, false otherwise.
   */
  _validateCardMappedJson(mappedCardJsonObject) {
    if (
      typeof mappedCardJsonObject !== 'object' ||
      mappedCardJsonObject === null
    ) {
      this.customErrorHandler.throwBadRequestError(
        'INVALID_MAPPED_JSON',
        'Failed mapping. Mapped JSON is not an object'
      );
    }

    for (const slotName in mappedCardJsonObject) {
      if (
        typeof slotName !== 'string' ||
        typeof mappedCardJsonObject[slotName] !== 'string'
      ) {
        this.customErrorHandler.throwBadRequestError(
          'INVALID_MAPPED_JSON',
          'Failed mapping. Mapped JSON is not in the correct structure.'
        );
      }
    }
  }

  /**
   * Creates a card record from the given table and template id.
   *
   * @param {string} table - name of the table the values from the mapped json come from.
   * @param {string} templateId - sys id of the template that the fields from the mapped json come from.
   * @param {Object} log - The LLM conversation history provided by the MobileComponentGenAiComposer.
   *
   * @returns {Object} - An object of a new card component given table and template id.
   */
  _createCardRecord(table, templateId, log) {
    const tableLabel = new GlideRecord(table).getLabel();

    return {
      tableName: 'sys_sg_view_config',
      sysId: `new_${gs.generateGUID()}`,
      log: log,
      fields: {
        name: `${tableLabel} - Record Screen Card`,
        table: table,
        template: templateId,
        description: `This is a new card for the ${tableLabel} table. This card has been AI Generated from the Web to Mobile Process.`,
        creation_method: this.SOURCE_ID,
      },
    };
  }

  /**
   * Creates a card record element from the given template slot name and template slot id.
   *
   * @param {string} templateSlotName - the name of the template slot.
   * @param {string} templateSlotId - the sys id of the template slot.
   *
   * @returns {Object} - An object of a new card element based on the template slot.
   */
  _createCardRecordElement(cardId, templateSlotName, templateSlotId) {
    return {
      tableName: 'sys_sg_view_config_element',
      sysId: `new_${gs.generateGUID()}`,
      fields: {
        name: `${templateSlotName}_element`,
        view_config: cardId,
        view_template_slot: templateSlotId,
        creation_method: this.SOURCE_ID,
      },
    };
  }

  /**
   * Creates a card record element attribute from the given card element id, mapped field, and field type.
   *
   * @param {string} cardElementId - the sys id of the card element.
   * @param {string} fieldInput - the field that is mapped to the card element.
   * @param {string} fieldType - the type of the field that is mapped to the card element.
   *
   * @returns {Object} - An object of a new card element attribute based on the card element.
   */
  _createCardRecordElementAttribute(cardElementId, fieldInput, fieldType) {
    // These hardcoded values are added to the attribute 'name' field because the
    // 'name' is what is used to determine the type of the field attribute.
    const fieldSysIds = {
      FieldValue: 'c2eed5c2b7321010df65f6efce11a9cf',
      FieldLabel: 'c90fd1c2b7321010df65f6efce11a9d2',
      TextValue: '601f19c2b7321010df65f6efce11a925',
    };

    let attribute = {
      tableName: 'sys_sg_view_config_element_attribute',
      sysId: `new_${gs.generateGUID()}`,
      fields: {
        name: fieldSysIds[fieldType] || fieldSysIds['FieldValue'],
        view_config_element: cardElementId,
        creation_method: this.SOURCE_ID,
      },
    };

    if (fieldType === 'FieldValue' || fieldType === 'FieldLabel') {
      attribute.fields.value = fieldInput;
    } else if (fieldType === 'TextValue') {
      attribute.fields.translated_value = fieldInput;
    }

    return attribute;
  }
}

module.exports = MappedCardComponentTransformer;
