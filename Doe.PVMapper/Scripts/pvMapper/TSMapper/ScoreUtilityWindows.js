﻿var pvMapper;
(function (pvMapper) {
    //Created for static access from more than one function def
    var ScoreUtilityWindows = (function () {
        function ScoreUtilityWindows() {
        }
        ScoreUtilityWindows.basicWindow = {
            _xArgs: {},
            _scoreObj: {},
            setup: function (panel, scoreObj) {
                var _this = this;
                _this._scoreObj = scoreObj;
                var args = scoreObj.functionArgs;
                var fn = pvMapper.UtilityFunctions[scoreObj.functionName].fn;
                var xBounds = pvMapper.UtilityFunctions[scoreObj.functionName].xBounds;

                var board;
                var fnOfy;
                _this._xArgs = Ext.Object.merge({}, args);

                _this.functionName = scoreObj.functionName;
                var gridPanel;
                var cbxFunctions;
                function loadboard() {
                    //Extras.loadExternalCSS("http://jsxgraph.uni-bayreuth.de/distrib/jsxgraph.css");
                    Extras.getScript("https://cdnjs.cloudflare.com/ajax/libs/jsxgraph/0.97/jsxgraphcore.js", function () {
                        var bounds = xBounds(args);

                        // ensure that the buffer is > 0 (bounds being equal is a valid case for a step function)
                        var buffer = (bounds[0] == bounds[1]) ? 1 : (bounds[1] - bounds[0]) / 10;
                        bounds[0] -= buffer;
                        bounds[1] += buffer * 1.5;

                        board = JXG.JSXGraph.initBoard('FunctionBox-body', {
                            boundingbox: [bounds[0], 108, bounds[1], -8],
                            axis: true,
                            showCopyright: false,
                            showNavigation: true
                        });

                        //TODO: should we replace this with ScoreUtility.run(x) ...?
                        fnOfy = board.create('functiongraph', function (x) {
                            var y = fn(x, _this._xArgs);
                            return Math.max(0, Math.min(1, y)) * 100;
                        }, {
                            strokeWidth: 3,
                            strokeColor: "red"
                        });

                        //draggable lines querying reflecting values.  By using the fn function to query the intersecting Y value, this should work for any utility function.
                        var bb = board.getBoundingBox();

                        var dx;
                        if ((_this._xArgs.metaInfo.vline == undefined) || (_this._xArgs.metaInfo.vline <= 0)) {
                            dx = ((bb[2] - bb[0]) / 2.0) + bb[0];
                            _this._xArgs.metaInfo.vline = dx;
                        } else
                            dx = _this._xArgs.metaInfo.vline;

                        var dy = fn(dx, _this._xArgs) * 100;
                        var vline = board.create('segment', [[dx, 0], [dx, dy]], { name: dx.toFixed(1) + " " + _this._xArgs.metaInfo.unitSymbol, withLabel: true, strokeColor: "blue", dash: 2, strokeOpacity: 0.15 });
                        var scoreColor = pvMapper.getColorForScore(dy);
                        var hline = board.create('segment', [[0, dy], [vline.point1.X(), dy]], { name: "Score: " + dy.toFixed(0), withLabel: true, strokeColor: scoreColor, dash: 2, strokeWidth: 4, strokeOpacity: 1 });

                        //TODO: make the line move on mouseover, rather than on drag (it's more intuitive)
                        //board.on("mousemove", function (e) {
                        //    //TODO: translate coordinates from event e to score function (x,y)
                        //    //      OR, find a better event to hook into which has translated coordinates
                        //    //      then, do the same line move doodle as below...
                        //});
                        vline.on("drag", function (e) {
                            board.suspendUpdate();

                            //var bb = board.getBoundingBox();
                            _this._xArgs.metaInfo.vline = vline.point1.X();
                            var y = fn(vline.point1.X(), _this._xArgs);
                            y = Math.max(0, Math.min(1, y)) * 100;

                            vline.labelColor("red");
                            vline.setLabelText((vline.point1.X()).toFixed(1) + " " + _this._xArgs.metaInfo.unitSymbol);

                            vline.point1.moveTo([vline.point1.X(), 0]);
                            vline.point2.moveTo([vline.point1.X(), y]);

                            hline.labelColor("red");
                            hline.setLabelText("Score: " + y.toFixed(0));
                            hline.visProp.strokecolor = pvMapper.getColorForScore(y);

                            hline.point1.moveTo([0, y]);
                            hline.point2.moveTo([vline.point1.X(), y]);
                            board.unsuspendUpdate();
                        });

                        //do this just to prevent the horizontal line from dragging.
                        hline.on("drag", function (e) {
                            board.suspendUpdate();
                            var y = fn(vline.point1.X(), _this._xArgs) * 100;
                            hline.point1.moveTo([0, y]);
                            hline.point2.moveTo([vline.point1.X(), y]);
                            board.unsuspendUpdate();
                        });

                        // updates guide lines after the function is altered in some way
                        var updateGuideLines = function () {
                            board.suspendUpdate();
                            var y = fn(vline.point1.X(), _this._xArgs);
                            y = Math.max(0, Math.min(1, y)) * 100;

                            vline.point2.moveTo([vline.point1.X(), y]);
                            hline.setLabelText("Score: " + y.toFixed(2));
                            hline.point1.moveTo([0, y]);
                            hline.point2.moveTo([vline.point1.X(), y]);
                            hline.visProp.strokecolor = pvMapper.getColorForScore(y);
                            board.unsuspendUpdate();
                        };

                        if (_this._xArgs.metaInfo.name == "ThreePointUtilityArgs") {
                            if (_this._xArgs.points != undefined && _this._xArgs.points.length > 0) {
                                //create the points
                                // var seg: any[] = new Array<any>();
                                _this._xArgs.points.forEach(function (p, idx) {
                                    var point = board.create('point', [_this._xArgs[p].x, _this._xArgs[p].y * 100], { name: p, size: 3 });

                                    //   seg.push(point);
                                    point.on("drag", function (e) {
                                        _this._xArgs[p].x = point.X();
                                        _this._xArgs[p].y = point.Y() / 100;
                                        updateGuideLines();
                                    });
                                });
                            }
                        } else if (_this._xArgs.metaInfo.name == "MinMaxUtilityArgs") {
                            var point1 = board.create('point', [_this._xArgs.minValue, 0], { name: 'Min', size: 3 });
                            point1.on("drag", function (e) {
                                _this._xArgs.minValue = point1.X();
                                board.update();
                                point1.moveTo([point1.X(), 0]);
                                gridPanel.setSource(_this._xArgs);
                                updateGuideLines();
                            });

                            var point2 = board.create('point', [_this._xArgs.maxValue, 100], { name: 'Max', size: 3 });
                            point2.on("drag", function (e) {
                                _this._xArgs.maxValue = point2.X();
                                board.update();
                                point2.moveTo([point2.X(), 100]);
                                gridPanel.setSource(_this._xArgs);
                                updateGuideLines();
                            });
                        } else if (_this._xArgs.metaInfo.name == "SinusoidalUtilityArgs") {
                            var dmin = fn(_this._xArgs.minValue, _this._xArgs) * 100;
                            var dmax = fn(_this._xArgs.maxValue, _this._xArgs) * 100;
                            var dtar = fn(_this._xArgs.target, _this._xArgs) * 100;

                            var minPoint = board.create('point', [_this._xArgs.minValue, dmin], { name: 'Min', size: 3 });
                            var maxPoint = board.create('point', [_this._xArgs.maxValue, dmax], { name: 'Max', size: 3 });
                            var targetPoint = board.create('point', [_this._xArgs.target, dtar], { name: 'target', size: 3 });
                            minPoint.on("drag", function (e) {
                                var x = minPoint.X();
                                if (x > targetPoint.X())
                                    x = targetPoint.X();
                                _this._xArgs.minValue = x;
                                board.update();
                                minPoint.moveTo([x, dmin]);
                                gridPanel.setSource(_this._xArgs);
                                updateGuideLines();
                            });
                            maxPoint.on("drag", function (e) {
                                var x = maxPoint.X();
                                if (x < targetPoint.X())
                                    x = targetPoint.X();
                                _this._xArgs.maxValue = x;
                                board.update();
                                maxPoint.moveTo([x, dmax]);
                                gridPanel.setSource(_this._xArgs);
                                updateGuideLines();
                            });
                            targetPoint.on("drag", function (e) {
                                var x = targetPoint.X();
                                if (x < minPoint.X())
                                    x = minPoint.X();
                                if (x > maxPoint.X())
                                    x = maxPoint.X();
                                _this._xArgs.target = x;
                                board.update();
                                targetPoint.moveTo([x, dtar]);
                                gridPanel.setSource(_this._xArgs);
                                updateGuideLines();
                            });
                        }
                    });
                }

                panel.removeAll();

                var equStore = Ext.create('Ext.data.Store', {
                    fields: ['Name', 'Function'],
                    data: [
                        { "Name": "3 points", "Function": "ThreePointUtilityArgs" },
                        { "Name": "Min-Max", "Function": "MinMaxUtilityArgs" },
                        { "Name": "Less-More", "Function": "SinusoidalUtilityArgs" }
                    ]
                });

                cbxFunctions = Ext.create('Ext.form.field.ComboBox', {
                    fieldLabel: 'Utility Function',
                    store: equStore,
                    queryMode: 'local',
                    displayField: 'Name',
                    valueField: 'Function',
                    //autoLoad: true,
                    renderTo: Ext.getBody(),
                    listeners: {
                        afterrender: function (combo) {
                            if ((typeof _this !== "undefined") && (typeof _this._xArgs !== "undefined")) {
                                this.setValue(_this._xArgs.metaInfo.name, true);
                                this.fireEvent('select', this);
                            }
                        },
                        select: function (combo, records, eopts) {
                            if (combo.value != _this._xArgs.metaInfo.name) {
                                //NOTE: merge doesn't copy programmatic add variables,  Ext.apply does, it required param1 to be and existing object where properties can copy onto.
                                var sobj = Ext.apply({}, scoreObj);
                                switch (combo.value) {
                                    case 'ThreePointUtilityArgs':
                                        if ((sobj.functionName != undefined) && (_this._xArgs != undefined))
                                            sobj.fCache[sobj.functionName] = _this._xArgs;
                                        sobj.functionName = 'linear3pt';
                                        var tpArgs;
                                        if (sobj.fCache[sobj.functionName] != undefined)
                                            tpArgs = sobj.fCache[sobj.functionName]; else {
                                            tpArgs = new pvMapper.ThreePointUtilityArgs(0, 0.5, 180, 1, 360, 0.5, "degrees");
                                            tpArgs.metaInfo.vline = 180;
                                        }
                                        sobj.functionArgs = tpArgs;
                                        var utilityFn = pvMapper.UtilityFunctions[sobj.functionName];
                                        utilityFn.windowSetup.apply(utilityFn, [panel, sobj]);
                                        _this._scoreObj = sobj;
                                        _this.functionName = sobj.functionName;
                                        _this._xArgs = sobj.functionArgs;

                                        break;
                                    case 'MinMaxUtilityArgs':
                                        if ((sobj.functionName != undefined) && (_this._xArgs != undefined))
                                            sobj.fCache[sobj.functionName] = _this._xArgs;
                                        sobj.functionName = 'linear';
                                        var mmArgs;
                                        if (sobj.fCache[sobj.functionName] != undefined)
                                            mmArgs = sobj.fCache[sobj.functionName]; else {
                                            mmArgs = new pvMapper.MinMaxUtilityArgs(10, 0, "degrees");
                                            mmArgs.metaInfo.vline = 5;
                                        }
                                        sobj.functionArgs = mmArgs;
                                        var utilityFn = pvMapper.UtilityFunctions[sobj.functionName];
                                        utilityFn.windowSetup.apply(utilityFn, [panel, sobj]);
                                        _this._scoreObj = sobj;
                                        _this.functionName = sobj.functionName;
                                        _this._xArgs = sobj.functionArgs;

                                        break;
                                    case 'SinusoidalUtilityArgs':
                                        if ((sobj.functionName != undefined) && (_this._xArgs != undefined))
                                            sobj.fCache[sobj.functionName] = _this._xArgs;
                                        sobj.functionName = 'sinusoidal';
                                        var sArgs;
                                        if (sobj.fCache[sobj.functionName] != undefined)
                                            sArgs = sobj.fCache[sobj.functionName]; else {
                                            sArgs = new pvMapper.SinusoidalUtilityArgs(0, 100, 50, 0.50, "degrees");
                                            sArgs.metaInfo.vline = 50;
                                        }
                                        sobj.functionArgs = sArgs;
                                        var utilityFn = pvMapper.UtilityFunctions[sobj.functionName];
                                        utilityFn.windowSetup.apply(utilityFn, [panel, sobj]);
                                        _this._scoreObj = sobj;
                                        _this.functionName = sobj.functionName;
                                        _this._xArgs = sobj.functionArgs;

                                        break;
                                }
                            }
                        }
                    }
                });

                //var funcPanel = Ext.create('Ext.panel.Panel', {
                //    layout: {
                //        align: 'center',
                //        pack: 'center',
                //        type: 'vbox'
                //    },
                //    items: cbxFunctions
                //});
                //Note: Removed this for the demo, as it is not stable or bug-free.
                //      Bug fixes exist for this on the Dev branch, but those fixes also cause bugs (due to merge issues, mostly).
                //      Until there is time to sort out the Dev branch, this is the safest solution available.
                //panel.add(cbxFunctions);
                gridPanel = Ext.create('Ext.grid.property.Grid', {
                    source: _this._xArgs,
                    tipValue: null,
                    viewConfig: {
                        deferEmptyText: false,
                        emptyText: '<center><i>no editable fields</i></center>'
                    },
                    listeners: {
                        edit: function (editor, e, eOpts) {
                            //Update the xArgs
                            //Already handled by the prperty grid :)
                            board.update();
                        },
                        propertychange: function (source, recordId, value, oldValue, eOpts) {
                            board.update();
                        },
                        //======= Add to support tool tip =============
                        itemmouseenter: function (grid, record, item, index, e, opts) {
                            if (this.source.metaInfo != undefined) {
                                //TODO: this...?
                                //this.tipValue = pvMapper.UtilityFunctions[this.source.functionName].tips[record.internalId];
                                this.tipValue = this.source.metaInfo[record.internalId + "Tip"];
                            } else {
                                this.tipValue = "Property " + record.internalId;
                            }
                            this.tip.update(this.tipValue);
                        },
                        itemmouseleave: function (grid, record, item, index, e, opts) {
                            this.tipValue = null;
                        },
                        render: function (grid, opts) {
                            var _this = this;
                            grid.tip = Ext.create('Ext.tip.ToolTip', {
                                target: grid.el,
                                delegate: grid.cellSelector,
                                trackMouse: true,
                                renterTo: Ext.getBody(),
                                listeners: {
                                    beforeshow: function (tip) {
                                        tip.update(_this.tipValue);
                                    }
                                }
                            });
                        }
                    }
                });
                panel.add(gridPanel);
                panel.add({
                    xtype: 'panel',
                    layout: {
                        align: 'center',
                        pack: 'center',
                        type: 'vbox'
                    },
                    items: {
                        id: 'FunctionBox',
                        xtype: 'panel',
                        layout: 'fit',
                        border: true,
                        width: 200,
                        height: 225,
                        padding: 5
                    },
                    listeners: {
                        afterrender: function (sender, eOpts) {
                            loadboard();
                        }
                    }
                });
                panel.doLayout();
            },
            okhandler: function (panel, args) {
                args.functionArgs = this._xArgs;
                args.functionName = this.functionName;
            }
        };
        return ScoreUtilityWindows;
    })();
    pvMapper.ScoreUtilityWindows = ScoreUtilityWindows;
})(pvMapper || (pvMapper = {}));
