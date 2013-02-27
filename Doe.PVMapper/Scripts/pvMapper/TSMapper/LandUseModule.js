/// <reference path="pvMapper.ts" />
/// <reference path="Site.ts" />
/// <reference path="Score.ts" />
/// <reference path="Tools.ts" />
/// <reference path="Options.d.ts" />
/// <reference path="Module.ts" />
var INLModules;
(function (INLModules) {
    var FederalLandsModule = (function () {
        function FederalLandsModule() {
            var myModule = new pvMapper.Module({
                id: "FederalLandsModule",
                author: "Leng Vang, INL",
                version: "0.1.ts",
                activate: function () {
                    addFederalLandsMap();
                },
                deactivate: function () {
                    removeFederalLandsMap();
                },
                destroy: null,
                init: null,
                scoringTools: [
                    {
                        activate: null,
                        deactivate: null,
                        destroy: null,
                        init: null,
                        title: "Federal Lands",
                        description: "Display Federal Lands use boundaries.",
                        onScoreAdded: function (e, score) {
                        },
                        onSiteChange: function (e, s) {
                            ///////////////////////////////////////////getFeatureInfo(s.site);
                            s.updateValue("Federal Lands score");
                        },
                        calculateValueCallback: function (site) {
                            ///////////////////////////////////////////getFeatureInfo(site);
                            return -1;
                        }
                    }
                ],
                infoTools: null
            });
        }
        return FederalLandsModule;
    })();
    INLModules.FederalLandsModule = FederalLandsModule;    
    var federalLandsInstance = new INLModules.FederalLandsModule();
    var federalLandsUrl = "http://dingo.gapanalysisprogram.com/ArcGIS/services/PADUS/PADUS_owner/MapServer/WMSServer";
    var federalLandsLayer;
    var landBounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);
    function addFederalLandsMap() {
        federalLandsLayer = new OpenLayers.Layer.WMS("Federal Lands", federalLandsUrl, {
            maxExtent: landBounds,
            layers: "0",
            layer_type: "polygon",
            transparent: "true",
            format: "image/gif",
            exceptions: "application/vnd.ogc.se_inimage",
            maxResolution: 156543.0339,
            srs: "EPSG:102113"
        }, {
            isBaseLayer: false
        });
        federalLandsLayer.epsgOverride = "EPSG:102113";
        federalLandsLayer.setOpacity(0.3);
        pvMapper.map.addLayer(federalLandsLayer);
    }
    function removeFederalLandsMap() {
        pvMapper.map.removeLayer(federalLandsLayer, false);
    }
    function getFederalLandsInfo() {
    }
    //============================================================
    var CitiesTowns = (function () {
        function CitiesTowns() {
            var _this = this;
            this.landBounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);
            var citiesTownsURL = //"http://services.arcgisonline.com/ArcGIS/rest/services";
            "http://dingo.gapanalysisprogram.com/ArcGIS/services/NAT_LC/1_NVC_class_landuse/MapServer/WMSServer";
            var myModule = new pvMapper.Module({
                id: "CitiesTownsModule",
                author: "Leng Vang, INL",
                version: "0.1.ts",
                activate: function () {
                    _this.addWMSLayerMap('Cities and Towns', citiesTownsURL, "EPSG:102113");
                },
                deactivate: function () {
                    _this.removeWMSLayerMap();
                },
                destroy: null,
                init: null,
                scoringTools: [
                    {
                        activate: null,
                        deactivate: null,
                        destroy: null,
                        init: null,
                        title: "Cities and Towns",
                        description: "Calculate score based on city boundaries.",
                        onScoreAdded: function (e, score) {
                        },
                        onSiteChange: function (e, s) {
                            ///////////////////////////////////////////getFeatureInfo(s.site);
                            s.updateValue("Cities and Towns score");
                        },
                        calculateValueCallback: function (site) {
                            ///////////////////////////////////////////getFeatureInfo(site);
                            return -1;
                        }
                    }
                ],
                infoTools: null
            });
        }
        CitiesTowns.prototype.addWMSLayerMap = function (layerName, layerURL, epsgProjection) {
            var aLayer = new OpenLayers.Layer.WMS(layerName, layerURL, {
                maxExtent: this.landBounds,
                layers: "0",
                layer_type: "polygon",
                transparent: "true",
                format: "image/gif",
                exceptions: "application/vnd.ogc.se_inimage",
                maxResolution: 156543.0339,
                srs: epsgProjection
            }, {
                isBaseLayer: false
            });
            aLayer.epsgOverride = epsgProjection;
            aLayer.setOpacity(0.3);
            pvMapper.map.addLayer(aLayer);
            this.layerMap = aLayer;
        };
        CitiesTowns.prototype.removeWMSLayerMap = function () {
            pvMapper.map.removeLayer(this.layerMap, false);
        };
        return CitiesTowns;
    })();
    INLModules.CitiesTowns = CitiesTowns;    
    var Layer2 = new INLModules.CitiesTowns();
    //============================================================
    var SolarMapper = (function () {
        function SolarMapper() {
            var _this = this;
            this.landBounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);
            var layerURL = "http://solarmapper.anl.gov/ArcGIS/rest/services/Solar_Mapper_SDE/MapServer/export";
            var myModule = new pvMapper.Module({
                id: "SolarMapperModule",
                author: "Leng Vang, INL",
                version: "0.1.ts",
                activate: function () {
                    //this.addRESTLayerMap('Solar Mapper', layerURL);
                    addThatMapThing();
                },
                deactivate: function () {
                    _this.removeRESTLayerMap();
                },
                destroy: null,
                init: null,
                scoringTools: [
                    {
                        activate: null,
                        deactivate: null,
                        destroy: null,
                        init: null,
                        title: "Solar Mapper",
                        description: "Calculate score based on solar radiation.",
                        onScoreAdded: function (e, score) {
                        },
                        onSiteChange: function (e, s) {
                            ///////////////////////////////////////////getFeatureInfo(s.site);
                            s.updateValue("Solar radiation score");
                        },
                        calculateValueCallback: function (site) {
                            ///////////////////////////////////////////getFeatureInfo(site);
                            return -1;
                        }
                    }
                ],
                infoTools: null
            });
        }
        SolarMapper.prototype.addRESTLayerMap = function (layerName, layerURL, esriProjection) {
            var params = new OpenLayers.WMSParams();
            params.setFormat("png");
            params.setLayers("show:0");
            //params.setLayers("1,58,62");
            params.setIsTransparent(true);
            var aLayer = new OpenLayers.Layer.ArcGIS93Rest(layerName, layerURL, params);
            aLayer.epsgOverride = esriProjection;
            aLayer.setIsBaseLayer(false);
            aLayer.setOpacity(0.3);
            pvMapper.map.addLayer(aLayer);
            this.layerMap = aLayer;
        };
        SolarMapper.prototype.removeRESTLayerMap = function () {
            pvMapper.map.removeLayer(this.layerMap, false);
        };
        return SolarMapper;
    })();
    INLModules.SolarMapper = SolarMapper;    
    var solarMapper = new SolarMapper();
    function addThatMapThing() {
        var facilities = new OpenLayers.Layer.ArcGIS93Rest("Some layer from Solarmapper", /////////////////////////////////////////////////////////"http://solarmapper.anl.gov/ArcGIS/rest/services/Solar_Mapper_SDE/MapServer/62",
        "http://solarmapper.anl.gov/ArcGIS/rest/services/Solar_Mapper_SDE/MapServer/export", //?bbox=-14608729.4935068,4127680.66361813,-10533172.1554586,5562319.83205435
        {
            layers: "show:0",
            format: "gif",
            srs: "3857",
            transparent: //"102100",
            "true"
        }, //SRS: "EPSG:4326"
        {
            isBaseLayer: false
        });
        facilities.epsgOverride = "3857";
        //facilities.setOpacity(0.3);
        //$.jGrowl("Adding PV Solar Facility Locations");
        pvMapper.map.addLayer(facilities);
    }
    //var facilities = new OpenLayers.Layer.ArcGIS93Rest(
    //          "Solar Facilities",
    //          /////////////////////////////////////////////////////////"http://solarmapper.anl.gov/ArcGIS/rest/services/Solar_Mapper_SDE/MapServer/62",
    //          "http://solarmapper.anl.gov/ArcGIS/rest/services/Solar_Mapper_SDE/MapServer/export", //?bbox=-14608729.4935068,4127680.66361813,-10533172.1554586,5562319.83205435
    //          {
    //            layers: "show:1,58,62",
    //            format: "gif",
    //            srs: "900913"//,
    //            //transparent: "true",
    //            //SRS: "EPSG:4326"
    //          },
    //          { isBaseLayer: false }
    //          );
    //  //facilities.setOpacity(0.3);
    //$.jGrowl("Adding PV Solar Facility Locations");
    //pvMapper.map.addLayer(facilities);
    })(INLModules || (INLModules = {}));
//@ sourceMappingURL=LandUseModule.js.map