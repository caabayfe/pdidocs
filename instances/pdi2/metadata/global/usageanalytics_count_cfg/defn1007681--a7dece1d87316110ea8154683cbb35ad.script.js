var DEBUG = false;
var DEBUG_MODE = ''; 
var USER_ID_CHUNK_SIZE = 200;
var INSTANCE_ANALYZER_MODE = false;
var DATE_RANGE = {
    last_month: 'sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()'
};
var CURRENT_RANGE = DATE_RANGE.last_month;
var UNKNOWN_CHANNEL_GRADUATION_THRESHOLD = 3000;
var UNKNOWN_CHANNEL_PREFIX = '_custom-';
var OTHER_CUSTOM_CHANNEL_NAME = 'custom-other';

var CHANNEL_ALIASES = {
    'null': {alias: 'mweb', regex: null},
    '': {alias: 'mweb', regex: null},
    'mweb': {alias: 'mweb', regex: null},
    'sd_chat': {alias: 'mweb', regex: null},
    'hr_chat': {alias: 'mweb', regex: null},
    'netid/netid+ (duo)': {alias: 'mweb', regex: null},
    'general inquiry': {alias: 'mweb', regex: new RegExp('general inquiry')},
    'general information': {alias: 'mweb', regex: new RegExp('general information')},
    'incident': {alias: 'mweb', regex: null},
    'teams': {alias: 'teams', regex: null},
    'microsoft teams': {alias: 'teams', regex: new RegExp('microsoft teams')},
    'microsoft teams chat': {alias: 'teams', regex: new RegExp('microsoft teams chat')},
    'ms teams': {alias: 'teams', regex: new RegExp('ms teams')},
    'teams chat': {alias: 'teams', regex: new RegExp('teams chat')},
    'microsoft_teams_chat': {alias: 'teams', regex: new RegExp('microsoft_teams_chat')},
    'microsoft teams-chat': {alias: 'teams', regex: new RegExp('microsoft teams-chat')},
    'slack': {alias: 'slack', regex: new RegExp('slack')},
    'bot to bot': {alias: 'bot to bot', regex: null},
    'bot-to-bot': {alias: 'bot to bot', regex: new RegExp('bot-to-bot')},
    'whatsapp': {alias: 'whatsapp', regex: new RegExp('whatsapp')},
    'facebook messenger': {alias: 'facebook messenger', regex: null},
    'workplace': {alias: 'workplace', regex: null},
    'sms': {alias: 'sms', regex: null},
    'zoom team chat': {alias: 'custom-zoom', regex: new RegExp('zoom team chat')},
    'zoom chat': {alias: 'custom-zoom', regex: new RegExp('zoom chat')},
    'google assistant': {alias: 'google assistant', regex: null},
    'alexa': {alias: 'alexa', regex: null},
    'google business messages': {alias: 'google business messages', regex: new RegExp('google business messages')},
    'apple messages for business': {alias: 'apple messages for business', regex: new RegExp('apple business chat')},
    'blipproviderchatchannel': {alias: 'custom-blip', regex: null},
    'blip channel': {alias: 'custom-blip', regex: null},
    'espressive': {alias: 'custom-espressive', regex: null}
};

var mapUserNamesToIds = {};
var usrsByChannel = {};

function convertUserNamesToIds(channelUserIdMap) {
    if (!channelUserIdMap || Object.keys(channelUserIdMap) == 0) return {};
    var newUserNames = [];
    for (channel in channelUserIdMap) {
        var unames = channelUserIdMap[channel];
        if (unames) {
            for (i in unames) {
                if (!mapUserNamesToIds[unames[i]]) {
                    newUserNames.push(unames[i]);
                }
            }
        }
    }
    if (newUserNames.length > 0) {
        if (DEBUG) {
            gs.info('translating ' + newUserNames.length + ' user names, in chunks of ' + USER_ID_CHUNK_SIZE);
        }
        for (var i = 0; i < newUserNames.length; i += USER_ID_CHUNK_SIZE) {
            var userNamesChunk = newUserNames.slice(i, i + USER_ID_CHUNK_SIZE);
            var grUser = new GlideRecord('sys_user');
            grUser.addQuery("user_name", "IN", userNamesChunk);
            grUser.query();
            while(grUser.next()){
                mapUserNamesToIds[grUser.user_name] = grUser.getValue('sys_id');
            }
        }
        if (DEBUG) {
            if (DEBUG_MODE === 'verbose') {
                gs.info('translated name<>id map : ' + JSON.stringify(mapUserNamesToIds));
            }
            gs.info('completed ' + newUserNames.length + ' user names translation');
        }
    }
    for (channel in channelUserIdMap) {
        var unames = channelUserIdMap[channel];
        if (unames) {
            for (i in unames) {
                unames[i] = mapUserNamesToIds[unames[i]];
            }
        }
    }
    if (DEBUG) {
        if (DEBUG_MODE === 'verbose') {
            gs.info('translated map : ' + JSON.stringify(channelUserIdMap));
        }
    }
    return channelUserIdMap;
}

