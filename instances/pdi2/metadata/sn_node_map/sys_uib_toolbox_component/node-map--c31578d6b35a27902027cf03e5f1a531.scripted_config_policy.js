
/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
function policy({api, trigger, properties: p}) { //eslint-disable-line no-unused-vars

	/**
	 * Extract layout property calculations to reduce cognitive complexity
	 * @returns {Object} Layout property flags
	 */
	const _getLayoutProperties = () => {
		const isLayeredGroups = p.layout === 'layered-groups';
		const isUnifiedForce = p.layout === 'unified-force';
		const isUnifiedVertical = p.layout === 'unified-vertical';
		const isHorizontal = p.layout === 'horizontal';
		const isRadial = p.layout === 'radial';
		const isHierarchicalTopDown = p.layout === 'hierarchical-topdown';
		const isForce = p.layout === 'force';

		const isUnifiedMap = isUnifiedForce || isUnifiedVertical;
		const hasMultiEdgeTypes = isUnifiedVertical || isHierarchicalTopDown || isHorizontal || isRadial;
		const supportsEdgeAggregation = isHierarchicalTopDown || isForce || isHorizontal || isRadial;
		const isLabelPositionAvailable = !isUnifiedVertical && !isUnifiedForce;
		const alignToNodePosition = isHierarchicalTopDown || isUnifiedVertical || isHorizontal;
		const canLabelScale = isUnifiedMap || isHorizontal || isRadial;
		const hasDragging = !isRadial && !isLayeredGroups;
		const isSupportsCluster = !isLayeredGroups && !isUnifiedMap;

		return {
			isLayeredGroups,
			isUnifiedMap,
			isForce,
			isHierarchicalTopDown,
			hasMultiEdgeTypes,
			hasDragging,
			supportsEdgeAggregation,
			isLabelPositionAvailable,
			alignToNodePosition,
			canLabelScale,
			isSupportsCluster
		};
	};

	/**
	 * Update the visibility of properties based on layout properties
	 * @param {Object} props - Layout property flags
	 */
	const _updateLayoutVisibility = props => {
		const {
			isLayeredGroups,
			isUnifiedMap,
			isForce,
			isHierarchicalTopDown,
			hasMultiEdgeTypes,
			hasDragging,
			supportsEdgeAggregation,
			isLabelPositionAvailable,
			alignToNodePosition,
			canLabelScale,
			isSupportsCluster
		} = props;

		// Node properties
		api.updateVisibility('nodeMacroponent', !isUnifiedMap);
		api.updateVisibility('nodeWidthMode', !isUnifiedMap);
		api.updateVisibility('nodeHeightMode', !isUnifiedMap);
		api.updateVisibility('nodeWidth', !isUnifiedMap);
		api.updateVisibility('nodeHeight', !isUnifiedMap);
		api.updateVisibility('nodeSize', isUnifiedMap); // Enable only for Unified
		api.updateVisibility('nodeSpacing', isForce);
		api.updateVisibility('nodeShape', !isUnifiedMap);
		api.updateVisibility('labelPosition', isLabelPositionAvailable);

		// Edge properties
		api.updateVisibility('mergeEdgeSegments', isLayeredGroups);
		api.updateVisibility('manageAutoGroupEdges', !isLayeredGroups);
		api.updateVisibility('enableMagnificationEffect', !isLayeredGroups);
		api.updateVisibility('edgeType', hasMultiEdgeTypes);
		api.updateVisibility('edgesAggregation', supportsEdgeAggregation);

		// Layout properties
		api.updateVisibility('reduceNodeSpacing', isHierarchicalTopDown);
		api.updateVisibility('reLayoutRequested', !isLayeredGroups);
		api.updateVisibility('suspendReLayout', !isLayeredGroups);
		api.updateVisibility('alignToNodePosition', alignToNodePosition);
		api.updateVisibility('canLabelScale', canLabelScale);
		api.updateVisibility('disableDragging', hasDragging);

		//Only for supports Cluster layouts
		api.updateVisibility('manageExpanded', isSupportsCluster);
		api.updateVisibility('clusterMacroponent', isSupportsCluster);

		// UI controls
		api.updateVisibility('disableExpand', !isUnifiedMap);
		api.updateVisibility('disableHome', !isUnifiedMap);
	};

	/**
	* Syncing properties that need to show/hide depending on the chosen layout.
	*/
	const _layoutChanged = () => {
		const layoutProperties = _getLayoutProperties();
		_updateLayoutVisibility(layoutProperties);
	};

	const _setMacroponent = () => {
		api.updateVisibility('nodeWidthMode', true);
		api.updateVisibility('nodeHeightMode', true);
		api.updateVisibility('nodeWidth', true);
		api.updateVisibility('nodeHeight', true);
		api.updateVisibility('maxNodeWidth', false);
		api.updateVisibility('maxNodeHeight', false);
		api.updateVisibility('nodeSize', false);
		api.updateVisibility('nodeSpacing', true);
	};

	/**
	 * Updates visibility based on width mode
	 * @param {string} mode - Width mode value
	 */
	const _handleWidthMode = mode => {
		switch (mode) {
			case 'auto':
				api.updateVisibility('nodeWidth', false);
				api.updateVisibility('maxNodeWidth', false);
				break;
			case 'nodeWidth':
				api.updateVisibility('maxNodeWidth', false);
				api.updateVisibility('nodeWidth', true);
				break;
			case 'maxNodeWidth':
				api.updateVisibility('nodeWidth', false);
				api.updateVisibility('maxNodeWidth', true);
				break;
			default:
				console.error('Invalid width mode:', mode); //eslint-disable-line no-console
				break;
		}
	};

	/**
	 * Updates visibility based on height mode
	 * @param {string} mode - Height mode value
	 */
	const _handleHeightMode = mode => {
		switch (mode) {
			case 'auto':
				api.updateVisibility('nodeHeight', false);
				api.updateVisibility('maxNodeHeight', false);
				break;
			case 'nodeHeight':
				api.updateVisibility('maxNodeHeight', false);
				api.updateVisibility('nodeHeight', true);
				break;
			case 'maxNodeHeight':
				api.updateVisibility('nodeHeight', false);
				api.updateVisibility('maxNodeHeight', true);
				break;
			default:
				console.error('Invalid height mode:', mode); //eslint-disable-line no-console
				break;
		}
	};

	/**
	 * Handle sizing mode changes by delegating to appropriate handler
	 * @param {string} trigger - The property trigger
	 */
	const _sizingModeChanged = trigger => {
		const choice = p[trigger];
		if (trigger === 'nodeWidthMode')
			_handleWidthMode(choice);
		else if (trigger === 'nodeHeightMode')
			_handleHeightMode(choice);

	};

	const _setNodeUIMode = () => {
		//Set fields according to whether the mode is SVG/Macroponent
		if (p.nodeMacroponent || p.clusterMacroponent)
			_setMacroponent();
		else
			console.error('Node Map require to have nodeMacroponent or clusterMacroponent');//eslint-disable-line no-console
	};

	/**
	 * Handle triggers using an action mapping object instead of a long switch statement
	 * @param {string} triggerName - Name of the trigger
	 */
	const _handleTrigger = triggerName => {
		const triggerActions = {
			nodeMacroponent: () => _setNodeUIMode(),
			clusterMacroponent: () => _setNodeUIMode(),
			nodeWidthMode: () => _sizingModeChanged(triggerName),
			nodeHeightMode: () => _sizingModeChanged(triggerName),
			disableMapContextMenu: () => api.updateEnabled('mapContextualActions', !p.disableMapContextMenu),
			disableNodesContextMenu: () => api.updateEnabled('contextualActions', !(p.disableNodesContextMenu && p.disableEdgesContextMenu)),
			disableEdgesContextMenu: () => api.updateEnabled('contextualActions', !(p.disableNodesContextMenu && p.disableEdgesContextMenu)),
			manageElementSelection() {
				api.updateVisibility('selectedElementId', p.manageElementSelection);
				api.updateVisibility('selectedElements', p.manageElementSelection);
			},
			edgeType: () => api.updateVisibility('edgesAggregation', p.edgeType === 'straight'),
			layout: () => _layoutChanged()
		};

		// Execute the action if it exists in our mapping
		if (triggerActions[triggerName])
			triggerActions[triggerName]();

	};

	// Initialize on load
	if (!trigger) { //onLoad actions
		_setNodeUIMode(); //Set default when UIB is loaded
		_layoutChanged();
		return; // Early return to avoid trigger handling
	}

	// Handle the trigger
	_handleTrigger(trigger);
}
