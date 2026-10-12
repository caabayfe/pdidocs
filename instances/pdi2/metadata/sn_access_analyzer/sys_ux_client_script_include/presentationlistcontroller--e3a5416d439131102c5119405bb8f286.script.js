function include({ imports }, api, helpers) {

    const { EvalStatus, EmptyState } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);

    class PresentationListController {

        //--------------------------------------------------------------------------------//

        constructor(tableStateName) {
            this.tableStateName = tableStateName;
            this.conf = {...api.state[tableStateName]};
            this.conf.filterIndexList = this.conf.filterIndexList || [];
            if(this.hasPagination()) {
            	this.conf.pagination.paginationTriggeredBy = this.conf.pagination.paginationTriggeredBy || "own";
            }
        }

        //--------------------------------------------------------------------------------//

        getSourceData() {
            return this.conf.sourceData;
        }

        //--------------------------------------------------------------------------------//

        setSourceData(data) {
            this.conf.sourceData = data || [];
            this.conf.pagination.totalRows = data.length;
            return this;
        }

        //--------------------------------------------------------------------------------//

        update(data) {
            if (data) {
                this.conf.sourceData = data;
            }
            if (this.conf.showDifferences == true) {
                this.showDifference();
            } else {
                this._update(this.conf.sourceData);
            }

        }

        //--------------------------------------------------------------------------------//

        _update(data, handleErrorMsg = true) {
            this.hideLoader();
            if (data == null || data.length == 0) {
                if (handleErrorMsg) {
                    EmptyState.showNoDataMessage(this.conf.name);
                }
                return;
            }

            this.conf.overlayDef = null;
            this.conf.pagination.totalRows = this.conf.filterIndexList.length == 0 ? data.length : this.conf.filterIndexList.length;
            
            var result = this.hasPagination() ? this._getPageData(this.conf.pagination.page, this.conf.pagination.pageSize) : data;
            if (result.length < this._getRenderedRowCount()) {
                this.conf.pagination.paginationTriggeredBy = "other"
            }

            this._updateRowDef(result);
            this.updateState();
        }

        //--------------------------------------------------------------------------------//
        
        _getRenderedRowCount() {
        	 return this.conf.rowDef.rows ? this.conf.rowDef.rows.length : 0 ;
        }
        
        //--------------------------------------------------------------------------------//

        showDifference(callback) {
            callback = callback || (row => row.baseUser != row.modelUser);
            var result = this.filter(callback);
            if (result.length == 0) {
            	var msg = this.conf.messages ? this.conf.messages.noDifference : api.state[this.conf.name].messages.noDifference;
            	EmptyState.show(msg, this.conf.name);
            }
            this.updateState();
            return this;
        }

        //--------------------------------------------------------------------------------//

        getFilteredData() {
            var source = this.conf.sourceData;
            return this.conf.filterIndexList.map(index => source[index]);
        }

        //--------------------------------------------------------------------------------//

        reset() {
            this.conf.filterIndexList = [];
            this._update(this.conf.sourceData);
        }

        //--------------------------------------------------------------------------------//
        gotoPage(page, pageSize = null) {
            pageSize = pageSize || this.conf.pagination.pageSize;
            var data = this._getPageData(page, pageSize);
            this._updateRowDef(data);
            this.conf.pagination.page = page;
            this.updateState();
        }

        //--------------------------------------------------------------------------------//
        changePageSize(pageSize) {
            this.conf.pagination.page = 0;
            this.conf.pagination.pageSize = pageSize;
            this.updateState();
        }

        //--------------------------------------------------------------------------------//

        filter(predicate) {
            if (this.conf.sourceData == null || this.conf.sourceData.length == 0) {
                return [];
            }
            var fi = [];
            var rowData = this.conf.sourceData.filter((row, index) => {
            	var res = predicate(row, index);
                if (res) {
                    fi.push(index);
                }
                row.selected = res;
                return res;
            });
            this.conf.filterIndexList = fi;
            this.conf.pagination.page = 0;
            this._update(rowData, false);
            return rowData;
        }


        //--------------------------------------------------------------------------------//

        showMessage(obj) {
            this.hideLoader();
            EmptyState.show(obj, this.conf.name)
        }

        //--------------------------------------------------------------------------------//
        showServerErrorMessage() {
            this.hideLoader();
            EmptyState.showServerErrorMessage(this.conf.name);
        }

        //--------------------------------------------------------------------------------//
        updateHeader(header) {
        	this.conf.colDef.columns.forEach(col => {
                if (header[col.key] != undefined) {
                    col.label = header[col.key];
                }
            });
            this.updateState();
        }

        // -------------------------------------------------------------------------------- //

        _getPageData(page = 0, pageSize = 10) {
            var source = this.conf.sourceData;
            if (this.conf.filterIndexList.length == 0) {
                return source.slice(pageSize * page, Math.min(source.length, (page + 1) * pageSize));
            }
            var fi = this.conf.filterIndexList.slice(pageSize * page, Math.min(this.conf.filterIndexList.length, (page + 1) * pageSize));
            return fi.map(index => source[index]);
        }

        //--------------------------------------------------------------------------------//
        _mapRowData(rowData) {
            var row = {};
            var colDef = this.conf.colDef.columns;
            rowData = this.conf.useRowMapper == false ? rowData : this.rowMapper(rowData);
            colDef.forEach(col => {
                var key = col.key;
                var colData = rowData[key];
                if (col.type == "custom") {
                    row[key] = {
                        componentProps: {
                            label: col.translate == true ? EvalStatus.getTranslatedText(colData): colData.label,
                            icon: colData.icon,
                            variant: 'tertiary',
                            showIcon: colData.icon != '',
                            color: colData.color
                        }
                    };
                } else {
                    if (typeof (colData) == "object") {
                        row[key] = colData;
                    } else {
                        row[key] = {
                            value: colData
                        }
                    }
                }
            });
            return row;
        }

        //--------------------------------------------------------------------------------//

        hideLoader() {
            this.conf.loadingState = false;
            this.updateState();
        }

        //--------------------------------------------------------------------------------//

        handlePagination(event) {
            if (this.conf.pagination.paginationTriggeredBy == "other") {
                this.conf.pagination.paginationTriggeredBy = "own";
                return;
            }
            if (event.name == 'NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET') {
                this.gotoPage(event.payload.value);
            } else {
                this.changePageSize(event.payload.value);
            }
        }

        //--------------------------------------------------------------------------------//

        _updateRowDef(list) {
        	EmptyState.hide(this.conf.name);
        	var rows = list.map((rowData, index) => {
        		rowData.selected = true;
        		return {
                    key: index,
                    cells: this._mapRowData(rowData)
                };
        	})
        	
            this.conf.rowDef = {rows: rows};
        }

        //--------------------------------------------------------------------------------//

        updateState() {
            api.setState(this.tableStateName, this.conf);
        }

        //--------------------------------------------------------------------------------//

        rowMapper(input) {
            var obj = { ...input };
            obj.baseUser = EvalStatus.get(input.baseUser);
            obj.modelUser = EvalStatus.get(input.modelUser);
            return obj;
        }

        //--------------------------------------------------------------------------------//
        
        hasPagination() {
        	return this.conf.pagination != undefined
        }
    }

    return {
        getController: (tableStateName) => {
            return new PresentationListController(tableStateName);
        }
    }
}
