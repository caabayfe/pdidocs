
/**
 * This script include is used by the controller "Unified Map".
 * It implements a common flow for computing expanded group nodes.
 */
function include({imports}) {
	const ERROR_CODES = {
		//Empty group ${groupId} cannot expand.
		WARN_EMPTY_GROUP_CANNOT_EXPAND: 'WARN_EMPTY_GROUP_CANNOT_EXPAND',
		//Detected a loop in nesting of group nodes for the node ${nodeId}.
		ERR_GROUP_NESTING_LOOP: 'ERR_GROUP_NESTING_LOOP'
	};

	const _getItemId = item => item?.id || '';

	const _getParentGroupId = node => {
		const groupIds = node?.groupIds;
		return groupIds ? groupIds[0] : '';
	};

	const _getMergedEdgeId = (sourceId, targetId) =>
		`sn_node_map_unified_ctrl:merged_edge_${sourceId}_${targetId}`;


	/**
	 * Set all groups the groupCounter property which indicate the amount of their children.
	 * @private
	 * @param {{}} groups - map between groupId->to it's node
	 * @param {Number} groupsCounter - Indicate the amount of children per each group
	 */
	const _updateGroupsCounter = (groups, groupsCounter) => {
		for (let g in groups) {
			const group = groups[g]; //Get the real group node
			const groupCount = groupsCounter[group.id] || 0; //Get the amount of children for this group

			if (group.viewData)
				group.viewData.groupCount = groupCount;
			else
				group.viewData = {groupCount};
		}
	}

	/**
	 * Indexing all nodes and groupIds.
	 * @private
	 * @param {Array<Node>} nodes
	 * @returns {nodesIndex: {}, declaredGroups: Set<String>}
	 */
	const _buildNodesIndex = nodes => {
		const {nodesIndex, groups, groupsCounter, declaredGroups} = nodes.reduce((result, node) => {
			const {nodesIndex, groups, groupsCounter, declaredGroups} = result;
			nodesIndex[_getItemId(node)] = node;
			const parentGroupId = _getParentGroupId(node);
			if (parentGroupId) {
				groupsCounter[parentGroupId] = ++groupsCounter[parentGroupId] || 1;
				declaredGroups.add(parentGroupId);
			}

			if (node.isGroup)
				groups[node.id] = node;

			return result;
		}, {
			nodesIndex: {}, //hashtable nodeId -> node
			groups: {}, //map between groupId->to it's node
			groupsCounter: {}, //count how many children per each group
			declaredGroups: new Set() //IDs of group nodes that appear in any node as parent group.
		});

		_updateGroupsCounter(groups, groupsCounter);
		return {nodesIndex, declaredGroups};
	};

	/**
	 * Computes path of containing groups for the given node.
	 * @private
	 * @param {*} ctx
	 * @param {Node} node
	 * @returns {Array<String>} array of groupIds in which the given node is nested.
	 * Sorted from the topmost group down to the node.id always as the last array item.
	 */
	const _getNestingPath = (ctx, node) => {
		if (!node)
			return [];

		const {nestingPaths, nodesIndex} = ctx;
		const nodeId = _getItemId(node);
		const cachedPath = nestingPaths[nodeId];

		if (cachedPath)
			return cachedPath;

		//loops detection
		if (cachedPath === null) {
			//set error state, preserve the message from the first error detection.
			ctx.error = ctx.error || {code: ERROR_CODES.ERR_GROUP_NESTING_LOOP, nodeId};
			return null;
		}

		//loops detection: indicates that the path for the current nodeId is being calculated.
		nestingPaths[nodeId] = null;

		const groupId = _getParentGroupId(node);
		const parentGroup = nodesIndex[groupId];
		const subpath = _getNestingPath(ctx, parentGroup);

		if (ctx.error) {
			return null;
		}

		const path = [...subpath, nodeId];
		nestingPaths[nodeId] = path;

		return path;
	};

	/**
	 * An operand function for Array.find.
	 * `this` is expected to be and object containing {expandedGroupNodeIds, nodesIndex}
	 * @private
	 * @param {String} nodeId and id of any node (group or not).
	 * @returns {Boolean} true if the node with the given id is a collapsed group.
	 */
	const _isCollapsedGroup = function (nodeId) {
		const {expandedGroupNodeIds, nodesIndex} = this;
		const node = nodesIndex[nodeId];

		return node?.isGroup && !expandedGroupNodeIds.includes(nodeId);
	};

	/**
	 * Finds the groups containing the given node and being visible on the map.
	 * Namely, the first collapsed group on the nesting path of the node, starting from the top.
	 * @private
	 * @param {*} ctx
	 * @param {NodeMeta} node
	 * @returns {String|null} the id of the first collapsed group containing the given node.
	 * Returns `null` if no collapsed group found on the nesting path.
	 */
	const _findTopmostGroupId = (ctx, node) => {
		const {topmostGroupIds} = ctx;
		const nodeId = _getItemId(node);
		if (topmostGroupIds[nodeId])
			return topmostGroupIds[nodeId];

		const path = _getNestingPath(ctx, node);

		if (!path)
			return null;

		const topmostId = path.find(_isCollapsedGroup, ctx) || null;
		topmostGroupIds[nodeId] = topmostId === nodeId ? null : topmostId;
		return topmostGroupIds[nodeId];
	};

	/**
	 * Detects whether the given node is hidden behind a collapsed group.
	 * @private
	 * @param {*} ctx
	 * @param {Node} node
	 * @returns {Boolean} true if the node is behind a collapsed group
	 */
	const _fixNodeBehindCollapsedGroup = (ctx, node) => {
		const topmostGroupId = _findTopmostGroupId(ctx, node);
		if (topmostGroupId)
			return true;

		return false;
	};


	/**
	 * Array.map operand function.
	 * this=ctx
	 * @private
	 * @param {Node} node
	 * @returns {Node} a node representing the input node in the map view.
	 */
	const _getFixedNodePresentation = function (node) {
		const {nodesIndex, topmostGroupIds} = this;
		const nodeId = _getItemId(node);
		const grId = topmostGroupIds[nodeId];
		return nodesIndex[grId] || node;
	};

	/**
	 * Called on each edge that has to be modified before it can be part of the nodemap data.
	 * @param {{edgesIndex, mergedEdges}} ctx global context
	 * @param {Edge} edge current edge to process.
	 * @param {String} fixedSourceId id of the suggested source: the first visible container of the original source.
	 * @param {String} fixedTargetId id of the suggested target: the first visible container of the original target.
	 * @returns {Edge|null} a valid Edge object to replace the current edge with,
	 * or `null` to remove the current edge from the map data.
	 */
	const _modifyEdge = (ctx, edge, fixedSourceId, fixedTargetId) => {
		const {edgesIndex, mergedEdges} = ctx;

		//self-loop edges are removed.
		if (fixedSourceId === fixedTargetId)
			return null;

		//merging the edge
		const mergedEdgeId = _getMergedEdgeId(fixedSourceId, fixedTargetId);
		const existingMergedEdge = edgesIndex[mergedEdgeId];
		const mergedEdge = existingMergedEdge || {
			id: mergedEdgeId,
			sourceId: fixedSourceId,
			targetId: fixedTargetId,
			isMergedEdge: true,
			originalEdges: []
		};
		const {originalEdges} = mergedEdge;
		originalEdges.push(edge);

		//current edge was added to existing merging edge
		if (existingMergedEdge)
			return null;

		//created new merged edge
		edgesIndex[mergedEdgeId] = mergedEdge;
		mergedEdges.push(mergedEdge);
		return mergedEdge;
	};

	/**
	 * Operator function of map()
	 * Decide if the given edge should be merged.
	 * Adds the given original edge to a merged edge.
	 * Edges that resolve to a self-loop on a group node will be removed/skipped.
	 * Merging of nested and duplicate edges
	 * @private
	 * @param {{candidateMergeEdges, usedEdgeCandidates, nodesIndex, edgesIndex}} ctx
	 * @param {Edge} edge an original edge to merge in.
	 * @returns {Edge} the new merged edge if such was created.
	 * If the given original edge was skipped or merged into an existing merged edge, then `null` is returned.
	 */
	const _mergeEdge = (ctx, edge) => {
		const {candidateMergeEdges, usedEdgeCandidates, nodesIndex, edgesIndex} = ctx;
		const {sourceId, targetId} = edge;

		const [source, target] = [sourceId, targetId].map(id => nodesIndex[id]);
		const [fixedSource, fixedTarget] = [source, target].map(_getFixedNodePresentation, ctx);


		const [fixedSourceId, fixedTargetId] = [fixedSource, fixedTarget].map(_getItemId);
		const mergedEdgeId = _getMergedEdgeId(fixedSourceId, fixedTargetId);

		// Adding current edge to existing merged edge
		if (edgesIndex[mergedEdgeId])
			return _modifyEdge(ctx, edge, fixedSourceId, fixedTargetId);

		const duplicate = candidateMergeEdges[mergedEdgeId];
		// Merging current edge with duplicate
		if (duplicate) {
			usedEdgeCandidates.add(_getItemId(duplicate));
			const mergedEdge = _modifyEdge(ctx, duplicate, fixedSourceId, fixedTargetId);
			_modifyEdge(ctx, edge, fixedSourceId, fixedTargetId);
			return mergedEdge;
		}

		// Current edge is not Translated: saving as a candidate
		if (source === fixedSource && target === fixedTarget) {
			candidateMergeEdges[mergedEdgeId] = edge;
			return edge; //the edge is not affected, not merging
		}

		// Translated edge (source or target is changing)
		return _modifyEdge(ctx, edge, fixedSourceId, fixedTargetId);
	};

	/**
	 * Sub-routine of _indexEdge to add nested edges inside a merged edge to the index.
	 * `this` is expected to have {edgesIndex, mergedEdge}.
	 * @param {Edge} nestedEdge
	 */
	const _indexNestedEdge = function (nestedEdge) {
		const {edgesIndex, mergedEdge} = this;
		const nestedEdgeId = _getItemId(nestedEdge);
		edgesIndex[nestedEdgeId] = mergedEdge;
	};

	/**
	 * Adds the given edge to the edgesIndex.
	 * For merged edges adds each nested edgeId to also point to the merged edge object.
	 * @param {{edgesIndex}} ctx
	 * @param edge the given edge or null.
	 * @returns {Edge} the give edge or null.
	 */
	const _indexEdge = (ctx, edge) => {
		const {edgesIndex, usedEdgeCandidates} = ctx;
		const edgeId = _getItemId(edge);

		// Removing edges what have be merged
		if (!edge || usedEdgeCandidates.has(edgeId))
			return null;

		edgesIndex[edgeId] = edge;

		const {isMergedEdge, originalEdges} = edge;
		// Making sure original edge id, point to merged edge
		if (isMergedEdge)
			originalEdges.forEach(_indexNestedEdge, {edgesIndex, mergedEdge: edge});

		return edge;
	};

	/**
	 * Verifies for all groupIds in expandedGroupNodeIds that there are no empty expanded groups.
	 *
	 * @param {{}} args.nodesIndex
	 * @param {Array<String>} args.expandedGroupNodeIds
	 * @param {Set<String>} args.declaredGroups ids that were reffered as "groupIds" from any existing node.
	 * @returns {String|null} If any empty expanded group is detected, returning the id of that group and stopping.
	 * Otherwise returns `null`.
	 */
	const _detectEmptyExpandedGroups = ({nodesIndex, expandedGroupNodeIds, declaredGroups}) => {
		//find any groupId of an existing group node wich no children nodes
		const invalidGroupId = expandedGroupNodeIds.find(groupId =>
			(nodesIndex[groupId] && !declaredGroups.has(groupId))
		);
		return invalidGroupId || null;
	};

	/**
	 * Returning only parts of ctx that need to be cached on the controller.
	 * @param {*} ctx
	 * @returns
	 */
	const _getCtx = ctx => {
		const {
			nestingPaths,
			nodesIndex,
			declaredGroups,
			edgesIndex,
			mergedEdges,
			outHiddenEdgeIds,
			i18n
		} = ctx;
		return {
			nestingPaths,
			nodesIndex,
			declaredGroups,
			//`edgesIndex` is added to the cached `ctx` for the use of another feature in the controller (programmatic selection).
			//`edgesIndex` is discarded and built from scratch on each invocation of syncExpandedNodes()
			edgesIndex,
			mergedEdges,
			outHiddenEdgeIds,
			i18n
		};
	};

	/**
	 * Internal API of functions with the shared context.
	 * @param {Array<Node>} ctx.nodes
	 * @param {{}} ctx.nodesIndex
	 * @param {Array<String>} ctx.expandedGroupNodeIds
	 * @returns {Object}
	 */
	const utilsProvider = ctx => {
		const _ctx = {
			//cached ctx from the controller state
			...ctx,

			nestingPaths: {}, //caching nesting paths per node
			topmostGroupIds: {}, //caching topmost group per node

			/*
			 * ids of original map edges mapped to actual edges:
			 * - id of a translated edge points to the merged edge object.
			 * - id of a merged edge also points to the merged edge object.
			 */
			edgesIndex: {},

			//array of merged edges (only). Used for efficient iteration on change in hiddenEdgeIds.
			mergedEdges: [],
			candidateMergeEdges: {}, // mapping edges by source-target key to detect duplicates
			usedEdgeCandidates: new Set(), // keeping track of edges that were merged and should be removed from visibleEdges.

		};

		return {
			fixNodeBehindCollapsedGroup: node => _fixNodeBehindCollapsedGroup(_ctx, node),
			mergeEdge: edge => _mergeEdge(_ctx, edge),
			indexEdge: edge => _indexEdge(_ctx, edge),
			getCtx: () => _getCtx(_ctx),
			getError: () => (_ctx.error || null)
		};
	};

	/**
	 * Computes nodes and edges for the node-map, based on the input nodes, edges, and expandedGroupNodeIds.
	 * @param {Array<Node>} nodes
	 * @param {Array<Edge>} edges
	 * @param {Array<String>} expandedGroupNodeIds
	 * @param {*} ctx cached context object for optimized runs.
	 * @param {{}} i18n cached translated strings {key: value}
	 * @returns {{visibleNodes: Array<Node>, visibleEdges: Array<Edge>, ctx: {}, errorCode: String, ...}}
	 */
	const syncExpandedNodes = (nodes, edges, expandedGroupNodeIds, ctx, i18n) => {
		const {nodesIndex, declaredGroups} = ctx || _buildNodesIndex(nodes);

		const invalidGroupId = _detectEmptyExpandedGroups({nodesIndex, expandedGroupNodeIds, declaredGroups});
		if (invalidGroupId)
			return {
				errorCode: ERROR_CODES.WARN_EMPTY_GROUP_CANNOT_EXPAND,
				groupId: invalidGroupId
			};

		const {
			fixNodeBehindCollapsedGroup,
			mergeEdge,
			indexEdge,
			getCtx,
			getError
		} = utilsProvider({
			...(ctx || {}),
			i18n,
			nodes,
			nodesIndex,
			declaredGroups,
			expandedGroupNodeIds
		});

		//filtering out the non-visible nodes. May detect invalid input and set an error code.
		const visibleNodes = nodes.filter(node => !fixNodeBehindCollapsedGroup(node));
		const error = getError();

		if (error) {
			const {code, ...props} = error;
			return {
				errorCode: code,
				...props
			};
		}

		//transforming & merging the edges.
		const visibleEdges = edges.map(mergeEdge).filter(indexEdge);
		const cachedCtx = getCtx();

		return {visibleNodes, visibleEdges, ctx: cachedCtx};
	};

	/**
	 * Iterator function to filter visible (not hidden) edges among the original edges.
	 * Also removes the current edge from outHiddenEdgeIds.
	 * @param {Edge} edge current original edge to rocess.
	 * @param {Set<String>} this.inHiddenEdgeIds
	 * @returns {Boolean} true if current edge is NOT hidden.
	 */
	const _filterVisibleOriginalEdge = function (edge) {
		const {inHiddenEdgeIds} = this;
		return !inHiddenEdgeIds.has(edge.id);
	};

	/**
	 * This function iterates visibleEdges of a mergedEdge.
	 * If one of the visibleEdges' path contains a hidden Node then the entire merged edge should be hidden as well
	 * @param {object} ctx cached context.
	 * @param {Set<String>} hiddenNodeIds - contains all hidden nodes.
	 * @param {Set<String>} visibleEdges contains the list of edges merged into one
	 */
	const _hasMergedEdgeIncludesHiddenNode = (ctx, hiddenNodeIds, visibleEdges) => {
		//Iterate of all mergedEdge's edges
		for (let i = 0; i < visibleEdges.length; i++) {
			const {sourceId, targetId} = visibleEdges[i];
			const paths = [...ctx.nestingPaths[sourceId], ...ctx.nestingPaths[targetId]];

			let hasHidden = false;
			paths.forEach(node => {
				if (hiddenNodeIds.has(node)) {
					hasHidden = true;
					return true;
				}
			});

			if (hasHidden)
				return true;
		}
		return false;
	}

	/**
	 * Iterator function to process a single mergedEdge to update the info about the hidden edges.
	 * @param {Edge} mergedEdge current merged edge to update.
	 * @param {{object}} this.ctx cached context computed by syncExpandedNodes and stored on the controller state.
	 * @param {Set<String>} this.hiddenNodeIds contains the updated hidden nodes.
	 * @param {Set<String>} this.inHiddenEdgeIds from the controller in_prop.
	 * @param {Set<String>} this.outHiddenEdgeIds modified to contain out_prop.hiddenEdgeIds. Initialized with inHiddenEdgeIds.
	 */
	const _syncHiddenEdges = function (mergedEdge) {
		const {ctx, hiddenNodeIds, inHiddenEdgeIds, outHiddenEdgeIds} = this;

		const {originalEdges} = mergedEdge;
		const visibleEdges = (inHiddenEdgeIds.size === 0) ? originalEdges :
			originalEdges.filter(_filterVisibleOriginalEdge, {inHiddenEdgeIds});

		const visibleEdgesCount = visibleEdges.length;
		const hasHiddenNode = _hasMergedEdgeIncludesHiddenNode(ctx, hiddenNodeIds, visibleEdges);

		if (hasHiddenNode || visibleEdgesCount === 0) {
			outHiddenEdgeIds.add(mergedEdge.id);
			return;
		}

		const {i18n} = ctx;

		if (visibleEdgesCount === 1) {
			const {label, ariaLabel} = visibleEdges[0];
			mergedEdge.label = label || '';
			mergedEdge.ariaLabel = i18n['Translated edge {label}'].replace('$LABEL', ariaLabel || label || '');
		} else {
			//merged edge (multiple original edges)
			mergedEdge.label = String(visibleEdgesCount);
			mergedEdge.ariaLabel = i18n['Aggregation of {count} edges'].replace('$COUNT', visibleEdgesCount);
		}

	};

	/**
	 *
	 * @param {Array<String>} inHiddenNodeIds the updated hiddenNodes
	 * @param {Array<String>} hiddenEdgeIds from the controller in_prop.
	 * @param {{mergedEdges, i18n}} ctx cached context computed by syncExpandedNodes and stored on the controller state.
	 * @return {Array<String>} out.hiddenEdgeIds transformed with merged edges taken into account.
	 */
	const syncHiddenEdges = (inHiddenNodeIds, hiddenEdgeIds, ctx) => {
		const {mergedEdges} = ctx;

		const hiddenNodeIds = new Set(Array.isArray(inHiddenNodeIds) ? inHiddenNodeIds : []);

		const inHiddenEdgeIds = new Set(Array.isArray(hiddenEdgeIds) ? hiddenEdgeIds : []);
		const outHiddenEdgeIds = new Set(inHiddenEdgeIds);

		mergedEdges.forEach(_syncHiddenEdges, {ctx, hiddenNodeIds, inHiddenEdgeIds, outHiddenEdgeIds});

		ctx.outHiddenEdgeIds = outHiddenEdgeIds;
		return [...outHiddenEdgeIds.values()];
	};


	/**
	 *
	 * @param {{}} payload the event payload as arrived from the node-map event.
	 * @param {{outHiddenEdgeIds}} ctx current context from the controller state.
	 * @param {String} selectedId from `state.lastRequestedSelectionId`
	 * @returns {{}} modified event payload with resolved merged edge info, if applicable.
	 */
	const translateEventPayload = (payload, ctx, selectedId) => {
		const {edge, ...restPayload} = payload;
		if (!edge)
			return payload;

		const {isMergedEdge, originalEdges} = edge;

		if (!isMergedEdge)
			return payload;

		if (originalEdges.length === 1)
			return {
				...payload,
				edge: originalEdges[0]
			};

		const {outHiddenEdgeIds} = ctx;

		//check if a single originalEdge was selected programmatically
		const selectedEdge = originalEdges.find(edge => edge.id === selectedId);

		if (selectedEdge) {
			return {
				...payload,
				edge: selectedEdge
			};
		}

		const edges = (outHiddenEdgeIds.size === 0) ?
			originalEdges :
			originalEdges.filter(edge => !outHiddenEdgeIds.has(edge.id));

		return {
			edges,
			...restPayload
		};
	};

	//API
	return {
		syncExpandedNodes,
		syncHiddenEdges,
		translateEventPayload,
		ERROR_CODES
	};
}
