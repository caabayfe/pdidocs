class BuildAgentPromotedActionProvider {
	// Constants
	#CRUD_OPERATIONS = {
		CREATE: 'create',
		READ: 'read',
		WRITE: 'write',
		DELETE: 'delete',
	};

	/**
	 * Constructor initializes the user roles
	 */
	constructor() {
		this.userRoles = this.#getCurrentUserRoles();
	}

	// ===== PUBLIC API METHODS =====

	/**
	 * Get the promoted actions configuration as a map
	 * @return {Object} - Map of action IDs to their configurations
	 */
	getPromotedActionsConfigMap() {
		return {
			createApp: {
				id: 'createApp',
				label: gs.getMessage('Create App'),
				icon: 'window-outline',
				description: gs.getMessage('Create a new application from scratch'),
				roles: [],
				requiredTables: [
					{
						name: 'sys_app',
						operations: [this.#CRUD_OPERATIONS.CREATE],
					},
				],
				initialPrompt: 'I want to create a new app',
			},
			updateApp: {
				id: 'updateApp',
				label: gs.getMessage('Update App'),
				icon: 'pencil-outline',
				description: gs.getMessage('Modify an existing application'),
				roles: [],
				requiredTables: [
					{
						name: 'sys_metadata',
						operations: [this.#CRUD_OPERATIONS.WRITE],
					},
					{
						name: 'sys_app',
						operations: [this.#CRUD_OPERATIONS.WRITE],
					},
				],
				initialPrompt: 'I want to update an app',
			},
			createFile: {
				id: 'createFile',
				label: gs.getMessage('Create File'),
				icon: 'document-blank-outline',
				description: gs.getMessage('Create a new file in an existing app'),
				roles: [],
				requiredTables: [
					{
						name: 'sys_metadata',
						operations: [this.#CRUD_OPERATIONS.CREATE],
					},
				],
				initialPrompt: 'I want to create a new file',
			},
			updateFile: {
				id: 'updateFile',
				label: gs.getMessage('Update File'),
				icon: 'document-outline',
				description: gs.getMessage('Modify an existing file'),
				roles: [],
				requiredTables: [
					{
						name: 'sys_metadata',
						operations: [this.#CRUD_OPERATIONS.WRITE],
					},
				],
				initialPrompt: 'I want to update a file',
			},
			summarizeApp: {
				id: 'summarizeApp',
				label: gs.getMessage('Summarize App'),
				icon: 'score-list-outline',
				description: gs.getMessage('Get a summary of an application'),
				roles: [],
				requiredTables: [
					{
						name: 'sys_metadata',
						operations: [this.#CRUD_OPERATIONS.WRITE],
					},
				],
				initialPrompt: 'Summarize an app for me',
			},
			addAgentToApp: {
				id: 'addAgentToApp',
				label: gs.getMessage('Add Agent to App'),
				icon: 'bot-outline',
				description: gs.getMessage('Add build agent capabilities to an app'),
				roles: ['sn_aia.admin'],
				requiredTables: [
					{
						name: 'sn_aia_agent',
						operations: [this.#CRUD_OPERATIONS.WRITE],
					},
				],
				initialPrompt: 'I want to add build agent to my app',
			},
		};
	}

	/**
	 * Filters a list of promoted actions based on user access permissions
	 * @param {Array<Object>} promotedActions - Array of promoted action configuration objects with the following structure:
	 *   - id {string} - Unique identifier for the action (optional, will generate if missing)
	 *   - label {string} - Display label for the action (required)
	 *   - description {string} - Detailed description of the action (optional)
	 *   - icon {string} - Icon name for the action (optional)
	 *   - initialPrompt {string} - Initial prompt text for the action (optional)
	 *   - roles {Array<string>} - Roles required for this action (optional)
	 *   - requiredTables {Array<Object>} - Tables and operations required for this action (optional)
	 * @return {Array<Object>} - Returns filtered list of accessible promoted actions with access control properties removed
	 *   - id {string} - Unique identifier for the action
	 *   - label {string} - Display label for the action
	 *   - description {string} - Detailed description of the action
	 *   - icon {string} - Icon name for the action
	 *   - initialPrompt {string} - Initial prompt text for the action
	 */
	filterPromotedActionsByAccess(promotedActions) {
		return promotedActions.reduce((result, action, index) => {
			const shouldInclude = this.#hasPromotedActionAccess(action);

			if (shouldInclude) {
				if (!action.label) return result;
				result.push({
					id: action.id || `promoted-action-${index}`,
					label: action.label,
					description: action.description || '',
					icon: action.icon || 'document-outline',
					initialPrompt: action.initialPrompt || action.label,
				});
			}
			return result;
		}, []);
	}

	// ===== PRIVATE HELPER METHODS =====

	/**
	 * Check if the current user has access to a specific action
	 * @param {Object} action - The action configuration object containing roles and requiredTables
	 * @return {Boolean} - Returns true if the user has access, false otherwise
	 * @private
	 */
	#hasPromotedActionAccess(action) {
		if (!action) return true;

		// Check if any restrictions exist
		const hasRoles = action.roles && action.roles.length > 0;
		const hasTables = action.requiredTables && action.requiredTables.length > 0;

		// If no restrictions, allow access
		if (!hasRoles && !hasTables) return true;

		// Check role access if roles exist
		if (hasRoles && this.#checkRoleAccess(action.roles)) return true;

		// Check table access if tables exist
		if (hasTables && this.#checkTableAccess(action.requiredTables)) return true;

		// No access granted
		return false;
	}

	/**
	 * Check if the current user has any of the required roles
	 * @param {Array} requiredRoles - Array of role names
	 * @return {Boolean} - Whether the user has any of the required roles
	 * @private
	 */
	#checkRoleAccess(requiredRoles) {
		if (!requiredRoles || requiredRoles.length === 0) return true;

		for (let i = 0; i < requiredRoles.length; i++) {
			if (this.userRoles.has(requiredRoles[i])) return true;
		}

		return false;
	}

	/**
	 * Check if the current user has access to any of the required tables
	 * @param {Array} requiredTables - Array of table names with required operations
	 * @return {Boolean} - Whether the user has access to any of the required tables
	 * @private
	 */
	#checkTableAccess(requiredTables) {
		if (!requiredTables || requiredTables.length === 0) return true;

		const user = gs.getUser();

		for (let i = 0; i < requiredTables.length; i++) {
			const tableConfig = requiredTables[i];
			const tableName = tableConfig.name;
			const { operations } = tableConfig;

			if (!tableName || !operations) continue;

			var gr = new GlideRecord(tableName);

			// Check if at least one operation is allowed
			for (let j = 0; j < operations.length; j++) {
				const operation = operations[j];

				// If any operation is allowed, return true immediately
				if (this.#hasOperationAccess(gr, operation)) return true;
			}
		}

		return false;
	}

	/**
	 * Check if the current user has access to perform a specific operation on a GlideRecord
	 * @param {GlideRecord} gr - The GlideRecord to check permissions on
	 * @param {String} operationType - The operationType to check ('create', 'read', 'write', 'delete')
	 * @return {Boolean} - Whether the user has permission to perform the operation
	 * @private
	 */
	#hasOperationAccess(gr, operationType) {
		if (!gr || !operationType) return false;

		let hasAccess = false;
		switch (operationType) {
			case this.#CRUD_OPERATIONS.CREATE:
				hasAccess = gr.canCreate();
				break;
			case this.#CRUD_OPERATIONS.WRITE:
				hasAccess = gr.canWrite();
				break;
			case this.#CRUD_OPERATIONS.READ:
				hasAccess = gr.canRead();
				break;
			case this.#CRUD_OPERATIONS.DELETE:
				hasAccess = gr.canDelete();
				break;
			default:
				break;
		}
		return hasAccess;
	}

	/**
	 * Get current user's roles
	 * @return {Set} - Set of role names
	 * @private
	 */
	#getCurrentUserRoles() {
		const user = gs.getUser();
		const userRoles = user.getRoles();
		return new Set(userRoles);
	}
}
