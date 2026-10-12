

/**
 * Set state parameter findIndices, Indexing all nodes and edges for the find.
 * @param mode - determine what index to build (nodes | edges), else if not define both
 * will be created
 * @private
 */
function handler({api, event, imports}) {
	/**
	 * @private
	 * @returns Set<ids> - return all hidden nodes
	 */
	const _getHiddenNodes = () => {
		const {hiddenNodeIds, ctx} = api.state; // Should be taken from state since there is logic that changes it
		const hiddenSet = new Set(hiddenNodeIds);
		for (const nodeId in ctx?.nestingPaths) {
			let hasHidden = false;
			ctx.nestingPaths[nodeId].forEach(id => {
				if (hasHidden)
					hiddenSet.add(id);
				else if (hiddenSet.has(id))
					hasHidden = true;
			})
		}
		return hiddenSet;
	};

	/**
	 * Indexing all nodes for the find.
	 * @private
	 * @returns {findTerm: [metadata]}
	 */
	const _getFindNodeIndex = () => {
		const TERM_SEPARATOR = '@#@';
		const {nodes} = api.context.props;
		const hiddenNodes = _getHiddenNodes();
		const nodeIndex = nodes.reduce((result, node) => {
			const {id, viewData = {}} = node;
			const {primaryLabel, secondaryLabel} = viewData;
			const pl = primaryLabel || '';
			const sl = secondaryLabel || '';
			const findTerm = `${pl.toLowerCase()}${TERM_SEPARATOR}${sl.toLowerCase()}`;

			if (!hiddenNodes.has(id) && findTerm) {
				if (!result[findTerm])
					result[findTerm] = [];

				result[findTerm].push(node);
			}
			return result;
		}, {});
		return nodeIndex;
	};


	/**
	 * Indexing all edges for the find.
	 * @private
	 * @returns {findTerm: [metadata]}
	 */
	const _getFindEdgeIndex = () => {
		const {edges, hiddenEdgeIds} = api.context.props;
		const hiddenEdges = new Set(hiddenEdgeIds);
		const hiddenNodes = _getHiddenNodes();
		const edgeIndex = edges.reduce((result, edge) => {
			const {id, label, sourceId, targetId} = edge;
			const st = label || '';
			const findTerm = `${st.toLowerCase()}`;

			// edge is hidden if it is hidden or it source/target node is hidden
			if (!hiddenEdges.has(id) && findTerm && !hiddenNodes.has(sourceId) && !hiddenNodes.has(targetId)) {
				if (!result[findTerm])
					result[findTerm] = [];

				result[findTerm].push(edge);
			}
			return result;
		}, {});
		return edgeIndex;
	};


	/**
	 * Indexing all nodes and edges for the find.
	 * @returns {Object} findIndices:
	 *	{
	 * 		nodes:{findTerm: [metadata]}
	 * 		edges:{findTerm: [metadata]}
	 * 	}
	 * @private
	 */
	const _getFindIndices = () => {
		const findIndices = {
			nodes: _getFindNodeIndex(),
			edges: _getFindEdgeIndex()
		};
		return findIndices;
	};

	const indices = _getFindIndices();
	api.setState('findIndices', indices);
}
