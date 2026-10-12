function include({ imports }, api, helpers) {
	const CONTENT_BLOCKS_STATE_VARIABLE = 'contentBlocks';
	const BLOCK_CONTEXT_STATE_VARIABLE = 'blockcontext';
	let CONTENT_BLOCKS = api.state.contentBlocks;
	let BLOCK_CONTEXT = api.state.blockcontext;
	let BLOCK_CONTEXT_PROMISE = [];
	let CONTENT_BLOCKS_PROMISE = [];
	const PAGE_PARAMS = api.state.pageParams;
	const DATA_BLOCK_TYPE_SYS_ID = 'a886aedfc3dde11044104fb9c840ddb7';
	let CONTROLLER_OUTPUT_CONTENT_BLOCKS = api.data.ace_default_controller_1.contentTree
	let CONTROLLER_OUTPUT_BLOCK_CONTEXT = api.data.ace_default_controller_1.blockContext

	/**
	 * Returns the content block tree from page state.
	 * @returns {Array} Content block tree
	 */
	const getContentBlocks = () => {
		if (CONTROLLER_OUTPUT_CONTENT_BLOCKS) {
				return Promise.all(CONTENT_BLOCKS_PROMISE).then((values) => {
					return Promise.resolve([...CONTROLLER_OUTPUT_CONTENT_BLOCKS]);
				});
		} else {
			return Promise.all(CONTENT_BLOCKS_PROMISE).then((values) => {
				return Promise.resolve([...CONTENT_BLOCKS]);
			});
		}
	}


	/**
	 * Sets the content block state variable with the newContentBlocks param.
	 * @param {Array} newContentBlocks
	 */
	const setContentBlocks = (newContentBlocks, pageTemplateType) => {
		if (CONTROLLER_OUTPUT_CONTENT_BLOCKS || pageTemplateType == 'v3' ) {
			Promise.all(CONTENT_BLOCKS_PROMISE).then((values) => {
				CONTENT_BLOCKS_PROMISE = [new Promise((resolve, reject) => {
					let newContentTree = [...newContentBlocks];
				    updateBlockContextAndContentTree(newContentTree);
					CONTROLLER_OUTPUT_CONTENT_BLOCKS = newContentTree;
					resolve();
				})];
			});
		} else {
			Promise.all(CONTENT_BLOCKS_PROMISE).then((values) => {
				CONTENT_BLOCKS_PROMISE = [new Promise((resolve, reject) => {
					api.setState(CONTENT_BLOCKS_STATE_VARIABLE,
						({
							currentValue
						}) => {
							CONTENT_BLOCKS = [...newContentBlocks];
							resolve();
							return CONTENT_BLOCKS;
						});
				})];
			});

		}


	}

	/**
	 * Returns current block context.
	 * @returns {Object} Current block context.
	 */
	const getContext = () => {
		if (CONTROLLER_OUTPUT_BLOCK_CONTEXT) {
			return Promise.all(BLOCK_CONTEXT_PROMISE).then((values) => {
				return Promise.resolve(CONTROLLER_OUTPUT_BLOCK_CONTEXT);
			});
		}
		return Promise.all(BLOCK_CONTEXT_PROMISE).then((values) => {
			return Promise.resolve(BLOCK_CONTEXT);
		});
	}

	/**
	 * Sets the page level blockcontext with supplied newBlockContext param.
	 * @param {Object} newBlockContext
	 */
	const setContext = (newBlockContext, pageTemplateType) => {
		if (CONTROLLER_OUTPUT_BLOCK_CONTEXT || pageTemplateType == 'v3') {
			Promise.all(BLOCK_CONTEXT_PROMISE).then((values) => {
				BLOCK_CONTEXT_PROMISE = [new Promise((resolve, reject) => {
					var newContext = {
						...CONTROLLER_OUTPUT_BLOCK_CONTEXT,
						...newBlockContext
					};
					updateBlockContextAndContentTree(null, {
						...newContext
					});
					CONTROLLER_OUTPUT_BLOCK_CONTEXT = { ...newContext };
					resolve();
				})];
			});

		} else {
			Promise.all(BLOCK_CONTEXT_PROMISE).then((values) => {
				BLOCK_CONTEXT_PROMISE = [new Promise((resolve, reject) => {
					api.setState(BLOCK_CONTEXT_STATE_VARIABLE, ({
						currentValue
					}) => {
						BLOCK_CONTEXT = {
							...currentValue,
							...newBlockContext
						};
						resolve();
						return BLOCK_CONTEXT;
					});
				})];
			});
		}


	}

	/**
	 * Finds the content block with the given elementId in the content tree.
	 * @param {String} blockElementId
	 * @param {Array} contentBlocks
	 * @returns {Object} Content block object if found, null otherwise.
	 */
	const getBlock = async (blockElementId, contentBlocks) => {
		if (!contentBlocks) {
			contentBlocks = await getContentBlocks();
		}

		// Find the block with the given elementId
		function findBlock(block) {
			if (block.elementId === blockElementId) {
				return block;
			}

			for (let child of block.children) {
				let result = findBlock(child);
				if (result) {
					return result;
				}
			}

			return null;
		}

		// Call findBlock on each block in the content block array
		for (let block of contentBlocks) {
			let result = findBlock(block);
			if (result) {
				return result;
			}
		}

		// If no block was found, return null
		return null;
	}

	/**
	 * Finds the content block with the given elementId in the content tree and returns its parent block.
	 * @param {String} childBlockElementId
	 * @param {Array} contentBlocks
	 * @returns {Object} Parent block of the block with the given elementId if found, null otherwise.
	 */
	const getParentBlock = async (childBlockElementId, contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();

		// Find the parent block of the block with the given element id
		function findParent(block) {
			if (block.elementId === childBlockElementId && !block.isRoot) {
				return true;
			}

			for (let child of block.children) {
				let result = findParent(child);
				if (result) {
					return block;
				}
			}

			return null;
		}

		// Call findParent on each block in the content blocks array
		for (let block of contentBlocks) {
			let result = findParent(block);
			if (result) {
				return result;
			}
		}

		return null;
	}

	/**
	 * Finds the index of block with given elementId in various tree levels. If found, replaces it with
	 * the given updatedBlockData.
	 * @param {String} blockElementId
	 * @param {Object} updatedBlockData
	 * @param {Array} contentBlocks
	 * @returns {Array} Updated content block tree after replacing the given block with new data.
	 */
	const updateContentBlock = async (blockElementId, updatedBlockData,
									  contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();
		const contentBlocksCopy = [...contentBlocks];
		const indexOfContentBlock = contentBlocksCopy.findIndex(contentBlock => {
			if (contentBlock.elementId === blockElementId) {
				return true;
			}

			if (contentBlock.children && contentBlock.children.length) {
				updateContentBlock(blockElementId, updatedBlockData, contentBlock.children).then(response => {
					contentBlock.children = response;
				});
			}
		});

		// Found the content block in the current tree level, replace with new data.
		if (indexOfContentBlock > -1) {
			contentBlocksCopy[indexOfContentBlock] = {
				...contentBlocksCopy[indexOfContentBlock],
				...updatedBlockData
			};
		}

		return contentBlocksCopy;
	}

	/**
	 * Removes the content block with the given elementId from the content tree.
	 * @param {String} blockElementId
	 * @param {Array} contentBlocks
	 * @returns {Array} Updated content tree with the removed content block.
	 */
	const removeContentBlock = async (blockElementId, contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();
		const contentBlocksCopy = [...contentBlocks];
		const indexOfContentBlock = contentBlocksCopy.findIndex(contentBlock => {
			if (contentBlock.elementId === blockElementId) {
				return true;
			}

			if (contentBlock.children && contentBlock.children.length) {
				removeContentBlock(blockElementId, contentBlock.children).then(output => {
					contentBlock.children = output;
				})
			}
		});

		if (indexOfContentBlock > -1) {
			contentBlocksCopy.splice(indexOfContentBlock, 1);
		}

		return contentBlocksCopy;
	}

	/**
	 * Shows the content block with the given elementId.
	 * @param {String} blockElementId
	 * @param {boolean} hideBlock
	 * @param {Array} contentBlocks
	 * @returns {Array} Content block tree with the given block shown.
	 */
	const showContentBlock = async (blockElementId, contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();
		return updateContentBlock(blockElementId, { visibility: true }, contentBlocks);
	}

	/**
	 * Hides the content block with the given elementId.
	 * @param {String} blockElementId
	 * @param {boolean} hideBlock
	 * @param {Array} contentBlocks
	 * @returns {Array} Content block tree with the given block hidden.
	 */
	const hideContentBlock = async (blockElementId, contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();
		return updateContentBlock(blockElementId, { visibility: false }, contentBlocks);
	}

	/**
	 * Add a new content block inside the block with the given parentBlockElementId.
	 * If parentBlockElementId is null then place the block at the root level of the content tree.
	 * @param {Object} blockData
	 * @param {String} parentBlockElementId
	 * @param {Integer} placementPosition
	 * @param {Array} contentBlocks
	 * @returns {Array}
	 */
	const addContentBlock = async (blockData, parentBlockElementId = null, placementPosition,
								   contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();
		const contentBlocksCopy = [...contentBlocks];
		if (parentBlockElementId) {
			const indexOfContentBlock = contentBlocksCopy.findIndex(contentBlock => {
				if (contentBlock.elementId === parentBlockElementId) {
					return true;
				}

				if (contentBlock.children && contentBlock.children.length) {
					addContentBlock(blockData, parentBlockElementId, placementPosition, contentBlock.children).then(response => {
						contentBlock.children = response;
					});
				}
			});

			if (indexOfContentBlock > -1) {
				const parentBlockChildrenArray = [...contentBlocksCopy[indexOfContentBlock].children];
				parentBlockChildrenArray.splice(placementPosition ? placementPosition : parentBlockChildrenArray.length, 0, blockData);
				contentBlocksCopy[indexOfContentBlock].children = parentBlockChildrenArray;
			}
		} else {
			contentBlocksCopy.splice(placementPosition, 0, blockData);
		}

		return contentBlocksCopy;
	}

	/**
	 * Moves a content block from the current position to the children of the specified parent element.
	 * In case the parent id is null, moves the content block to root level.
	 * @param {String} blockElementId
	 * @param {String} parentBlockElementId
	 * @param {Integer} placementPositionInNewParent
	 * @param {Array} contentBlocks
	 * @returns {Array}
	 */
	const moveContentBlock = async (blockElementId, parentBlockElementId, placementPositionInNewParent,
									contentBlocks) => {
		if(!contentBlocks) contentBlocks = await getContentBlocks();
		const blockData = await getBlock(blockElementId, contentBlocks)
		const updatedContentBlock = await removeContentBlock(blockElementId, contentBlocks)
		return addContentBlock(blockData, parentBlockElementId, placementPositionInNewParent, updatedContentBlock);
	}

	const getModalContainers = (contentBlocks) => {
		if (!contentBlocks || contentBlocks.length == 0) {
			return [];
		}
		let modals = [];
		contentBlocks.forEach(contentBlock => {
			if (contentBlock.type.route == 'modal-container') {
				modals.push(contentBlock);
			}
			modals = modals.concat(getModalContainers(contentBlock.children));
		})
		return modals;
	}

	const getGUID = () => {
		return 'xxxx-xxxx-yyyyyy-xxxx-yyyyxxyy'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	const getModalBlock = (modalContentBlock) => {
		const tempBlockId = getGUID();
		const tempId = getGUID();
		let modalReadOutTitle = modalContentBlock?.label || modalContentBlock?.title
		try{
		if (typeof modalContentBlock?.children[0]?.props_details?.component_properties  == 'string') {
			modalReadOutTitle = JSON.parse(modalContentBlock?.children[0]?.props_details?.component_properties).label || modalReadOutTitle;
		}
		} catch (e) {
		console.log("failed in JSON parse", e)
		}

		const modalSize = modalContentBlock.props_details.modal_size || 'md';
		const disableClose = modalContentBlock.props_details.disable_close || false;
		const elementId = modalContentBlock.elementId;
		return  {
			"block_id": tempBlockId,
			"id": tempId,
			"active": true,
			"name": "ModalBlock",
			"props_details": {
				"component_name": "now-modal",
				"elementId": elementId,
				"component_properties": {
					"modal_id":modalContentBlock.block_id,
					"elementId":modalContentBlock.elementId,
					"size": modalSize,
					"component-id": getGUID(),
					"opened": "${blockcontext.modalOpened}",
					"disableClose": disableClose,
					"configAria":
					{
						"dialog": {
							"role": "dialog",
							"aria-modal": "true",
							"aria-label": modalReadOutTitle
						}
					}
				},
				"events_data": {
					"NOW_MODAL#OPENED_SET": {
						"handler": {
							"name": "DISPATCH_EVENT",
							"eventName": "ACE_MODAL_CLOSED",
							"nowrap": true
                        }
                    }
                }
			},
			"type": {
				"route": "ace-control"
			},
			"children": modalContentBlock.children || []
		}
	}

	const openModal = async(modalId) => {
		var context = await getContext();
		setContext( {
			...context,
			modalOpened: true
		});
		var contents = await getContentBlocks();
		contents = contents.filter((contentItem) => contentItem.props_details.component_name != "now-modal");
		const modalContainers = getModalContainers(contents);
		let definedModalContentBlock = modalContainers.filter((contentItem) => contentItem.elementId == modalId);
		definedModalContentBlock = definedModalContentBlock && definedModalContentBlock.length > 0 ? definedModalContentBlock[0] : {};
		const updatedModalBlock = getModalBlock(definedModalContentBlock);
		contents.push(updatedModalBlock);
		setContentBlocks(contents);
	}

	const dismissModal = async(modalId) => {
		var context = await getContext();
		setContext(  {
			...context,
			modalOpened: false
		});
		let contents = await getContentBlocks();
		contents = contents.filter((contentItem) => !(contentItem.props_details.component_name == "now-modal" && contentItem.props_details.elementId == modalId));
		setContentBlocks(contents);
	}


	const refreshPage = (blockContext, contentBlocks) => {
		if (CONTROLLER_OUTPUT_BLOCK_CONTEXT || CONTROLLER_OUTPUT_CONTENT_BLOCKS ) {
			CONTROLLER_OUTPUT_BLOCK_CONTEXT = blockContext;
			CONTROLLER_OUTPUT_CONTENT_BLOCKS = contentBlocks;
			updateBlockContextAndContentTree(contentBlocks, {...blockContext});
		} else {
			let payload = {};
			blockContext && (payload[BLOCK_CONTEXT_STATE_VARIABLE] = blockContext);
			contentBlocks && (payload[CONTENT_BLOCKS_STATE_VARIABLE] = contentBlocks);
			api.emit('ACE_PAGE_READY', payload)
		}
	}

	/**
	 * Refreshes the block with the given blockElementId. Also refreshes the child blocks if refreshChildBlocks is true.
	 * The newly refreshed content blocks are then appended at the right position within the content tree.
	 *
	 * Based on the configuration of a block, lazy script will take precedence over post script.
	 * @param {string} blockElementId - Element id of the block that needs to be refreshed.
	 * @param {boolean} shouldRefreshChildBlocks - Boolean indicating whether the child blocks should be refreshed too.
	 */
	const refreshContentBlock = async function(blockElementId, shouldRefreshChildBlocks) {
		const contentBlocks = await getContentBlocks();
		if (blockElementId && contentBlocks.length) {
			const REFRESH_BLOCK_API_URL = '/api/now/ace/refresh_block';
			const context = await getContext();
			const blockData = await getBlock(blockElementId, contentBlocks);
			return await helpers.snHttp(REFRESH_BLOCK_API_URL, {
				method: 'POST',
				body: {
					blockElementId,
					shouldRefreshChildBlocks,
					cbScriptVariables: {
						pageParams: PAGE_PARAMS,
						blockcontext: context
					},
					blockData
				}
			}).then(async ({response}) => {
				const {
					refreshedBlock
				} = response.result;
				if (refreshedBlock && refreshedBlock.type && refreshedBlock.type.id === DATA_BLOCK_TYPE_SYS_ID) {
					const blockcontext = await getContext();
					const context = getUpdatedContextPostDataBlockOutputMapping(refreshedBlock, blockcontext);
					setContext(context);
				}
				return refreshedBlock;
			}).catch(error => {
				console.log(error);
			})
		}
	}

	const getUpdatedContextPostDataBlockOutputMapping = (dataBlock, blockContext) => {

		let context = { ...blockContext};

		let outputMap = dataBlock.props_details.output_map;
		try {
			outputMap = typeof outputMap === 'string' && JSON.parse(outputMap);
			Object.keys(outputMap).forEach(key => {
				const contextPath = key.split('.');
				const dataBlockOutputPath = outputMap[key].split('.');
				let dataBlockOutput = dataBlock.props_details.data_block_output;
				if (dataBlockOutputPath[0] === 'output') {
					// Calculate output variable value
					dataBlockOutputPath.shift();
					dataBlockOutputPath.forEach(path => dataBlockOutput = dataBlockOutput && dataBlockOutput[path]);
					// Calculate context variable to which we want to add the value to.
					let localContext = {...context};
					function updateContext(object, newValue, path){
						let stack = path.split('.');
						while (stack.length > 1) {
							if (object.hasOwnProperty(stack[0])) {
								object = object[stack.shift()];
							} else {
								break;
							}
						}
						if (object.hasOwnProperty(stack[0])) {
							object[stack.shift()] = newValue;
						}
					}
					updateContext(localContext, dataBlockOutput, key);
					context = {...localContext};
				}
			});
		} catch (e) {
			console.log("Error in parsing data block output map: " + e.toString());
		}
		return context;
	}
	const addDataBlockOutputMappingToContext = (contentBlocks, blockContext, pageTemplateType) => {
		const dataBlocks = contentBlocks.filter(block => block.type.id === DATA_BLOCK_TYPE_SYS_ID && block.props_details.evaluation_mode === 'eager');
		let context = {...blockContext};
		dataBlocks.forEach(dataBlock => {
			context = getUpdatedContextPostDataBlockOutputMapping(dataBlock, context);
		});
		setContext({...context}, pageTemplateType);
		return context;
	}

	const updateBlockContextAndContentTree = (contentBlocks, blockContext) => {
		api.emit('ACE_CONTROLLER_UPDATED', {
			eventName: 'ACE_PAGE_CONTENT_UPDATED',
			eventPayload: {
				blockContext: blockContext,
				contentTree: contentBlocks
			}
		});
	}

	return {
		getContentBlocks,
		setContentBlocks,
		getContext,
		setContext,
		getBlock,
		getParentBlock,
		updateContentBlock,
		removeContentBlock,
		addContentBlock,
		showContentBlock,
		hideContentBlock,
		moveContentBlock,
		openModal,
		dismissModal,
		refreshPage,
		refreshContentBlock,
		addDataBlockOutputMappingToContext
	}
}
