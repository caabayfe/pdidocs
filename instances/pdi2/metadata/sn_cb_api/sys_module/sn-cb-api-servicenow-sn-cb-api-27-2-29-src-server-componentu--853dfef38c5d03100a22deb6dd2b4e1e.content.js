// eslint-disable-next-line import/no-unresolved
import {GlideRecordSecure} from '@servicenow/glide';

import {
	SYS_UX_APP_ROUTE,
	SYS_UX_PAGE_REGISTRY,
	SYS_UX_SCREEN,
	SYS_CB_METADATA,
} from './constants/models/index.js';

export class ComponentUsage {
	constructor() {}
	getRootComponents() {
		const rootMacroponents = new Set();
		const rootGr = new GlideRecordSecure(SYS_UX_PAGE_REGISTRY.TABLE_NAME);
		rootGr.addQuery('admin_panel_table', 'sys_ux_app_config');
		rootGr.query();
		while (rootGr.next()) {
			const rmp = rootGr.getValue('root_macroponent');
			rootMacroponents.add(rmp);
		}
		return [...rootMacroponents];
	}
	getScreenGr(targetId, offset, limit, additionalQuery) {
		const screenGr = new GlideRecordSecure(SYS_UX_SCREEN.TABLE_NAME);
		screenGr.addEncodedQuery(`macroponent.compositionLIKE${targetId}`);
		screenGr.addActiveQuery();
		if (additionalQuery) {
			screenGr.addEncodedQuery(additionalQuery);
		}
		screenGr.chooseWindow(offset, limit);
		return screenGr;
	}

	getComponentMetadataGr(targetId, offset, limit) {
		const componentMetadata = new GlideRecordSecure(SYS_CB_METADATA.TABLE_NAME);
		componentMetadata.addEncodedQuery(`macroponent.compositionLIKE${targetId}`);
		componentMetadata.chooseWindow(offset, limit);
		return componentMetadata;
	}

	getParentScreen(screenType, rootMcps) {
		const screenGr = new GlideRecordSecure(SYS_UX_SCREEN.TABLE_NAME);
		screenGr.addQuery('macroponent', screenType);
		screenGr.query();
		while (screenGr.next()) {
			const parent = screenGr.getValue('parent_macroponent');
			if (rootMcps.includes(parent.toString())) return screenGr;
			return this.getParentScreen(parent, rootMcps);
		}
	}
	getPagePayload(page, totalRecords) {
		const appId = page.getValue('app_config');
		const experienceValues = this.getExperienceValues(appId);
		const experienceLabel = experienceValues?.experienceLabel ?? '';
		const pageObj = {
			pageLabel: page.getDisplayValue('screen_type'),
			variantLabel: page.getValue('name'),
			experienceLabel,
			totalRecords,
		};
		return pageObj;
	}
	getPageDetails(targetId, offset, limit) {
		const pageDetailsArr = [];
		let appConfigId;
		const rootMcps = this.getRootComponents();
		const page = this.getScreenGr(
			targetId,
			offset,
			limit,
			'app_config!=NULL^screen_type!=NULL'
		);
		page.query();
		const totalRecords = page.getRowCount();
		while (page.next()) {
			const parentMcp = page.getValue('parent_macroponent');
			const appId = page.getValue('app_config');
			const experienceId = this.getExperienceValues(appId)?.experienceId ?? '';
			let pageObj = this.getPagePayload(page, totalRecords);
			if (parentMcp == null || rootMcps.includes(parentMcp)) {
				appConfigId = this.getAppRouteId(
					page.getValue('screen_type'),
					appId,
					rootMcps
				);
				if (appConfigId)
					pageObj = {
						...pageObj,
						link: this.getLink(
							'experience',
							experienceId,
							appConfigId,
							page.getUniqueValue()
						),
					};
			} else {
				const parentScreen = this.getParentScreen(parentMcp, rootMcps);
				if (parentScreen) {
					appConfigId = this.getAppRouteId(
						parentScreen.getValue('screen_type'),
						appId,

						rootMcps
					);
					if (appConfigId)
						pageObj = {
							...pageObj,
							link: this.getLink(
								'experience',
								experienceId,
								appConfigId,
								parentScreen.getUniqueValue()
							),
						};
				}
			}

			pageDetailsArr.push(pageObj);
		}
		return pageDetailsArr;
	}

