/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        payload,
        name
    } = event;
    const {
        lastLookupState,
        selectedRecord,
        isLinking,
        mode
    } = api.state;
    const {
        enableVerify
    } = api.context.props;
    if (name === 'RECORD_LOOKUP#CREATE_REQUESTED') {
        api.setState('lastLookupState', 'search');
        api.setState('lookupState', 'loading');
        api.setState('selectedRecord', '-1');
        helpers.timing.setTimeout(() => {
            api.setState('lookupState', 'edit');
        }, 100);
    }
    if (name === 'RECORD_LOOKUP#LINK_REQUESTED') { //internally dispatched from Lookup search
        api.setState('lookupState', 'selected');
        api.setState('lastLookupState', 'search');
        api.setState('isLinking', true);
        api.setState('selectedRecord', payload.sysId);
        api.setState('loadingMessage', await helpers.translate('Linking'));
        api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{message:await helpers.translate('The information has been linked'), type:'polite'});
    }
    if (name === 'RECORD_LOOKUP#LINK_RECORD_DATA_FETCH_COMPLETED_INTERNAL') {
        if (payload.status === 'succeeded') {
            api.setState('lookupState', 'selected');
            api.setState('lastLookupState', 'edit');
            api.emit('RECORD_LOOKUP#LINK_RECORD_DATA_FETCH_COMPLETED', {
                ...payload,
            }); //external event

            if (mode === 'create-verify') {
                api.setState('verified', true);
            }

            if (isLinking) {
                api.emit('RECORD_LOOKUP#LINK_REQUESTED', {
                    ...payload,
                    mode: mode
                }); //external event
                api.setState('isLinking', false);
                api.setState('mode', 'link');
            }
        }
        if (payload.status === 'error') {
            api.setState('lookupState', 'error');
        }
        if (payload.status === 'empty') {
            api.setState('lookupState', 'empty');
        }
        api.setState('loadingMessage', null);
    }
    if (name === 'RECORD_LOOKUP#FORM_CANCEL_REQUESTED') {
        api.setState('lookupState', lastLookupState);
        api.setState('lastLookupState', 'edit');
        if (selectedRecord === '-1') {
            api.setState('selectedRecord', null);
        }
    }
    if (name === 'RECORD_LOOKUP#SAVE_REQUESTED') {
        api.setState('lookupState', 'loading');
        if (payload.sysId != null) {
            api.setState('selectedRecord', payload.sysId);
        }
        api.setState('isLinking', payload.isInserting);
        if(payload.isInserting)
            api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{message:await helpers.translate((enableVerify)? 'The information has been created and verified':'The information has been created'), type:'polite'});
        else
            api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{message:await helpers.translate('The information has been edited'), type:'polite'});
    }
    if (name === 'RECORD_LOOKUP#FORM_DATA_FETCH_COMPLETED') {
        if (payload.isSaving) {
            api.setState('lookupState', 'selected');
            api.setState('lastLookupState', 'edit');
        }
        if (payload.isCreating) {
            api.setState('lookupState', 'edit');
            api.setState('lastLookupState', 'search');
            if (enableVerify === true)
                api.setState('mode', 'create-verify');
            else
                api.setState('mode', 'create');
        }
    }
    if (name === 'RECORD_LOOKUP#EDIT_REQUESTED') {
        api.setState('lookupState', 'edit');
        api.setState('lastLookupState', 'selected');
        api.setState('selectedRecord', payload.sysId);
    }
    if (name === 'RECORD_LOOKUP#UNLINK_REQUESTED') { //internally dispatched from Lookup selected
        api.setState('lookupState', 'search');
        api.setState('lastLookupState', 'selected');
        api.setState('selectedRecord', null);
        api.setState('resetRequested', payload.refreshRequested);
        if (enableVerify === true)
            api.setState('verified', false);

        api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{message:await helpers.translate('The information has been unlinked'), type:'polite'});
        api.emit('RECORD_LOOKUP#UNLINK_REQUESTED'); //external event
    }
    if (name === 'RECORD_LOOKUP#FORM_STATUS_CHANGED') { //internally dispatched from Lookup form
        api.emit('RECORD_LOOKUP#FORM_STATUS_CHANGED', payload); //external event
        if (enableVerify === true && payload.status === 'inserted') {
            api.emit('RECORD_LOOKUP#VERIFY_REQUESTED', {
                mode: "create-verify"
            }); //external event
        }
    }
    if (name === 'RECORD_LOOKUP#LINKED_CARD_COLLAPSED') { //internally dispatched from Lookup selected
        api.emit('RECORD_LOOKUP#LINKED_CARD_COLLAPSED', payload); //external event
    }
    if (name === 'MACROPONENT_PROPERTY_CHANGED') {
        if (payload.name === 'linkedRecordSysId') {
            api.setState('lookupState', payload.value && payload.value !== '-1' ? 'selected' : 'search');
            api.setState('selectedRecord', payload.value);
        }
    }
    if (name === 'RECORD_LOOKUP#VERIFY_REQUESTED_INTERNAL') {
        api.setState('verified', true);
        api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{message:await helpers.translate('The information has been verified'), type:'polite'});
        api.emit('RECORD_LOOKUP#VERIFY_REQUESTED', payload); //external event
    }
}
