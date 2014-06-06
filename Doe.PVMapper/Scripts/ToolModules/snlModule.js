///// <reference path="pvMapper.ts" />
///// <reference path="Site.ts" />
///// <reference path="Score.ts" />
///// <reference path="Tools.ts" />
///// <reference path="Options.d.ts" />
///// <reference path="Module.ts" />
///// <reference path="ScoreUtility.ts" />
///// <reference path="modulemanager.ts" />
//var INLModules;
//(function (INLModules) {
//    var configProperties = {
//        maxSearchDistanceInKM: 30,
//        minimumVoltage: 230,
//        maximumVoltage: 765
//    };

//    var myToolLine;

//    var propsWindow;

//    Ext.onReady(function () {
//        var comboConfig = {
//            //fieldLabel: 'Voltage',
//            //name: 'voltage',
//            allowBlank: false,
//            displayField: 'display',
//            valueField: 'value',
//            store: {
//                fields: ['display', 'value'],
//                data: [
//                    { 'display': '230 kV', 'value': 230 },
//                    { 'display': '345 kV', 'value': 345 },
//                    { 'display': '500 kV', 'value': 500 },
//                    { 'display': '768 kV', 'value': 765 }
//                ]
//            },
//            typeAhead: true,
//            mode: 'local',
//            triggerAction: 'all',
//            selectOnFocus: true
//        };

//        var propsGrid = Ext.create('Ext.grid.property.Grid', {
//            nameText: 'Properties Grid',
//            minWidth: 300,
//            //autoHeight: true,
//            source: configProperties,
//            customRenderers: {
//                maxSearchDistanceInKM: function (v) {
//                    return v + " km";
//                },
//                minimumVoltage: function (v) {
//                    return v + " kV";
//                },
//                maximumVoltage: function (v) {
//                    return v + " kV";
//                }
//            },
//            propertyNames: {
//                maxSearchDistanceInKM: "search distance",
//                minimumVoltage: 'minimum voltage ',
//                maximumVoltage: 'maximum voltage '
//            },
//            //viewConfig: {
//            //    forceFit: true,
//            //    scrollOffset: 2 // the grid will never have scrollbars
//            //},
//            customEditors: {
//                'minimumVoltage': Ext.create('Ext.form.ComboBox', comboConfig),
//                'maximumVoltage': Ext.create('Ext.form.ComboBox', comboConfig)
//            }
//        });

//        // display a cute little properties window describing our doodle here.
//        //Note: this works only as well as our windowing scheme, which is to say poorly
//        //var propsWindow = Ext.create('MainApp.view.Window', {
//        propsWindow = Ext.create('Ext.window.Window', {
//            title: "Configure Nearest Transmission Line Tool",
//            closeAction: "hide",
//            layout: "fit",
//            items: [
//                propsGrid
//            ],
//            listeners: {
//                beforehide: function () {
//                    // recalculate all scores
//                    myToolLine.scores.forEach(updateScore);
//                }
//            },
//            buttons: [
//                {
//                    xtype: 'button',
//                    text: 'OK',
//                    handler: function () {
//                        propsWindow.hide();
//                    }
//                }
//            ],
//            constrain: true
//        });
//    });

//    var SnlModule = (function () {
//        function SnlModule() {
//            var myModule = new pvMapper.Module({
//                id: "SnlModule",
//                author: "Scott Brown, INL",
//                version: "0.2.ts",
//                iconURL: "http://www.iconshock.com/img_jpg/MODERN/general/jpg/16/home_icon.jpg",
//                activate: function () {
//                    addAllMaps();
//                },
//                deactivate: function () {
//                    removeAllMaps();
//                },
//                destroy: null,
//                init: null,
//                scoringTools: [
//                    {
//                        activate: null,
//                        deactivate: null,
//                        destroy: null,
//                        init: null,
//                        showConfigWindow: function () {
//                            myToolLine = this;
//                            propsWindow.show();
//                        },
//                        title: SnlModule.title,
//                        category: SnlModule.category,
//                        description: SnlModule.description,
//                        longDescription: SnlModule.longDescription,
//                        //onScoreAdded: function (e, score: pvMapper.Score) {
//                        //    scores.push(score);
//                        //},
//                        onSiteChange: function (e, score) {
//                            updateScore(score);
//                        },
//                        // having any nearby line is much better than having no nearby line, so let's reflect that.
//                        scoreUtilityOptions: {
//                            functionName: "linear3pt",
//                            functionArgs: new pvMapper.ThreePointUtilityArgs(0, 1, (configProperties.maxSearchDistanceInKM - 1), 0.3, configProperties.maxSearchDistanceInKM, 0, "km", "Distance to nearest transmission line", "Score", "Prefer sites closer to a transmission line.")
//                        },
//                        weight: 10
//                    }
//                ],
//                infoTools: null
//            });
//            this.getModuleObj = function () {
//                return myModule;
//            };
//        }
//        SnlModule.title = "Nearest Transmission Line";
//        SnlModule.category = "Power Infrastructure";
//        SnlModule.description = "Distance from a site boundary to the nearest known transmission line, using data from SNL";
//        SnlModule.longDescription = '<p>This tool reports the distance from a site to the nearest known transmission line. The line is identified using SNL data. See SNL for more information (snl.com).</p>';
//        return SnlModule;
//    })();
//    INLModules.SnlModule = SnlModule;