	getComponentDetails(targetId, offset, limit) {
		const componentDetailsArr = [];
		const componentMetadata = this.getComponentMetadataGr(
			targetId,
			offset,
			limit
		);

		componentMetadata.query();
		const totalRecords = componentMetadata.getRowCount();

		while (componentMetadata.next()) {
			const macroponentRecord = componentMetadata.macroponent.getRefRecord();
			const metadataId = componentMetadata.getValue('sys_id');
			const componentName = macroponentRecord.getValue('name');
			const componentLink = `/now/builder/ui/component/${metadataId}`;

			componentDetailsArr.push({
				componentName,
				componentLink,
				totalRecords,
			});
		}

		return componentDetailsArr;
	}

	getLink(mode, experienceId, appRouteId, pageId) {
		return `/now/builder/ui/edit/${mode}/${experienceId}/${appRouteId}/${pageId}`;
	}
	getPageCollAppRoute(screenId, appId) {
		const routeGr = new GlideRecordSecure(SYS_UX_APP_ROUTE.TABLE_NAME);
		routeGr.addQuery('screen_type', screenId);
		routeGr.addQuery('app_config', appId);
		routeGr.addEncodedQuery('extension_point!=NULL');
		routeGr.query();
		if (routeGr.next()) return routeGr.getUniqueValue();
	}
	getAppRouteId(screenId, appId, rootMcps) {
		const routeGr = new GlideRecordSecure(SYS_UX_APP_ROUTE.TABLE_NAME);
		routeGr.addQuery('screen_type', screenId);
		routeGr.addQuery('app_config', appId);
		routeGr.addEncodedQuery('extension_point=NULL');
		const qc = routeGr.addQuery('parent_macroponent', 'IN', rootMcps.join(','));
		qc.addOrCondition('parent_macroponent', null);
		routeGr.query();
		if (routeGr.next()) return routeGr.getUniqueValue();
	}

	getExperienceValues(appId) {
		const experienceGr = new GlideRecordSecure(SYS_UX_PAGE_REGISTRY.TABLE_NAME);
		experienceGr.addQuery('admin_panel', appId);
		experienceGr.query();
		if (experienceGr.next())
			return {
				experienceId: experienceGr.getValue('sys_id'),
				experienceLabel: experienceGr.getDisplayValue(),
			};
	}
	getAppConfig() {
		const appRouteConfig = {};
		const app = new GlideRecordSecure(SYS_UX_APP_ROUTE.TABLE_NAME);
		app.addEncodedQuery('extension_point!=NULL');
		app.query();
		while (app.next()) {
			const screenTypeSysId = app.getValue('screen_type');
			const pageCollectionLabel = app.getDisplayValue('extension_point');
			appRouteConfig[screenTypeSysId] = pageCollectionLabel;
		}
		return appRouteConfig;
	}

	getPageCollectionData(targetId, offset, limit) {
		const pageCollectionArr = [];
		const pageCollectionGr = this.getScreenGr(
			targetId,
			offset,
			limit,
			'screen_type!=NULL'
		);
		const appRouteConfig = this.getAppConfig();
		const screenTypeIds = Object.keys(appRouteConfig).join(',');
		pageCollectionGr.addQuery('screen_type', 'IN', screenTypeIds);
		pageCollectionGr.query();
		const totalRecords = pageCollectionGr.getRowCount();
		while (pageCollectionGr.next()) {
			const appId = pageCollectionGr.getValue('app_config');
			const screenType = pageCollectionGr.getValue('screen_type');
			const experienceId = this.getExperienceValues(appId)?.experienceId ?? '';
			let pageCollectionObj = this.getPagePayload(
				pageCollectionGr,
				totalRecords
			);
			const appRouteId = this.getPageCollAppRoute(screenType, appId);

			pageCollectionObj = {
				...pageCollectionObj,
				pageCollectionLabel: appRouteConfig[screenType],
				link: this.getLink(
					'pc',
					experienceId,
					appRouteId,
					pageCollectionGr.getUniqueValue()
				),
			};

			pageCollectionArr.push(pageCollectionObj);
		}
		return pageCollectionArr;
	}
}
