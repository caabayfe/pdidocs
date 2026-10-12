var CUSTOM_TABLES_RL = 'REL:7242ff518f30230017f1ce0637bdee16_list';
var IH_SPOKES_REL = 'license_ih_spoke.license';
var IH_SPOKE_ACTION_REL = 'license_ih_spoke_action.license';
var IH_PROTOCOLS_REL = 'license_ih_protocol.license';
var IH_FEATURE_REL = 'license_ih_feature.license';
var ITOM_RATIOS_REL = 'license_itom_ci_su_ratio.license';
var LIC_POOL_REL = 'license_pool.license';
var IH_SPOKE_SCOPE_REL = 'license_ih_spoke_caller_scope.license';
var SUBSCRIPTIONS_SHARING_USERS_RL = 'REL:d2358392775e10109e004c1aba10617b_list';
var ENTITLEMENT_PURCHASE_HISTORY_REL = 'license_details_audit_log.license';
var SUBSCRIBED_GROUP_RL = 'license_group_has_subscription.license';
var CUSTOM_TABLE_RL = 'ua_custom_table_inventory.license';
var UU_SUBSCRIBED_USERS_REL = 'REL:afa46a15772310100afbf62ad91061ea';
var GENAI_FEATURE_REL = 'license_genai_metadata.license';

function onLoad() {

	var licType = g_form.getValue('license_type');

	showHideLicenseRelatedLists(licType);
	displayAppropriateFormMsgs(licType);

	showHideFormSections(licType);

	showHideFields();
}

function showHideFields() {
	if (g_scratchpad.hasPlatformLicAllotment == "2") {
		g_form.setDisplay('count', false);
		g_form.setDisplay('allocated', false);
		g_form.setDisplay('allocated_status', false);
		g_form.setDisplay('last_allocation_cal_on', false);
	}

	if(g_scratchpad.rollingUsage != undefined && g_scratchpad.rollingUsage != "") {
		g_form.showFieldMsg('allocated', g_scratchpad.rollingUsage, 'info');
	}
}

function showHideFormSections(licType) {
	if (g_form.getValue('count') == 'N/A' && g_form.getValue('table_count') == 'N/A')
		g_form.setSectionDisplay('subscription_metrics', false);
	else
		g_form.setSectionDisplay('subscription_metrics', true);

	var isDisplayOnly = g_form.getValue('display_only') == 'true';
	var forFee = g_form.getValue('product_cost') == '0';

	if (licType == 0 && !isDisplayOnly && forFee)
		g_form.setSectionDisplay('subscription_configuration', true);
	else
		g_form.setSectionDisplay('subscription_configuration', false);
}

function showHideLicenseRelatedLists(licType) {

	var isDisplayOnly = g_form.getValue('display_only') == 'true';

	if (isDisplayOnly) {
		g_form.hideRelatedLists();

		if (hasFamilies())
			g_form.showRelatedList('license_has_family.license');

		if (hasMultipleLineItems())
			g_form.showRelatedList('license_details_item.license_details');

		if (hasPlatformLicAllotment())
			g_form.showRelatedList(CUSTOM_TABLES_RL);


		return;
	}

	var isFree = g_form.getValue('product_cost') == '1';

	// Show all related list for a Per-User Non-DisplayOnly license
	if (licType == 0 && (!isFree)) {
		if (!hasMultipleLineItems())
			g_form.hideRelatedList('license_details_item.license_details');
		if (!hasEntitlements())
			g_form.hideRelatedList('license_has_entitlement.license');

		// hide "unrestricted user" license only related list
		g_form.hideRelatedList(SUBSCRIPTIONS_SHARING_USERS_RL);
		g_form.hideRelatedList(UU_SUBSCRIBED_USERS_REL);
	} else {
		g_form.hideRelatedLists();

		// show unrestricted user associated related lists
		if (licType == 2) {
			g_form.showRelatedList(SUBSCRIPTIONS_SHARING_USERS_RL);
			g_form.showRelatedList(ENTITLEMENT_PURCHASE_HISTORY_REL);
			g_form.showRelatedList(CUSTOM_TABLE_RL);
			if (g_scratchpad.entitlementLevel != 'OFF'){
				g_form.showRelatedList(UU_SUBSCRIBED_USERS_REL);
				g_form.showRelatedList(SUBSCRIBED_GROUP_RL);
			}

		}

		// Show Only Items and Applications and entitleen related list for all other
		// subscription types - Max User, Unlimited User, PA Indicator etc ...
		//Same for free products
		if (hasMultipleLineItems())
			g_form.showRelatedList('license_details_item.license_details');
		g_form.showRelatedList('license_has_family.license');
		if (hasEntitlements())
			g_form.showRelatedList('license_has_entitlement.license');
	}

	if (licType == 0 && g_scratchpad.entitlementLevel != 'ENFORCE')
		g_form.showRelatedList('REL:8df880d793310300972c990f867ffb3d_list');
	else
		g_form.hideRelatedList('REL:8df880d793310300972c990f867ffb3d_list');

	if (hasPlatformLicAllotment())
		g_form.showRelatedList(CUSTOM_TABLES_RL);
	else
		g_form.hideRelatedList(CUSTOM_TABLES_RL);

	if (hasITOMRatios())
		g_form.showRelatedList(ITOM_RATIOS_REL);
	else
		g_form.hideRelatedList(ITOM_RATIOS_REL);

	if (hasIHSpokes())
		g_form.showRelatedList(IH_SPOKES_REL);
	else
		g_form.hideRelatedList(IH_SPOKES_REL);

	if (hasIHSpokeActions())
		g_form.showRelatedList(IH_SPOKE_ACTION_REL);
	else
		g_form.hideRelatedList(IH_SPOKE_ACTION_REL);

	if (hasIHSpokeCallerScopes())
		g_form.showRelatedList(IH_SPOKE_SCOPE_REL);
	else
		g_form.hideRelatedList(IH_SPOKE_SCOPE_REL);

	if (hasIHProtocols())
		g_form.showRelatedList(IH_PROTOCOLS_REL);
	else
		g_form.hideRelatedList(IH_PROTOCOLS_REL);

	if (hasIHFeatures())
		g_form.showRelatedList(IH_FEATURE_REL);
	else
		g_form.hideRelatedList(IH_FEATURE_REL);

	if (hasLicensePool())
		g_form.showRelatedList(LIC_POOL_REL);
	else
		g_form.hideRelatedList(LIC_POOL_REL);

	if (hasGenAIFeatures())
		g_form.showRelatedList(GENAI_FEATURE_REL);
	else
		g_form.hideRelatedList(GENAI_FEATURE_REL);
}