function isValidField(rec, fieldName) {
    if (fieldName.indexOf('.') == -1) {
        var validf = rec.isValidField(fieldName);
        if (DEBUG && !validf) {
            gs.info('detected invalid field : ' + fieldName);
        }
        return validf;
    }
    return true;
}

function getUniqueUsers(desc, tableName, encodedQuery, groupingAttribute1, groupingAttribute2) {
    var hasTwoLevelGrouping = !groupingAttribute1.startsWith('{');
    var displayValues = {};
    var grAgg = new GlideAggregate(tableName);
    if (!grAgg.isValid() || !isValidField(grAgg, groupingAttribute2)) {
        return displayValues;
    }
    if (hasTwoLevelGrouping) {
        if (!isValidField(grAgg, groupingAttribute1)) {
            return displayValues;
        }
        grAgg.groupBy(groupingAttribute1);
    }
    grAgg.groupBy(groupingAttribute2);
    grAgg.addEncodedQuery(encodedQuery);
    grAgg.query();
    var userCount = 0;
    while (grAgg.next()) {
        var groupingVal = hasTwoLevelGrouping ? 
            grAgg.getDisplayValue(groupingAttribute1) + '' : 
            groupingAttribute1.substring(1 , groupingAttribute1.length-1);
        groupingVal = groupingVal.toLowerCase().trim();
        // apply alias if applicable
        groupingVal = getAlias(groupingVal) || UNKNOWN_CHANNEL_PREFIX + groupingVal;
        if (!displayValues[groupingVal]) {
            displayValues[groupingVal] = [];
        }
        userCount++;
        displayValues[groupingVal].push(grAgg.getValue(groupingAttribute2) + '');
    }
    if (DEBUG) {
        if (DEBUG_MODE === 'verbose') {
            gs.info(desc + ' : ' + JSON.stringify(displayValues));
        } else {
            gs.info(desc+ ' : Found ' + userCount + ' users across ' + Object.keys(displayValues).length + ' channels');
        }
    }
    return displayValues;
}

function getAlias(channelName) {
    // Handle exact match
    if (CHANNEL_ALIASES[channelName]) {
        return CHANNEL_ALIASES[channelName].alias;
    }
    // Handle pattern match
    for(patternName in CHANNEL_ALIASES) {
        var regEx = CHANNEL_ALIASES[patternName].regex;
        if (regEx && regEx.test(channelName)) {
            return CHANNEL_ALIASES[patternName].alias;
        }
    }
    return null;
}

function getUniqueCountByChannel(targetMap) {
    var result = {};
    var unknownChannelMap = {};
    unknownChannelMap[OTHER_CUSTOM_CHANNEL_NAME] = [];
    Array.prototype.unique = function() {
        return this.filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });
    };
    for (key in targetMap) {
        var channelUniqueUsers = [];
        var channelUsers = targetMap[key];
        if (channelUsers !== undefined && channelUsers.length > 0) {
            channelUniqueUsers = channelUsers.unique();
            // If current channel is a custom type and doesn't meet graduation threshold, merge to custom bucket
            if (key.startsWith(UNKNOWN_CHANNEL_PREFIX) && channelUniqueUsers.length < UNKNOWN_CHANNEL_GRADUATION_THRESHOLD) {
                unknownChannelMap[OTHER_CUSTOM_CHANNEL_NAME] = unknownChannelMap[OTHER_CUSTOM_CHANNEL_NAME].concat(targetMap[key]);
                continue;
            } 
        }
        result[key] = channelUniqueUsers.length;
    }
    for (key in unknownChannelMap) {
        var uChannelUniqueUsers = [];
        var uChannelUsers = unknownChannelMap[key];
        if (uChannelUsers !== undefined && uChannelUsers.length > 0) {
            uChannelUniqueUsers = uChannelUsers.unique();
        }
        if (uChannelUniqueUsers.length > 0 ) {
            result[key] = uChannelUniqueUsers.length;
        }
    }
    return result;
}