//    //All private functions and variables go here. They will be accessible only to this module because of the AEAF (Auto-Executing Anonomous Function)
//    var snlLineExportUrl = "https://maps.snl.com/arcgis/rest/services/SNLMaps/Power/MapServer/export";
//    var snlLineQueryUrl = "https://maps.snl.com/arcgis/rest/services/SNLMaps/Power/MapServer/5/query";

//    //declare var Ext: any;
//    var mapLayer;

//    function addAllMaps() {
//        mapLayer = new OpenLayers.Layer.ArcGIS93Rest("Power Lines", snlLineExportUrl, {
//            layers: "show:5",
//            format: "gif",
//            srs: "3857",
//            transparent: "true"
//        });
//        mapLayer.setOpacity(0.3);
//        mapLayer.epsgOverride = "3857";
//        mapLayer.setVisibility(false);

//        pvMapper.map.addLayer(mapLayer);
//        //pvMapper.map.setLayerIndex(mapLayer, 0);
//    }

//    function removeAllMaps() {
//        pvMapper.map.removeLayer(mapLayer, false);
//    }

//    function updateScore(score) {
//        var maxSearchDistanceInMeters = configProperties.maxSearchDistanceInKM * 1000;

//        // use a genuine JSONP request, rather than a plain old GET request routed through the proxy.
//        var jsonpProtocol = new OpenLayers.Protocol.Script({
//            url: snlLineQueryUrl,
//            params: {
//                f: "json",
//                //Note: this is stupid. ONE of the lines has an unescaped '\' character in its name. Bad ESRI.
//                where: "Voltage >= " + configProperties.minimumVoltage + " AND Voltage <= " + configProperties.maximumVoltage + " AND Line_Name NOT LIKE '%\\N%'",
//                //TODO: should request specific out fields, instead of '*' here.
//                outFields: "*",
//                //returnGeometry: false,
//                geometryType: "esriGeometryEnvelope",
//                //TODO: scaling is problematic - should use a constant-size search window
//                geometry: new OpenLayers.Bounds(score.site.geometry.bounds.left - maxSearchDistanceInMeters - 1000, score.site.geometry.bounds.bottom - maxSearchDistanceInMeters - 1000, score.site.geometry.bounds.right + maxSearchDistanceInMeters + 1000, score.site.geometry.bounds.top + maxSearchDistanceInMeters + 1000).toBBOX(0, false)
//            },
//            format: new OpenLayers.Format.EsriGeoJSON(),
//            parseFeatures: function (data) {
//                return this.format.read(data);
//            },
//            callback: function (response) {
//                if (response.success()) {
//                    var closestFeature = null;
//                    var minDistance = maxSearchDistanceInMeters;

//                    if (response.features) {
//                        for (var i = 0; i < response.features.length; i++) {
//                            var distance = score.site.geometry.distanceTo(response.features[i].geometry);
//                            var voltage = response.features[i].attributes.Voltage;
//                            if (distance < minDistance && voltage >= configProperties.minimumVoltage && voltage <= configProperties.maximumVoltage) {
//                                minDistance = distance;
//                                closestFeature = response.features[i];
//                            }
//                        }
//                    }
//                    if (closestFeature !== null) {
//                        score.popupMessage = (minDistance / 1000).toFixed(1) + " km to " + closestFeature.attributes.Voltage + " kV line operated by " + closestFeature.attributes.Company;
//                        score.updateValue(minDistance / 1000);
//                    } else {
//                        var targetKv = (configProperties.minimumVoltage !== configProperties.maximumVoltage) ? (configProperties.minimumVoltage + "-" + configProperties.maximumVoltage) : ("" + configProperties.minimumVoltage);

//                        score.popupMessage = "No " + targetKv + " kV line found within " + configProperties.maxSearchDistanceInKM + " km";
//                        score.updateValue(configProperties.maxSearchDistanceInKM);
//                    }
//                } else {
//                    score.popupMessage = "Request error " + response.error.toString();
//                    score.updateValue(Number.NaN);
//                }
//            }
//        });

//        var response = jsonpProtocol.read();
//    }
//})(INLModules || (INLModules = {}));

//if (typeof (selfUrl) == 'undefined')
//    var selfUrl = $('script[src$="snlModule.js"]').attr('src');
//if (typeof (isActive) == 'undefined')
//    var isActive = true;
//pvMapper.moduleManager.registerModule(INLModules.SnlModule.category, INLModules.SnlModule.title, INLModules.SnlModule, isActive, selfUrl);
