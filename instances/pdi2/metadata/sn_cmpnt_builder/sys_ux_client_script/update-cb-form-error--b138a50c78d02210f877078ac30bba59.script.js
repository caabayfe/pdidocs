/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
  /*
   * Helper Functions
   * For some reason, there are errors when utility fns are declared outside of the handler...
   */

  /**
   * Returns duplicate-name error if present
   * @param {api} params.api
   * @param {any} params.event
   * @param {Record<string, string} TRANSLATED_FIELD_MAP
   */
  const getDuplicateNameErrors = (api, event, TRANSLATED_FIELD_MAP) => {
    const { componentName } = api.state;

    // validations are run through validate_cb_component_name or validate_cb_component_name_and_create
    const duplicateNameResults = api.data[event.elementId].results;

    // we only care about results if a component name has been set
    const hasResults = componentName && !!duplicateNameResults.length;

    // if componentName is set, and it is a duplicate, return error
    return hasResults ? TRANSLATED_FIELD_MAP.DUPLICATE_NAME_ERROR : "";
  };

  /**
   * Returns keys of any empty fields
   * @param {api['state']} state
   * @param {boolean} isOnSubmit
   * @returns {Promise<string[]>}
   */
  const validateEmptyComponentFields = (state, isOnSubmit) => {
    const keys = ["componentName"];

    const emptyFields = keys.reduce((fields, key) => {
      const val = state[key];

      const shouldValidateField = isOnSubmit || typeof val === "string";

      // if val is not a string (null | undefined) and we're not submitting, we can skip
      if (!shouldValidateField) return fields;

      // we normally only care for empty strings, but default state matters if we're trying to submit
      if (!val || !val?.trim() || !val?.trim()?.length) fields.push(key);

      return fields;
    }, []);

    return emptyFields;
  };

  /**
   * Returns keys of any empty fields
   * @param {api['state']} state
   * @param {boolean} isOnSubmit
   * @param {Record<string, string} TRANSLATED_FIELD_MAP
   * @returns {Promise<string>}
   */
  const getFieldValidationErrors = (state, isOnSubmit, TRANSLATED_FIELD_MAP) => {
    const emptyFields = validateEmptyComponentFields(state, isOnSubmit);

    // if no fields are returned as empty, lets return early
    if (!emptyFields.length) return "";

    const { SINGLE_FIELD_EMPTY, MULTIPLE_FIELD_EMPTY } = TRANSLATED_FIELD_MAP;

    const readableFields = emptyFields.map((field) => TRANSLATED_FIELD_MAP[field]);

    const errorContent = emptyFields.length > 1 ? MULTIPLE_FIELD_EMPTY : SINGLE_FIELD_EMPTY;
    // "<readable field names> + is/are required field/s"
    return `${readableFields.join(", ")} ${errorContent}`;
  };

  /*
   * Constants
   * This is declared here for translations only...
   */
  const TRANSLATED_FIELD_MAP = {
    componentName: await helpers.translate("Name"),
    componentIcon: await helpers.translate("Icon"),
    componentDescription: await helpers.translate("Description"),
    SINGLE_FIELD_EMPTY: await helpers.translate("is a required field."),
    MULTIPLE_FIELD_EMPTY: await helpers.translate("are required fields."),
    DUPLICATE_NAME_ERROR: await helpers.translate("A component by this name already exists."),
  };

  const COMPONENT_BUILDER_CREATION_ERROR_KEY = "cbValidationError";

  /*
   * Script
   */
  const { componentName, componentDescription, componentIcon, componentImageIcon, searchFacetCategories } = api.state;

  // validations are run through `validate_cb_component_name_and_create` on submit
  const isOnSubmit = event.elementId === "validate_cb_component_name_and_create";

  const duplicateNameError = getDuplicateNameErrors(api, event, TRANSLATED_FIELD_MAP);

  // if we found duplication errors, no need to continue
  if (duplicateNameError) {
    api.setState(COMPONENT_BUILDER_CREATION_ERROR_KEY, duplicateNameError);
    return;
  }

  const fieldErrorMessage = getFieldValidationErrors(api.state, isOnSubmit, TRANSLATED_FIELD_MAP);

  // if we found empty-field errors, no need to continue
  if (fieldErrorMessage.length) {
    api.setState(COMPONENT_BUILDER_CREATION_ERROR_KEY, fieldErrorMessage);
    return;
  }

  // if no errors by now, lets clear the error + alert
  api.setState(COMPONENT_BUILDER_CREATION_ERROR_KEY, "");

  // if not on-submit, we're done here
  if (!isOnSubmit) return;

  // if no errors by now, and is on submit, then do the thing...
  const name = componentName.trim();
  const description = componentDescription?.trim() || "";
  const icon = componentIcon || "none";
  const imageIcon = componentImageIcon?.sysId || "";
  const categories = (searchFacetCategories ?? []).map(({id}) => id)
  const categoryList = (searchFacetCategories ?? [])
  .map(({ label }) => label)
  .sort()
  .join(",");
  
  api.emit( "SN_UIBTK_APP_SHELL_CONTAINER#METRIC_TRACKING_REQUESTED", {
    eventName: "Component Builder - Add Categories",
    metadata: {
      categories: categoryList
    }
  });

  api.data.create_cb_component_record_set.execute({
    name,
    description,
    icon,
    imageIcon,
    searchFacets: categories.join(',')
  });
  return;
}
