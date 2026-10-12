function include() {
	const generateAction = async function (decorations, helpers) {
		if (decorations.length === 0) {
			return [];
		}

		const tooltipMap = {
			incident: {
				labelPlural: await helpers.translate('Incidents'),
				label: await helpers.translate('Incident')
			},
			problem: {
				labelPlural: await helpers.translate('Problems'),
				label: await helpers.translate('Problem')
			},
			change_request: {
				labelPlural: await helpers.translate('Changes'),
				label: await helpers.translate('Change')
			},
			outages_past: {
				labelPlural: await helpers.translate('recently closed outages'),
				label: await helpers.translate('recently closed outage')
			},
			outages_current: {
				labelPlural: helpers.translate('current opened outages'),
				label: helpers.translate('current opened outage')
			},
			outages_planned: {
				labelPlural: await helpers.translate('planned outages'),
				label: await helpers.translate('planned outage')
			},
			changes_past: {
				labelPlural: await helpers.translate('recently closed changes'),
				label: await helpers.translate('recently closed change')
			},
			changes_current: {
				labelPlural: await helpers.translate('current opened changes'),
				label: await helpers.translate('current opened change')
			},
			changes_planned: {
				labelPlural: await helpers.translate('planned changes'),
				label: await helpers.translate('planned change')
			}
		};
		const tooltip = await Promise.all(
			decorations.map(async item => {
				let value = item.value;
				if (value > 1) {
					return await helpers.translate(
						'There are {0} {1}',
						value,
						tooltipMap[item.name]['labelPlural']
					);
				} else {
					return await helpers.translate(
						'There is {0} {1}',
						value,
						tooltipMap[item.name]['label']
					);
				}
			})
		);

		return [{ icon: 'info-circle-outline', label: JSON.stringify(tooltip) }];
	};
	const parseGroupTree = function (xml, parent) {
		var nodes = [];
		const rxml = new DOMParser().parseFromString(xml, 'text/xml');
		var items = rxml.getElementsByTagName('item');
		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			let node = {
				id: item.getAttribute('name'),
				label: item.getAttribute('label'),
				class: item.getAttribute('sys_class_name'),
				children: [],
				childrenAvailable: Number(
					item.getAttribute('sys_class_name') === 'sys_user_group'
				)
			};
			if (parent && item.getAttribute('sys_class_name') === 'sys_user')
				node = {
					...node,
					parentId: parent.id,
					parentLabel: parent.label
				};
			nodes.push(node);
		}
		return nodes;
	};
	const parseGeneralTree = function (xml) {
		var nodes = [];
		const rxml = new DOMParser().parseFromString(xml, 'text/xml');
		var items = rxml.getElementsByTagName('item');
		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			const node = {
				id: item.getAttribute('name'),
				label: item.getAttribute('label') || item.getAttribute('display_value'),
				class: item.getAttribute('sys_class_name'),
				children: [],
				childrenAvailable: item.getAttribute('children')
					? item.getAttribute('children') === 'false'
						? 0
						: 1
					: 1
			};
			nodes.push(node);
		}
		return nodes;
	};

	const getTargetField = function (referenceTable, targetValue, dependentField){
		if(referenceTable === "sys_user_group") return `${targetValue}.undefined`;
		if(dependentField) return `${targetValue}.${dependentField}`;			
		return null;
	};

	const addNewChild = function (items, path, newChild) {
		let currIndex = 0;
		let tempItems = items;
		path.forEach(id => {
			const index = tempItems.findIndex(item => item.id === path[currIndex]);

			if (currIndex === path.length - 1) tempItems = tempItems[index];
			else tempItems = tempItems[index].children;
			currIndex += 1;
		});
		if (newChild.length != 0) {
			tempItems.children = newChild;
			tempItems.childrenAvailable = 1;
		} else {
			tempItems.childrenAvailable = 0;
		}

		return items;
	};
	const parseCITree = async function (xml, path = [], root, helpers) {
		let nodes = [[], []];
		const rxml = new DOMParser().parseFromString(xml, 'text/xml');
		var relTypes = rxml.getElementsByTagName('cmdb_rel_type');
		for (let relTypeIndex = 0; relTypeIndex < relTypes.length; relTypeIndex++) {
			let relType = relTypes[relTypeIndex];
			var temp = relType.getAttribute('type');
			let ciTypes = relType.getElementsByTagName('ci_type');

			if (temp !== 'child' && temp !== 'parent') {
				continue;
			}

			let nodeType = temp === 'child' ? nodes[0] : nodes[1];
			for (let ciTypeIndex = 0; ciTypeIndex < ciTypes.length; ciTypeIndex++) {
				let ciType = ciTypes[ciTypeIndex];
				let items = ciType.getElementsByTagName('cmdb_ci');
				for (let ciIndex = 0; ciIndex < items.length; ciIndex++) {
					let item = items[ciIndex];
					if (item.getAttribute('nested_level') !== '0') continue;

					let childrenAvailable = item.getAttribute('children') === '0' ? 0 : 1;
					let sysID = item.getAttribute('sys_id');
					if (sysID === root || (path && path.indexOf(sysID) > -1)) {
						childrenAvailable = 0;
					}

					const node = {
						id: sysID,
						label: item.getAttribute('display_value'),
						class: ciType.getAttribute('name'),
						childrenAvailable,
						actions: await generateAction(
							[
								{ name: 'incident', value: item.getAttribute('incident') },
								{ name: 'problem', value: item.getAttribute('problem') },
								{
									name: 'change_request',
									value: item.getAttribute('change_request')
								},
								{
									name: 'outages_past',
									value: item.getAttribute('outages_past')
								},
								{
									name: 'outages_current',
									value: item.getAttribute('outages_current')
								},
								{
									name: 'outages_planned',
									value: item.getAttribute('outages_planned')
								},
								{
									name: 'changes_past',
									value: item.getAttribute('changes_past')
								},
								{
									name: 'changes_current',
									value: item.getAttribute('changes_current')
								},
								{
									name: 'changes_planned',
									value: item.getAttribute('changes_planned')
								}
							].filter(item => item.value > 0),
							helpers
						),
						relType: temp
					};
					nodeType.push(node);
				}
			}
		}
		return nodes;
	};
	const generateTargetPath = function (index, targetPath) {
		const path = [];
		for (let i = 0; i <= index; i++) path.push(targetPath[i]);
		return path;
	};
	return {
		parseGroupTree,
		parseGeneralTree,
		addNewChild,
		parseCITree,
		generateTargetPath,
		getTargetField
	};
}
