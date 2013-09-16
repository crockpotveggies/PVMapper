﻿/// <reference path="OpenLayers.d.ts" />
/// <reference path="Event.ts" />

module pvMapper {
    export var readyEvent: pvMapper.Event = new pvMapper.Event;
    export function onReady(fn:ICallback) {
        readyEvent.addHandler(fn);
    }

    export var map: OpenLayers.IMap;
    export var siteLayer: any;

    export function getColorForScore(score: number): string {
        var min = Math.min;
        var max = Math.max;
        var round = Math.round;

        var startColor = {
            red: 255,
            green: 0,
            blue: 0
        };
        var midColor = {
            red: 255,
            green: 255,
            blue: 100
        };
        var endColor = {
            red: 173,
            green: 255,
            blue: 47
        };

        var scale = 0;
        score = round(min(100, max(0, score)));
        if (score > 50) {
            startColor = midColor;
            scale = score / 50 - 1;
        } else {
            endColor = midColor;
            scale = score / 50;
        }

        //var r = startColor['red'] + scale * (endColor['red'] - startColor['red']);
        //var b = startColor['blue'] + scale * (endColor['blue'] - startColor['blue']);
        //var g = startColor['green'] + scale * (endColor['green'] - startColor['green']);
        var r = startColor.red + scale * (endColor.red - startColor.red);
        var b = startColor.blue + scale * (endColor.blue - startColor.blue);
        var g = startColor.green + scale * (endColor.green - startColor.green);
        r = round(min(255, max(0, r)));
        b = round(min(255, max(0, b)));
        g = round(min(255, max(0, g)));

        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
}