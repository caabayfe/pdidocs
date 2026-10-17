function include({
    imports
}) {

    class SowIncidentImpactGeomapUtilsSNC {

        /**
         * Returns Geomap config
         * @param {object} helpers
         * @param {object} impactDetails
         * @return object
         */
        static async getGeomapConfig(helpers, impactDetails) {
            let geomapConfig = {
                "dataSources": await this._getDataSources(helpers, impactDetails),
                "groupBy": await this._getGroupBy(impactDetails),
                "metricLabel": await this._getMetricLable()
            };
            return geomapConfig;
        }
    
        /**
         * Returns data sources property value for Geomap
         * @param {object} helpers
         * @param {object} impactDetails
         * @return object
         */
        static async _getDataSources(helpers, impactDetails) {
            let dataSources = [{
                "filterQuery": "sys_idIN" + impactDetails.impactedUsers.join(),
                "id": "dGFibGVzeXNfdXNlcjE2OTE2Njg3MDkzMDM=",
                "label": await helpers.translate("User"),
                "sourceType": "table",
                "tableOrViewName": "sys_user"
            }];
            return dataSources;
        }
    
        /**
         * Returns group by property value for Geomap
         * @param {object} impactDetails
         * @return object
         */
        static async _getGroupBy(impactDetails) {
            let groupBy = [{
                "groupBy": [{
                    "dataSource": "dGFibGVzeXNfdXNlcjE2OTE2Njg3MDkzMDM=",
                    "groupByField": "location"
                }],
                "maxNumberOfGroups": impactDetails.impactedLocationsCount
            }];
            return groupBy;
        }
    
        /**
         * Returns metric label property value for Geomap
         * @return object
         */
        static async _getMetricLable() {
            let metricLabel = [{
                "aggregateFunction": "COUNT",
                "dataSource": "dGFibGVzeXNfdXNlcjE2OTE2Njg3MDkzMDM=",
                "id": "ZEdGaWJHVnplWE5mZFhObGNqRTJPVEUyTmpnM01Ea3pNRE09MTY5MTY2ODcxMjU3NQ=="
            }];
            return metricLabel;
        }
    }
    
    return SowIncidentImpactGeomapUtilsSNC;
}