function displayAppropriateFormMsgs(licType) {
	if (g_form.getValue('product_cost') == '1')
		return;

	if (licType == 0) {
		if (g_form.getValue('display_only') != 'true') {
			// Per-user and not display only
			if (parseInt(g_form.getValue('allocated')) === 0) {
				showSubRoleAllocationMsg();
				if (g_scratchpad.entitlementLevel === 'OFF' && g_scratchpad.autoSystemEntitlementEnabled === true)
					g_form.showFieldMsg('allocated', getMessage('licensing_per_user_allocation_info'), 'info', true);
			}
		} else {
			// Per-user and display only
			g_form.addInfoMessage(g_scratchpad.perUserDispOnlySubMsg);
		}
	} else if (licType == 1) {
		// Capacity sub
		g_form.addInfoMessage(g_scratchpad.capacitySubMsg);
		g_form.setLabelOf('allocated', getMessage('Used'));
	} else if (licType == 2) {
		// Max user
		g_form.addInfoMessage(g_scratchpad.maxUserSubMsg);
	} else  if (licType == 3) {
		// unlimited user
		g_form.addInfoMessage(g_scratchpad.unlimitedUserSubMsg);
	} else  if (licType == 4) {
		// PA indicator
		g_form.addInfoMessage(g_scratchpad.paIndicatorSubMsg);
	}

	displayAllocatedMsg();
}

function displayAllocatedMsg() {

	var allocated = g_form.getValue('allocated');

	if (allocated == 'Unavailable')
		g_form.addInfoMessage(g_scratchpad.invalidAllocatedMsg);
}

function showSubRoleAllocationMsg() {
	var wikiLink = g_scratchpad.subscriptionWikiLink;
	var wikiText = g_scratchpad.subscriptionWikiTitle;

	g_form.addInfoMessage(g_scratchpad.perUserSubMsg +'<a id="permalink" target="_blank" class="linked" style="color:#666666;" href=' + wikiLink + '>' +wikiText +'</a>');
}

function hasFamilies() {
	return g_scratchpad.hasFamilies;
}

function hasMultipleLineItems() {
	return g_scratchpad.hasMultipleLineItems;
}

function hasEntitlements() {
	return g_scratchpad.hasEntitlements;
}

function hasPlatformLicAllotment() {
	return g_scratchpad.hasPlatformLicAllotment != "-1";
}

function hasITOMRatios() {
	return g_scratchpad.hasITOMRatios;
}

function hasIHProtocols() {
	return g_scratchpad.hasIHProtocols;
}

function hasIHSpokes() {
	return g_scratchpad.hasIHSpokes;
}

function hasIHFeatures() {
	return g_scratchpad.hasIHFeatures;
}

function hasLicensePool() {
	return g_scratchpad.hasLicPool;
}

function hasIHSpokeActions() {
	return g_scratchpad.hasIHSpokeActions;
}

function hasIHSpokeCallerScopes() {
	return g_scratchpad.hasIHSpokeCallerScopes;
}

function hasGenAIFeatures() {
	return g_scratchpad.hasGenAIFeature;
}
