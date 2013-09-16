﻿/// <reference path="Site.ts" />
/// <reference path="Event.ts" />
var pvMapper;
(function (pvMapper) {
    var SiteManager = (function () {
        function SiteManager() {
            this.siteAdded = new pvMapper.Event();
            this.siteRemoved = new pvMapper.Event();
            this.siteLoaded = new pvMapper.Event();
            this.sites = [];
        }
        SiteManager.prototype.getSites = function () {
            return this.sites;
        };

        //public getSite(index: string): Site;
        //public getSite(index: any): Site {
        SiteManager.prototype.getSite = function (index) {
            return this.sites[index];
        };

        SiteManager.prototype.addSite = function (site) {
            this.sites.push(site);
            this.siteAdded.fire(site, site);
        };
        SiteManager.prototype.loadSite = function (site) {
            this.sites.push(site);

            //This function can be used to make specific load commands for various modules
            //
            this.siteAdded.fire(site, site);
        };

        SiteManager.prototype.createSite = function (feature) {
            if (console)
                console.log("Creating site");
            var aSite = new pvMapper.Site(feature);
            this.sites.push(aSite);
            this.siteAdded.fire(aSite, feature);
        };

        /**
        Removes a site from the sites array.
        */
        SiteManager.prototype.removeSite = function (site) {
            //find the site
            var idx = this.sites.indexOf(site);
            if (idx !== -1) {
                this.sites.splice(idx, 1);
                this.siteRemoved.fire(site, site);
            }
        };

        /**
        Removes a site from the sites array.
        */
        SiteManager.prototype.removeSiteById = function (siteId) {
            var i;
            for (i = 0; i < this.sites.length; i++) {
                if (this.sites[i].id == siteId)
                    break;
            }

            if (i < this.sites.length) {
                var site = this.sites.splice(i, 1)[0];
                this.siteRemoved.fire(site, site);
            }
        };

        /**
        handles the change event for the features on the sitelayer. will fire the sites change event if the
        feature that changed is a project site
        @parameter event {openlayers.event object with a feature property that is a reference to the feature that changed
        @See http://dev.openlayers.org/apidocs/files/OpenLayers/Layer/Vector-js.html#OpenLayers.Layer.Vector.events
        */
        SiteManager.prototype.featureChangedHandler = function (event) {
            if (console)
                console.log("Feature change detected by the site manager");
            if (event.feature && event.feature.site) {
                // try {
                event.feature.site.changeEvent.fire(event.feature.site, event);
                if (console)
                    console.log("Fired the change event for site: " + event.feature.site.name);
            } else {
                if (console)
                    console.log("The feature was not a site");
            }
        };
        return SiteManager;
    })();
    pvMapper.SiteManager = SiteManager;

    //instantiate siteManager object.
    pvMapper.siteManager = new SiteManager();
})(pvMapper || (pvMapper = {}));