function mergeResults(targetMap, sourceMap) {
    if (sourceMap) {
        for (key in sourceMap) {
            if (targetMap[key]) {
                targetMap[key] = targetMap[key].concat(sourceMap[key]);
            } else {
                targetMap[key] = sourceMap[key];
            }
        }
    }
}

function getGuestUserId() {
    var grUser = new GlideRecord('sys_user');
    grUser.addQuery("user_name", "guest");
    grUser.query();
    while(grUser.next()){
        return grUser.getValue("sys_id");
    }
    return null;
}

function getUsersForNotif(encodedQuery) {
    var results = {};
    try {
        var grMO = new GlideRecord('messaging_outbound');
        if (grMO.isValid()){
            grMO.addEncodedQuery(encodedQuery);
            grMO.query();
            while (grMO.next()) {
                var channelType = grMO.messaging_application.provider;
                if (!channelType) continue;
                var channelKey = 'notif-' + channelType;
                var payloadStr = grMO.getValue('payload');
                if (!payloadStr) continue;
                var payload = JSON.parse(payloadStr);
                var recipientId = payload.recipient && payload.recipient.id;
                if (recipientId) {
                    if(!results[channelKey]) {
                        results[channelKey] = [];
                    }
                    results[channelKey].push(recipientId);
                }
            }
        }
    } catch(ex) {
        if (DEBUG) {
            gs.info('exception processing notif : ' + ex.message);
        }
        results['notif-error'] = 'exception'; //dummy value to track exception key
    }
    return results;
}

function getScriptDefinitionAggData(uniqueCountByChannel) {
    var totalCount = 0;
    var dataArray = [];
    if (uniqueCountByChannel) {
        for (key in uniqueCountByChannel) {
            var data = {};
            var channelCount = uniqueCountByChannel[key];
            if (!channelCount) continue;
            totalCount += channelCount;
            data['sys_domain'] = 'global'; 
            data['group1'] = key;
            data['group_by'] = "channel_name";
            data['agg_val'] = channelCount;
            data['agg_type'] = 'sum';
            data['agg_col'] = 'user_id';
            dataArray.push(data); 
        }
    }
    return {"count": totalCount, "ua_defn_agg": dataArray};
}

