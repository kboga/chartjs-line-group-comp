(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['chart.js'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory(require('chart.js'));
    } else {
        // Global browser
        factory(Chart);
    }
}(function (Chart) {
    "use strict";

    Chart.helpers.ChartGroup = function (){
        var charts = [];
        return {
            add : function(chart) { charts.push(chart); },
            each : function(callback) { Chart.helpers.each(charts, callback); },
            eachExceptSelf : function (callback, self) { Chart.helpers.each(Chart.helpers.where(charts, function(x) { return x !== self; }).callback); }
        }
    };

    Chart.types.Line.extend({
        name: "LineComparable",
        initialize: function(data){

            this.compareLineX = null;

            var options = this.options;
            
            if(options.compareLineShow)
            {
                if(options.compareLineChartGroup) options.compareLineChartGroup.add(this);

                var chart = this;
                function updateCharts(callback) {
                    if(options.compareLineChartGroup) options.compareLineChartGroup.each(callback);
                    else callback(chart);
                }

                Chart.helpers.bindEvents(this, ['mousemove'], function(evt){
                    updateCharts(function (x) {
                        x.compareLineX = Chart.helpers.getRelativePosition(evt).x;
                        x.showTooltip(x.getPointsAtEvent(evt), true); // force redraw
                    });
                });

                Chart.helpers.bindEvents(this, ['mouseleave'], function(evt){
                    updateCharts(function (x) {
                        x.compareLineX = null;
                        x.draw();
                    });
                });
            }

            Chart.types.Line.prototype.initialize.apply(this, arguments);
        },
        draw: function(ease){
            // draw line chart
            Chart.types.Line.prototype.draw.apply(this, arguments);

            // draw vertical comparison line
            if (this.options.compareLineShow && this.compareLineX) {
                var ctx = this.chart.ctx;

                ctx.strokeStyle = this.options.compareLineColor ?  this.options.compareLineColor : '#F7464A';
                ctx.lineWidth = this.options.compareLineStrokeWidth ?  this.options.compareLineStrokeWidth : 1;
                ctx.beginPath();
                ctx.moveTo(this.compareLineX, 0);
                ctx.lineTo(this.compareLineX, this.chart.height);
                ctx.closePath();

                ctx.stroke();
            }
        }
    });
}));