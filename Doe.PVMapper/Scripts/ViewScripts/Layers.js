﻿pvMapper.onReady(function () {

    // EPSG:102113, EPSG:900913, and EPSG:3857 are all the same projection (just different flavors favored by different groups).
    // So, this is (a bit of) a hack to coax OpenLayers to request maps in the native projection of the server
    //TODO: move this to wherever it should ultimately go.
    Ext.override(OpenLayers.Layer.WMS, {
        getFullRequestString: function (newParams, altUrl) {
            var projectionCode = this.map.getProjection();
            if (((typeof (this.epsgOverride)) !== "undefined") && this.epsgOverride.length > 0) {
              this.params.SRS = this.epsgOverride;
            } else {
              this.params.SRS = (projectionCode === "none") ? null : projectionCode;
            }

            return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
        }
    });

    Ext.override(OpenLayers.Layer.ArcGIS93Rest, {
      getFullRequestString: function (newParams, altUrl) {
        var projectionCode = this.map.getProjection();
        if (((typeof (this.epsgOverride)) !== "undefined") && this.epsgOverride.length > 0) {
          this.params.SRS = this.epsgOverride;
        } else {
          this.params.SRS = (projectionCode === "none") ? null : projectionCode;
        }

        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
      }
    });

    //var solarBounds = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508.34);
    var usBounds = new OpenLayers.Bounds(-14020385.47423, 2768854.9122167, -7435794.1105484, 6506319.8467284);

    var resolutions = OpenLayers.Layer.Bing.prototype.serverResolutions.slice(4, 19);
    var osm = new OpenLayers.Layer.OSM("OpenStreetMap", null, { isBaseLayer:true, zoomOffset: 4, resolutions: resolutions });
    $.jGrowl("Adding OpenStreetMap");
    pvMapper.map.addLayer(osm);

    var usBounds = new OpenLayers.Bounds(-14020385.47423, 2768854.9122167, -7435794.1105484, 6506319.8467284);
    pvMapper.map.zoomToExtent(usBounds); // <-- this worked

    //var slope = new OpenLayers.Layer.WMS(
    //        "Slope",
    //        "http://mapsdb.nrel.gov/jw_router/DNI_slope_3/tile",
    //        {
    //            layers: "DNI_slope_3",
    //            format: "image/gif",
    //            transparent: "true",
    //            maxResolution: 156543.0339,
    //        },
    //        {
    //            isBaseLayer: false,
    //            wrapDateLine: true
    //        }
    //    );
    //slope.setOpacity(0.3);
    //slope.setVisibility(false);
    //$.jGrowl("Adding Slope");
    //pvMapper.map.addLayer(slope);

    //Note: this isn't working ...
    //var blueMarble = new OpenLayers.Layer.WMS(
    //        "Global Imagery",
    //        "http://maps.opengeo.org/geowebcache/service/wms", {
    //            layers: "bluemarble",
    //        });
    //pvMapper.map.addLayer(blueMarble);

    //Note: this is hideous...
    //var openLayersWmsThing = new OpenLayers.Layer.WMS(
    //    "OpenLayers",
    //    "http://vmap0.tiles.osgeo.org/wms/vmap0?", {
    //        layers: 'basic',
    //        projection: new OpenLayers.Projection("EPSG:900913")
    //    });
    //openLayersWmsThing.epsgOverride = "EPSG:900913";
    //pvMapper.map.addLayer(openLayersWmsThing);

    var esriWorldTerrain = new OpenLayers.Layer.ArcGIS93Rest(
        "Shaded Relief",
        "http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/export",
        {
            layers: "0",
            format: "gif",
            srs: "3857",
            transparent: "true",
        });
    esriWorldTerrain.setIsBaseLayer(true);
    esriWorldTerrain.epsgOverride = "3857";
    pvMapper.map.addLayer(esriWorldTerrain);


    //Set up the layer for the site polys
    //If a style is applied at the layer level, then 
    //when a label is applied, the engine draws it incorrectly
    //For this reason the style is defined here, but used only when a 
    //feature is added
    var commonStyleMap = new OpenLayers.StyleMap({
        'default': {
            strokeColor: "#00FF00",
            strokeOpacity: 1,
            strokeWidth: 3,
            fillColor: "#FF5500",
            fillOpacity: 0.5,
            pointRadius: 6,
            pointerEvents: "visiblePainted",
            fontColor: "blue",
            fontSize: "12px",
            fontFamily: "Courier New, monospace",
            fontWeight: "bold",
            labelAlign: "cm",
            labelOutlineColor: "white",
            labelOutlineWidth: 1,
            label: "${name}"
        },
        "select": new OpenLayers.Style(null, {
            rules: [
            new OpenLayers.Rule({
                symbolizer: {
                    "Point": {
                        pointRadius: 5,
                        graphicName: "square",
                        fillColor: "white",
                        fillOpacity: 0.25,
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        strokeColor: "#0000ff",
                        label:null
                    },
                    "Line": {
                        strokeWidth: 3,
                        strokeOpacity: 1,
                        strokeColor: "#0000ff"
                    },
                    "Polygon": {
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        fillColor: "#0000ff",
                        strokeColor: "#0000ff"
                    }
                }
            })
            ]
        }),
        "temporary": new OpenLayers.Style(null, {
            rules: [
            new OpenLayers.Rule({
                symbolizer: {
                    "Point": {
                        graphicName: "square",
                        pointRadius: 5,
                        fillColor: "white",
                        fillOpacity: 0.25,
                        strokeWidth: 2,
                        strokeColor: "#0077ff",
                        label: null
                    },
                    "Line": {
                        strokeWidth: 3,
                        strokeOpacity: 1,
                        strokeColor: "#0077ff"
                    },
                    "Polygon": {
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        strokeColor: "#0077ff",
                        fillColor: "#0077ff"
                    }
                }
            })
            ]
        })
    }); 
    
    pvMapper.siteLayer.styleMap = commonStyleMap;
    pvMapper.map.addLayer(pvMapper.siteLayer);

    // set up site selection and highlighting controls
    //var highlightControl = new OpenLayers.Control.SelectFeature(
    //    pvMapper.siteLayer,
    //    {
    //        hover: true,
    //        highlightOnly: true,
    //        renderIntent: "temporary"
    //    });
    //map.addControl(highlightControl);
    //highlightControl.activate();

    //var selectControl = pvMapper.selectControl; // new OpenLayers.Control.SelectFeature(pvMapper.siteLayer);
    //map.addControl(selectControl);
    //selectControl.initLayer(pvMapper.siteLayer); <-- breaks later in selectControl.activate();
    //selectControl.setLayer(pvMapper.siteLayer); <-- breaks immediately
    //selectControl.activate();

    //pvMapper.selectControl = selectControl;

    //var selectSiteControl = new OpenLayers.Control.SelectFeature(
    //    pvMapper.siteLayer,
    //    {
    //        clickout: true, toggle: true,
    //        multiple: false, hover: false,
    //        toggleKey: "ctrlKey", // ctrl key removes from selection
    //        multipleKey: "shiftKey", // shift key adds to selection
    //        //box: true,
    //    });
    //map.addControl(selectSiteControl);

});