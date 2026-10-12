/**
 * Filters menu items based on skill activation statuses.
 *
 * @param {Object} params - The parameters object.
 * @param {Object} params.api - The API object for accessing data.
 * @param {TransformApiHelpers} params.helpers - Helper functions for transformations.
 * @returns {Array} - The filtered menu items.
 */
function evaluateProperty({ api, helpers }) {
  // Retrieve necessary data from the API
  const menuItems = api.data.list_controller.listMenu.selectedTab.treeContent || [];
  const duplicatesSkillStatus = api.data.fetch_duplicates_skill_activation_status.output;
  const csmGapsSkillStatus = api.data.fetch_gaps_csm_skill_activation_status.output;
  const itsmGapsSkillStatus = api.data.fetch_gaps_itsm_skill_activation_status.output;
  
  // Helper function to filter children of "Knowledge Gaps"
  const filterChildren = (children) =>
    (children || []).filter((child) => {
      if (child.label === "CSM Gaps") return csmGapsSkillStatus !== 0; // Include only if CSM Gaps skill is active
      if (child.label === "ITSM Gaps") return itsmGapsSkillStatus !== 0; // Include only if ITSM Gaps skill is active
      return true; // Include all other children
    });

  // Main filter logic for menu items
  return menuItems.filter((menuItem) => {
    switch (menuItem.label) {
      case "Duplicate Articles":
        return duplicatesSkillStatus !== 0; // Include only if the skill is active
      case "Knowledge Gaps":
        if (itsmGapsSkillStatus === 0 && csmGapsSkillStatus === 0) return false;
        menuItem.children = filterChildren(menuItem.children); // Filter children if only one skill is active
      default:
        return true; // Include all other menu items
    }
  });
}
