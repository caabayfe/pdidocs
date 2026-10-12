class BuildAgentConfig {
	/**
	 * Returns the complete build agent configuration object
	 * @param {string} context - The experience context (e.g., ServiceNowStudio, ServiceNowIDE)
	 * @return {Object} Configuration object containing promoted actions
	 */
	static getBuildAgentConfig(context) {
		return {
			promotedActions: BuildAgentConfig.getPromotedActions(context),
		};
	}

	/**
	 * Returns the appropriate promoted actions based on the experience context
	 * @param {string} context - The experience context (e.g., ServiceNowStudio, ServiceNowIDE)
	 * @return {Array<Object>} Array of promoted action objects, each containing:
	 *   - id {string} - Unique identifier for the action
	 *   - label {string} - Display label for the action
	 *   - description {string} - Detailed description of the action
	 *   - icon {string} - Icon name for the action
	 *   - initialPrompt {string} - Initial prompt text for the action
	 */
	static getPromotedActions(context) {
		switch (context) {
			case ExperienceConfiguration.ExperienceType.ServiceNowStudio:
				return StudioUtils.getSNSPromotedActions();
			case ExperienceConfiguration.ExperienceType.ServiceNowIDE:
				return StudioUtils.getIDEPromotedActions();
			default:
				break;
		}
		return [];
	}
}
