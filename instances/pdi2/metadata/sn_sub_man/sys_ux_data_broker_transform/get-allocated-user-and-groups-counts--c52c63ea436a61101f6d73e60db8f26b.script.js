/**
 * Data broker to get group and user counts currently being added to the subscription
 * @param {object} input - Gets subscriptionId and groupIds as input as defined in the Properties
 * @return {object} with user and group counts
 */
function transform(input) {
    let returnVal = {};
    if ((!input.groupIdList) || (input.groupIdList.length === 0))
        return returnVal;

    if (!gs.nil(input.subscriptionId)) {
        try {
            returnVal = new global.GlideQuery('sn_sub_man_st_subscribed_groups')
                .where('group', 'IN', input.groupIdList)
                .where('subscription.sys_id', input.subscriptionId)
                .aggregate('count')
                .aggregate('sum', 'active_users_count_int')
                .selectOne()
                .get();


        } catch (err) {
            const errMessage = 'Could not add get allocated user and group counts for subscription Id: ' + input.subscriptionId;
            gs.addErrorMessage(errMessage + ' with error ' + err.message);
            return {
                'error': errMessage
            };
        }
    }
    return returnVal;

}
