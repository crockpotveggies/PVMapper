/// <reference path="IEventTypes.ts" />
/// <reference path="ScoreUtility.ts" />
/// <reference path="Score.ts" />
/// <reference path="Site.ts" />
/// <reference path="Options.d.ts" />
/// <reference path="SiteManager.ts" />
/// <reference path="Tools.ts" />
// Module
var pvMapper;
(function (pvMapper) {
    //  import pvM = pvMapper;
    // Class
    var ScoreLine = (function () {
        // Constructor
        function ScoreLine(options) {
            var _this = this;
            this.scores = new Array();
            //public updateScore: ICallback = options.updateScoreCallback;
            this.active = true;
            //public scoreAddedEvent: pvMapper.Event = new pvMapper.Event();
            this.scoreChangeEvent = new pvMapper.Event();
            this.updatingScoresEvent = new pvMapper.Event();
            //console.log("Adding a scoreline for " + options.title);
            this.self = this;
            this.title = (typeof (options.title) === 'string') ? options.title : 'Unnamed Tool';

            if (options.description) {
                this.description = options.description;
            }
            this.category = (typeof (options.category) === 'string') ? options.category : 'Other';

            if ($.isFunction(options.onSiteChange)) {
                this.onSiteChange = function () {
                    return options.onSiteChange.apply(_this, arguments);
                };
            }

            if ($.isFunction(options.getStarRatables)) {
                this.getStarRatables = function () {
                    return options.getStarRatables.apply(_this, arguments);
                };
            }

            if ($.isFunction(options.showConfigWindow)) {
                this.showConfigWindow = function () {
                    options.showConfigWindow.apply(_this, arguments);
                };
            }

            this.valueChangeHandler = function (event) {
                //Update the utility score for the score that just changed it's value.
                event.score.setUtility(_this.getUtilityScore(event.newValue));

                _this.scoreChangeEvent.fire(_this, event);
            };

            //if ($.isFunction(options.onScoreAdded)) {
            //    this.scoreAddedEvent.addHandler(options.onScoreAdded);
            //}
            pvMapper.siteManager.siteAdded.addHandler(function (event) {
                //if (console) console.log("Siteadded event detected in scoreline" + name);
                _this.addScore(event);
            });

            pvMapper.siteManager.siteRemoved.addHandler(function (site) {
                _this.onSiteRemove(site);
            });

            if (options.scoreUtilityOptions == undefined) {
                options.scoreUtilityOptions = {
                    functionName: "random",
                    functionArgs: { className: "Random" },
                    iconURL: null
                };
            }
            ;

            this.utilargs = new pvMapper.MinMaxUtilityArgs(0, 10, "", "");
            this.scoreUtility = new pvMapper.ScoreUtility(options.scoreUtilityOptions);

            //Set the default weight of the tool
            this.weight = (typeof options.weight === "number") ? options.weight : 10;

            //this.loadScore();
            this.loadAllSites();
        }
        ScoreLine.prototype.loadScore = function () {
            return;

            if (!window.indexedDB) {
                window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
                return null;
            }

            var db;
            var idbVersion = 1;
            var request = indexedDB.open("PVMapperScores", idbVersion);
            request.onerror = function (even) {
                alert("This browser is not allowed to maintain local storage, error code: ");
            };

            request.onsuccess = function (event) {
                if (this.title == undefined)
                    return null;

                db = event.target.result;

                var trans = db.transaction(["PVMapperScore"], "readwrite");
                var store = trans.objectStore("PVMapperScore");
                var req = store.get(this.title);
                req.onerror = function (event) {
                    console.log("Error getting local data for " + this.title);
                };
                req.onsuccess = function (event) {
                    var rdb = event.target.result;
                    this.title = rdb.title;
                    this.description = rdb.description;
                    this.category = rdb.category;
                    this.weight = rdb.weight;
                    this.active = rdb.active;
                    this.scores = rdb.scores;
                    return event;
                };
            };
            return event;
        };

        ScoreLine.prototype.saveScore = function () {
            var me = this;

            if (!window.indexedDB) {
                window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
                return null;
            }

            var db;
            var idbVersion = 1;
            var request = window.indexedDB.open("PVMapperScores", idbVersion);
            request.onerror = function (even) {
                alert("This browser is not allowed to maintain local storage, error code: ");
                return event;
            };

            request.onsuccess = function (event) {
                db = event.target.result;

                //var trans = db.transaction(["PVMapperScore"],"readwrite");
                var store = db.createObjectStore("PVMapperScore", { autoIncrement: true });
                store.createIndex("titleIndex", "title", { unique: true });

                store.add({
                    title: me.title,
                    description: me.description,
                    category: me.category,
                    weight: me.weight,
                    active: me.active,
                    scores: me.scores
                });
                return 0;
            };
            return event;
        };

        ScoreLine.prototype.getUtilityScore = function (x) {
            return this.scoreUtility.run(x);
        };
        ScoreLine.prototype.getWeight = function () {
            return this.weight;
        };
        ScoreLine.prototype.setWeight = function (value) {
            this.weight = value;
            this.scoreChangeEvent.fire(self, undefined);
        };

        /**
        Adds a score object to this line for the site.
        */
        ScoreLine.prototype.addScore = function (site) {
            //console.log('Adding new score to scoreline');
            var score = new pvMapper.Score(site);

            //score.value = this.getvalue(site);
            //attach the tool's handler directly to the score
            score.siteChangeEvent.addHandler(this.onSiteChange);

            //subscribe to the score updated event
            score.valueChangeEvent.addHandler(this.valueChangeHandler);

            this.scores.push(score);

            try  {
                // request a score update
                this.onSiteChange(undefined, score);
            } catch (ex) {
                if (console)
                    console.error(ex);
            }

            //}
            return score;
        };

        //public removeScore(score: Score) {
        //    // remove site from scoreline.
        //    score.siteChangeEvent.removeHandler(this.onSiteChangeHandler);
        //    score.valueChangeEvent.removeHandler(this.valueChangeHandler);
        //    var idx: number = this.scores.indexOf(score);
        //    if (idx >= 0) {
        //        this.scores.splice(idx, 1);
        //    }
        //}
        //public updateScores(site: Site) {
        //}
        // this updates utility scores from the existing score value of each Score object
        ScoreLine.prototype.updateScores = function () {
            this.scores.forEach(function (score, index, scores) {
                var oldvalue = score.value;
                score.setUtility(this.getUtilityScore(score.value));
                this.scoreChangeEvent.fire(this, {
                    score: score,
                    oldValue: oldvalue,
                    newValue: score.value
                });
            }, this);
        };

        ScoreLine.prototype.loadAllSites = function () {
            var allSites = pvMapper.siteManager.getSites();
            $.each(allSites, function (idx, site) {
                this.addScore(site);
            });
        };

        ScoreLine.prototype.onSiteRemove = function (site) {
            console.log('Attempting to remove a site/score from the scoreline');
            for (var i = 0; i < this.scores.length; i++) {
                var score = this.scores[i];
                if (score.site == site) {
                    // remove site from scoreline.
                    score.siteChangeEvent.removeHandler(this.onSiteChange);
                    score.valueChangeEvent.removeHandler(this.valueChangeHandler);
                    this.scores.splice(i, 1);
                    this.scoreChangeEvent.fire(self, undefined);
                    break;
                }
            }
        };
        return ScoreLine;
    })();
    pvMapper.ScoreLine = ScoreLine;
})(pvMapper || (pvMapper = {}));