var answer = {};
try {
    var guestUserId = this.getGuestUserId();
    if (DEBUG) {
        gs.info('guest user id : ' + guestUserId);
    }

    /* notif */
    /* indexes avail on sys_created_on, consumer_account */
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'va notifications (push or actionable)',
        'sys_cs_notification',
        'consumer_account.channel_user_profile.channel!=null^' + CURRENT_RANGE,
        'consumer_account.channel_user_profile.channel.name',
        'consumer_account.channel_user_profile.user_document'
    ));

    if (!guestUserId && DEBUG) {
        gs.info(JSON.stringify({ "warning": "no guest user found" }));
    }
    var guestUserClause = 'opened_for!=null' + (!guestUserId ? '' : '^opened_for!=' + guestUserId) + '^';

    /* interactions for caf-based provider channels */
    /* indexes avail on sys_created_on, channel_user_profile */
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'Chat/Messaging provider channel based channel interactions',
        'interaction',
        guestUserClause + 'provider_application!=null^typeINchat,messaging^channel_user_profile!=null^' + CURRENT_RANGE,
        'channel_user_profile.channel.name',
        'opened_for'
    ));

    /* interactions for web/mobile */
    /* indexes avail on sys_created_on, provider_application */
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'Chat/Messaging non-provider channel based channel interactions',
        'interaction',
        guestUserClause + 'provider_application=null^typeINchat,messaging^subtype!=null^' + CURRENT_RANGE,
        'subtype',
        'opened_for'
    ));

    /* interactions for ad-hoc channel integfrations */
    /* indexes avail on sys_created_on, provider_application */
    var OBSERVED_INTERACTION_TYPES = [
        'microsoft_teams_chat',
        'zoom_chat'
    ];
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'Custom non-provider channel based channel interactions',
        'interaction',
        guestUserClause + 'provider_application=null^typeIN' + OBSERVED_INTERACTION_TYPES.join(',') + '^' + CURRENT_RANGE,
        'type',
        'opened_for'
    ));

    /* collab chat */
    /* indexes avail on provider */
    this.mergeResults(usrsByChannel, this.convertUserNamesToIds(this.getUniqueUsers(
        'collab chat',
        'sys_cs_external_collab_chat_message_map',
        'provider!=null^context_id!=null^status!=Error^' + CURRENT_RANGE,
        'provider.channel.name',
        'sys_created_by'
    )));

    /* sn_now_teams_usage */
    /* indexes avail on source_user */
    var OBSERVED_TEAMS_EVENTS_W_SOURCE_USER = [
        'agent.initiated.chat', //Number of agents initiating Teams chats
        'comment.replied', //Number of users responding to comments
        'approval.replied', //Number of users approving from Microsoft Teams
        'approval.sent', //Number of users receiving approval notifications
        'comment.sent' //Number of users receiving comment
    ];
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'teams chat : Teams events (source user)',
        'sn_now_teams_usage',
        'source_user!=undefined^source_user!=null^event_nameIN' + OBSERVED_TEAMS_EVENTS_W_SOURCE_USER.join(',') + '^' + CURRENT_RANGE,
        '{Teams}',
        'source_user'
    ));

    /* sn_now_teams_usage */
    /* indexes avail on target_user */
    var OBSERVED_TEAMS_EVENTS_W_TARGET_USER = [
        'agent.initiated.chat' //Number of agents initiating Teams chats
    ];
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'teams chat : Teams events (target user)',
        'sn_now_teams_usage',
        'target_user!=undefined^target_user!=null^event_nameIN' + OBSERVED_TEAMS_EVENTS_W_TARGET_USER.join(',') + '^' + CURRENT_RANGE,
        '{Teams}',
        'target_user'
    ));

    /* sn_notify_msteams_interaction_call_usage */
    /* indexes avail on interaction_opened_by_user */
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'teams chat : No of users who transitioned to Teams call',
        'sn_notify_msteams_interaction_call_usage',
        'interaction_opened_by_user!=null^' + CURRENT_RANGE,
        '{Teams}',
        'interaction_opened_by_user'
    ));

    /* notify_conference_call */
    /* indexes avail on user,notify_conference_call */
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'teams chat : Total Number of Notify Conferences related to Teams',
        'notify_participant',
        'user!=null^notify_conference_call.service_provider=Microsoft Teams^' + CURRENT_RANGE,
        '{Teams}',
        'user'
    ));

    /* sn_now_azure_usage */
    /* indexes avail on user */
    var OBSERVED_AZURE_EVENTS = [
        'dashboard.viewed', //Usage of Employee Center dashboard in Teams
        'viva.quickview.viewed' //Usage of Employee Center dashboard in Teams VIVA
    ];
    this.mergeResults(usrsByChannel, this.getUniqueUsers(
        'teams chat : Usage of Employee Center dashboard in Teams with distinct user count',
        'sn_now_azure_usage',
        'user!=null^event_nameIN' + OBSERVED_AZURE_EVENTS.join(',') + '^' + CURRENT_RANGE,
        '{Teams}',
        'user'
    ));

    /* non-va outbound notifications */
    this.mergeResults(usrsByChannel, this.getUsersForNotif(
        'messaging_application.providerINteams,slack^' + CURRENT_RANGE
    ));

    var uniqueUserCounResultMap = this.getUniqueCountByChannel(usrsByChannel);
    if (INSTANCE_ANALYZER_MODE) {
        answer = JSON.stringify(uniqueUserCounResultMap);
    } else {
        answer = JSON.stringify(this.getScriptDefinitionAggData(uniqueUserCounResultMap));
    }
} catch(e) {
    gs.info(JSON.stringify({ "error": e.message }));
}
if (INSTANCE_ANALYZER_MODE) {
    gs.info(answer);
} else {
    answer;
}
