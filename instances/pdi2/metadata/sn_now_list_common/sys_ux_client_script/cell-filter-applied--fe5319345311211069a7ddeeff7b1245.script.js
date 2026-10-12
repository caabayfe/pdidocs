/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { validateDirtyStatus } = imports['sn_now_list_common.ListControllerUtils']();
    if (validateDirtyStatus(...arguments))
        return;

    const {
        payload: {
            context,
            filterType: action
        }
    } = event;
    // if not a filtering cell action return
    if(['show_matching','filter_out'].indexOf(action) === -1) return;
    const dateToYMD = date => {
        if (Object.prototype.toString.call(date) !== '[object Date]')
            throw 'Invalid argument: date must be Date Object Type';

        const day = date.toLocaleString("default", {
            day: "2-digit"
        });
        const month = date.toLocaleString("default", {
            month: "2-digit"
        });
        const year = date.toLocaleString("default", {
            year: "numeric"
        });
        return `${year}-${month}-${day}`;
    };

    function getValueBasedOnDataType({
        context,
    }) {
        const {
            cell: {
                metadata: {
                    internalType,
                    internalValue
                },
                value
            }
        } = context;

        if (!internalValue) return null;
        if (internalType === 'reference') {
            const {
                cell: {
                    metadata: {
                        referenceSysId
                    }
                }
            } = context;
            return referenceSysId;
        }

        const dateTypes = ['glide_date_time', 'due_date', 'glide_date', 'date', 'date_time'];

        if (dateTypes.includes(internalType)) {
            const utcSeconds = value;
            const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
            date.setUTCSeconds(utcSeconds);
            return dateToYMD(date);
        }
        return internalValue;
    }

    const  {column: {key: columnName}, cell: {metadata: {internalType}}} = context;
    const value = getValueBasedOnDataType({
        context
    });
    api.data.sn_record_list_data_broker.applyContextFilter({columnName,  value, action, internalType});
}
