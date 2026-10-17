/**
 * Default column processor
 */
class ColumnProcessor {

    constructor(colConf) {
        this.colConf = colConf;
    }

    getColumnKey() {
        return this.colConf.key;
    }

    getColumnConf() {
        return this.colConf;
    }

    isNew() {
        return false;
    }

    setUtil(miUtil) {
        this.miUtil = miUtil;
    }

    processColumn(colDef) {
        var res = {};
        if (this.colConf.label) {
            res.newLabel = {
                columnKey: this.colConf.key,
                newLabel: this.miUtil.getLabel(this.colConf.label)
            };
        }

        if (this.colConf.width) {
            res.newWidth = {
                columnKey: this.colConf.key,
                newWidth: this.colConf.width
            };
        }

        if (this.colConf.hasOwnProperty('renderAsLink')) {
            colDef.renderAsLink = this.colConf.renderAsLink;
        }
        return res;
    }

    shouldUpdateRows() {
        return false;
    }

    processRow(row) {
        return null;
    }
}


class DaySinceColumnProcessor extends ColumnProcessor {

    shouldUpdateRows() {
        return true;
    }

    isNew() {
        return true;
    }

    processRow(row) {
        var dt = row.cells[this.colConf.sourceColumn].metadata.internalValue;
        var days = this.miUtil.getDaysSinceToday(dt);
        return days == -1 ? "Not available" : days;
    }
}

/**
 * Boolean column processor
 */
class BooleanColumnProcessor extends ColumnProcessor {

    shouldUpdateRows() {
        return true;
    }

    processColumn(colDef) {
        colDef.type = "custom";
        colDef.componentTag = "now-highlighted-value";
        return super.processColumn(colDef);
    }

    processRow(row) {
        var key = this.colConf.key;
        var isTrue = row.cells[key].value;
        row.cells[key].componentProps = {
            label: isTrue ? 'True' : 'False',
            showIcon: !isTrue,
            icon: '',
            variant: 'tertiary',
            color: isTrue ? 'rgb(var(--now-color_grouped--green-5))' : 'rgb(var(--now-color_grouped--magenta-4))',
            size: 'sm',
            style: {
                backgroundColor: isTrue ? 'rgb(var(--now-color_grouped--green-0))' : 'rgb(var(--now-color_grouped--magenta-0))'
            }
        };
        return null;
    }
}

class ColumnProcessorFactory {

    constructor(miUtil) {
        this.miUtil = miUtil;
    }

    getProcessor(colConf) {
        var processor;
        switch (colConf.processor) {
            case 'DaySinceColumnProcessor':
                processor = new DaySinceColumnProcessor(colConf);
                break;
            case 'BooleanColumnProcessor':
                processor = new BooleanColumnProcessor(colConf);
                break;
            default:
                processor = new ColumnProcessor(colConf);
        }
        processor.setUtil(this.miUtil);
        return processor;
    }
}


var MICRecordListHelper = Class.create();
MICRecordListHelper.prototype = {

    initialize: function(transformBuilder, transformScriptArgs) {

        this.transformBuilder = transformBuilder;
        this.transformScriptArgs = transformScriptArgs;
        this.columnProcessors = [];
        this.miUtil = new MIUtil();

        Object.assign(transformScriptArgs.columns, {
            columns: []
        });

        this.columnDefMap = {};
        this.transformBuilder.columnDefinitions.columns.forEach(colDef => this.columnDefMap[colDef.key] = colDef);

        var cpf = new ColumnProcessorFactory(this.miUtil);
        this.transformScriptArgs.columns.forEach(colConf => this.addColumnProcessor(cpf.getProcessor(colConf)));

    },

    addColumnProcessor: function(columnProcessor) {
        this.columnProcessors.push(columnProcessor);
    },

    transform: function() {


        var newWidths = [];
        var newLabels = [];

        this.columnProcessors.forEach(processor => {

            var colRes = processor.processColumn(this._getColDef(processor.getColumnKey()));

            if (colRes.newLabel)
                newLabels.push(colRes.newLabel);
            if (colRes.newWidth)
                newWidths.push(colRes.newWidth);

            if (!processor.shouldUpdateRows())
                return;

            var customColumnData = [];
            this.transformBuilder.rowDefinitions.rows.forEach(row => {
                var data = processor.processRow(row);
                if (data != null) {
                    var rowData = this._createRow(row.key, data);
                    customColumnData.push(rowData);
                }
            });

            if (processor.isNew()) {
                this.addColumnData(processor.getColumnConf(), customColumnData);
            }
        });

        this.transformBuilder
            .setColumnWidths(newWidths)
            .editColumnLabels(newLabels);

        return this.transformBuilder.transform();

    },

    addColumnData: function(colConf, columnData) {
        this.transformBuilder.addColumns([{
            index: colConf.index,
            column: {
                key: colConf.key,
                type: colConf.type,
                label: this.miUtil.getLabel(colConf.label)
            },
            columnData: columnData
        }]);
    },

    _getColDef: function(key) {
        return this.columnDefMap[key];
    },

    _createRow: function(rowKey, value) {
        return {
            rowKey: rowKey,
            cellValue: {
                value: value
            }
        };
    },

    type: 'MICRecordListHelper'
};
