/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
	const { parseGroupTree, parseGeneralTree, addNewChild } =
		imports['global.Content Tree Utils']();
	const {
		props: { table, referenceTable, referenceField, dependentField }
	} = api.context;
	let nameSuffix = 'parent';
	let type = 'child';
	const name = `${referenceTable}.${nameSuffix}`;
	const {
		treePickerConfig: { processor, targetPath = '', targetValue, queryString },
		domainID
	} = api.data.tree_picker.treePicker;
	const reference = `${table}.${referenceField}`;
	const target =
		dependentField === ''
			? `${referenceTable}.undefined`
			: `${referenceTable}.${dependentField}`;

	const generateTargetPath = (index, targetPath) => {
		const path = [];
		for (let i = 0; i <= index; i++) path.push(targetPath[i]);
		return path;
	};

	function finalResponse({ api, response, targetPath, currentIndex }) {
		const xml = Object.values(response).join('');
		const treeJSON =
			referenceTable === 'sys_user_group'
				? parseGroupTree(xml)
				: parseGeneralTree(xml);
		const newTreeJSON = addNewChild(
			api.state.treeItems[0],
			generateTargetPath(currentIndex, targetPath),
			treeJSON
		);
		api.setState('loadingItems', []);
		api.setState('treeItems', [newTreeJSON]);
		api.setState('selectedItems', [targetPath]);
	}

	function getHttpPromise({
		api,
		helpers,
		targetPath,
		currentIndex,
		response
	}) {
		if (response) {
			const xml = Object.values(response).join('');
			const treeJSON =
				referenceTable === 'sys_user_group'
					? parseGroupTree(xml)
					: parseGeneralTree(xml);
			const newTreeJSON = addNewChild(
				api.state.treeItems[0],
				generateTargetPath(currentIndex - 1, targetPath),
				treeJSON
			);
			api.setState('treeItems', [newTreeJSON]);
		}
		api.setState('expandedItems', ({ api }) => [
			...api.state.expandedItems,
			generateTargetPath(currentIndex, targetPath)
		]);
		api.setState('loadingItems', [
			{
				path: generateTargetPath(currentIndex, targetPath),
				error: false
			}
		]);

		const params = {
		    sysparm_processor: processor,
		    method: 'getTreeNodes',
		    sysparm_name: name,
		    sysparm_type: type,
		    sysparm_chars: targetPath[currentIndex],
		    sysparm_reference: reference,
		    sysparm_target: target,
		    sysparm_dependent_value: targetValue,
		    sysparm_domain: domainID,
		    sysparm_query: queryString || undefined
		};
		helpers
			.snHttp(
				'/xmlhttp.do',
				{
					method: 'POST',
					batch: false,
					body: {},
					params: params,
					headers: {
						'X-WantSessionNotificationMessages': 'true',
						'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
					}
				}
			)
			.then(({ response }) => {
				const newIndex = currentIndex + 1;
				if (newIndex === targetPath.length)
					finalResponse({
						api,
						response,
						targetPath,
						currentIndex
					});
				else
					getHttpPromise({
						api,
						helpers,
						targetPath,
						currentIndex: newIndex,
						response
					});
			});
	}

	let value = [[]];
	if (targetPath) {
		value = targetPath.split(';').reduce((target, source) => {
			target.push(source.split(','));
			return target;
		}, []);
	}
	getHttpPromise({
		api,
		helpers,
		targetPath: value[0],
		currentIndex: 0
	});
}
