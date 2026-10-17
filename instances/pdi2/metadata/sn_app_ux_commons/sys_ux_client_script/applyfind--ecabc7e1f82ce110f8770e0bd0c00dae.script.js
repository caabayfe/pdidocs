

async function handler({api, event, helpers}) {
	const {props} = api.context;
	const {findIndices, ctx, mapData} = api.state;
	const {translate} = helpers;
	const termToFind = event.payload.term;
	const idToFind = event.payload.id; //The first visibleId
	const type = event.payload.type; //The element type node/edge

	const i18n = {
		NODES: await translate('Nodes'),
		EDGES: await translate('Edges')
	}

	/**
	 * Create an empty typeahead items structure with groups
	 * @param term - The find term to look for
	 * @param id - The first visibleId of specific element, that user had chosen
	 * @returns an empty typeahead structure
	 * @private
	 */
	const _getDataSkeleton = (term, id, type) => ({
		find: {term, id, type},
		suggestions: [{
			label: i18n.NODES,
			children: []
		}, {
			label: i18n.EDGES,
			children: []
		}],
		nodes: [],
		edges: []
	});

	if (!termToFind) {
		const findData = _getDataSkeleton(termToFind, idToFind, type); //Reset
		api.setState('findData', findData);
		return;
	}

	/**
	 * For a specific node gets its first visible(expanded) Group
	 * If all groups ae expanded then return just the id of itself
	 * @param ctx - The context of all data structures
	 * @param mapData - The map daa structures
	 * @param nodeId - The node id, that we check whether it is in collapsed groups
	 * @returns {string} - The deepest visible nodeId on the path way to the node
	 * @private
	 */
	const _getTopVisible = (ctx, mapData, nodeId) => {
		const expandedGroups = new Set(mapData.expandedGroupNodeIds);
		const paths = ctx.nestingPaths[nodeId];

		for (const pathNodeId of paths) {
			if (pathNodeId === nodeId)
				return pathNodeId; //Just return the id of the node itself

			const node = ctx.nodesIndex[pathNodeId];
			if (node.isGroup && !expandedGroups.has(pathNodeId))
				return pathNodeId; //Return the collapsed parent group
		}
	};

	/**
	 * Get/ Create a new suggestion for matched element (node/edge) in the find
	 * @param id - the element id
	 * @param label - the primary label
	 * @param sublabel - the secondary label
	 * @returns a new suggestion typeahead item
	 * @private
	 */
	const _getSuggestion = (id, label, sublabel) => {
		const item = {
			id,
			label: label || ''
		};

		if (sublabel)
			item.sublabel = sublabel;

		return item;
	};

	/**
	 * Iterate over all predefined nodes terms and look for a match.
	 * On top of it creates an array of possible suggestions that matched the find term
	 * @param edgesInCollapsedNodesMatches - List of collapsed groups which matched,
	 * because thy contains the desire edges
	 * @param ctx - The context of all data structures
	 * @param mapData - The map daa structures
	 * @param nodesTerms - predefined nodes terms
	 * @param termToFind - the string to look for - yield to idToFind property
	 * @param idToFind - the specific node id to look for
	 * @returns {{nodesMatched: any[], nodesSuggestions: []}}
	 * @private
	 */
	const _getNodesMatched = (edgesInCollapsedNodesMatches, ctx, mapData, nodesTerms, termToFind, idToFind) => {
		const matches = edgesInCollapsedNodesMatches; //Continue from existing Set
		const suggestions = [];
		for (const term in nodesTerms) {
			if (~term.indexOf(termToFind)) {
				nodesTerms[term].forEach(element => {
					const {id, viewData: {primaryLabel, secondaryLabel}} = element;
					const item = _getSuggestion(id, primaryLabel, secondaryLabel);
					const visibleId = _getTopVisible(ctx, mapData, id); //Get the first visible Id in case of grouping or just the id for simple node
					item.visibleId = visibleId; //Add for typeahead specific selection
					item.type = 'node';
					suggestions.push(item);
					matches.add(visibleId);
				});
			}
		}
		const nodesMatched = (idToFind && type === 'node') ? [_getTopVisible(ctx, mapData, idToFind)] : Array.from(matches);
		return {
			nodesMatched,
			nodesSuggestions: suggestions
		};
	};

	/**
	 * Iterate over all predefined edges terms and look for a match.
	 * On top of it creates an array of possible suggestions that matched the find term
	 * @param props - The original properties passed to the controller (all edges no filtering)
	 * @param ctx - The context of all data structures
	 * @param mapData - The map daa structures
	 * @param edgesTerms - predefined nodes terms
	 * @param idToFind - the specific edge id to look for
	 * @param termToFind - the string to look for
	 * @returns {{edgesSuggestions: [], edgesMatched: [], edgesInCollapsedNodesMatches<Set> }}
	 * @private
	 */
	const _getEdgesMatched = (props, ctx, mapData, edgesTerms, termToFind, idToFind) => {
		const edgesMatches = new Set(); //Set to avoid duplicates
		const edgesInCollapsedNodesMatches = new Set(); //Set to avoid duplicates used also later on in nodes
		const suggestions = [];
		const edgesMap = props.edges.reduce((result, edge) => {
			result[edge.id] = edge;
			return result;
		}, {});

		const _isEdgeInCollapsedNode = id => {
			return (ctx.edgesIndex[id]) ? true : false;
		}

		const _getEdgeVisibleId = (id, edgesMatches, edgesInCollapsedNodesMatches) => {
			let visibleId = '';
			if (_isEdgeInCollapsedNode(id)) {
				visibleId = ctx.edgesIndex[id].id; //Get the merge Id if exists or just the id for simple edge
				edgesMatches.add(visibleId);
			} else {
				//In case edges were removed due to collapsed groups
				//We need to find the deepest visible node on the path way to the edge
				const nodeId = edgesMap[id].sourceId;
				visibleId = _getTopVisible(ctx, mapData, nodeId); //Get the first visible Id in case of grouping or just the id for simple node
				edgesInCollapsedNodesMatches.add(visibleId);
			}
			return visibleId;
		}

		for (const term in edgesTerms) {
			if (~term.indexOf(termToFind)) {
				edgesTerms[term].forEach(element => {
					const {id, label} = element;
					const visibleId = _getEdgeVisibleId(id, edgesMatches, edgesInCollapsedNodesMatches);
					const item = _getSuggestion(id, label);
					item.type = 'edge';
					item.visibleId = visibleId; //Add for typeahead specific selection
					suggestions.push(item);
				});
			}
		}

		//If the user asked for a specific edge
		//then clear all containers and return only the specific matched
		//whether it is a regular edge or a collapsed node which contains the edge
		if (idToFind && type === 'edge') {
			edgesMatches.clear();
			edgesInCollapsedNodesMatches.clear();
			const visibleId = _getEdgeVisibleId(idToFind, edgesMatches, edgesInCollapsedNodesMatches);
		}

		const edgesMatched = Array.from(edgesMatches);
		return {
			edgesMatched,
			edgesSuggestions: suggestions,
			edgesInCollapsedNodesMatches
		};
	};

	const findData = _getDataSkeleton(termToFind, idToFind, type);

	//Edges
	const {edgesMatched, edgesSuggestions, edgesInCollapsedNodesMatches} = _getEdgesMatched(props, ctx, mapData, findIndices.edges, termToFind, idToFind);
	findData.edges = edgesMatched;
	findData.suggestions[1].children = edgesSuggestions;

	//Nodes
	const {nodesMatched, nodesSuggestions} = _getNodesMatched(edgesInCollapsedNodesMatches, ctx, mapData, findIndices.nodes, termToFind, idToFind);
	findData.nodes = nodesMatched;
	findData.suggestions[0].children = nodesSuggestions;

	api.setState('findData', findData);
}
