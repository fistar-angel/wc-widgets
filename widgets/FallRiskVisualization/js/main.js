"use strict";

//************************
//	Global variables
//************************
var debug = 0;
var legendPosition = "n";
var plot1;
var plotID = "chart";
var height = null;
var width = null;

//**************************
// 	Ready document actions
//**************************
$(document).ready(function(){
    height = $(document).height() * 0.7;
    width = $(document).width() * 0.85;
    // log message
    MashupPlatform.widget.log("Indivindual Fall risk iwidget loaded", MashupPlatform.log.INFO);
    
    // jqplot declarations 
    $.jqplot.config.enablePlugins = true;
    $.jqplot._noToImageButton = true;  

    // define an JS object
    var visualization = {title: null, dataset: [[]], unit: '%', min: 0, max: 100, label: ['Risk']};

    // handle title input
    var handleTitle = function handleTitle(title){
        visualization["title"] = title;
    }

    // handle data input
    var handleData = function handleData(data){
        visualization["dataset"] = data;

        // validate input data
        var state = dataValidation(visualization);
        if (state === false){
            if ( !$("#zoom_btn").hasClass("hidden") ){
                $("#zoom_btn").addClass("hidden");
            }
            return null;
        }

        // draw a plot
        drawPlot(visualization);
    }

    // input endpoints
    MashupPlatform.wiring.registerCallback("title", handleTitle);
    MashupPlatform.wiring.registerCallback("fallRiskInstances", handleData);


    // Resize plot
    window.onresize = function() { 
        if (plot1) {
            plot1.replot();
        }
    }

    // Reset zoom in plot
    $('.reset').click(function() { 
        plot1.resetZoom(); 
    });

    // print default message
    initialMessage();

    // auto refresh every 2 minutes
    autoRefresh(2);

});


//**************************
//    Initial message
//**************************
function initialMessage(){
    var html = "<div class='row'>" +
                "<div class='col-sm-12'>" +
                    "<div class='jumbotron'>" +
                        //"<h1>Notification</h1>"+
                        "<p>Please select: " +
                            "<ul>" +
                              "<li>the patient based on its unique id number</li>" +
                              "<li>the time period of your interest</li>" +
                            "</ul>" +
                            "and press the button " +
                        "<button type='button' class='btn btn-default disabled'>" +
                            "<span class='fa fa-line-chart fa-lg' style='color: blue'></span> Visualize Risk"+
                        "</button>"+
                        " to be visualized its falling risk fluctuation!</p>"
                    "</div>" +
                "</div>" +
            "</div>";

    // remove existing plot/html
    removePlot(plot1);

    $("#chart").append(html);
}


//**************************
//      Validate data
//**************************
function dataValidation(obj){
    // local variable
    var state = true;

    if (obj["dataset"] == "[[]]" || obj['dataset'].length == 0){
        var html = "<div class='row'>" +
                    "<div class='col-sm-12'>" +
                        "<div class='jumbotron'>" +
                            "<h1>Oops!</h1>"+
                            "<h2>404 Found. No falling risk values !!!</h2>" +
                        "</div>" +
                    "</div>" +
                "</div>";

        // remove existing plot/html
        removePlot(plot1);

        $("#chart").append(html);
        state = false;
    }

    return state;
}


//**************************
//      Draw a plot
//**************************
function drawPlot(object){
    // remove existing plot/html
    removePlot(plot1);

    // Define plot options and then depict it.
    var options = plotOptions(object["title"], object['label']);
    options = getYaxisOptions(options, object['unit'], object['min'], object['max']);
    plot1 = $.jqplot (plotID, [object["dataset"]], options); 

    if ( $("#zoom_btn").hasClass("hidden") ){
        $("#zoom_btn").removeClass("hidden");
    }
}


//**************************
//Remove existing plot/html
//**************************
function removePlot(name){
   if (name) {
       name.destroy();
   }
   var element = "div #" + plotID;
   $(element).empty();
}


//******************************
//	Retrieve general plot options
//******************************
function plotOptions(title, label) {
    var opts = {
        height: height,
        width: width,
        title: {
            text: title,
            show: true,
            fontSize: '12pt',
            renderer: $.jqplot.DivTitleRenderer
        },
        axes: {
            xaxis: {
                renderer:$.jqplot.DateAxisRenderer,
                tickOptions:{formatString:"%F\n%H:%M:%S"},
                autoscale: true
            }
        },
        gridPadding:{
            left:30,
            right:30,
        },
        axesDefaults: {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            tickRenderer: $.jqplot.CanvasAxisTickRenderer, 
            tickOptions: {
                angle: -70,
                fontSize: '10pt'
            }
        },
        seriesColors: ["#C93434"],
        seriesDefaults:{
            showMarker: true,
            shadow: true,
            markerOptions: {
                lineWidth: 1,
                size: 5,
            },
            rendererOptions: {
                smooth: false
            },
            varyBarColor: true
        },
        series: [{
            neighborThreshold: 1,
            fill: true,
            fillAndStroke: true,
            fillAlpha: 0.55,
            highlighter: {
                show: true, 
                tooltipContentEditor: function (str, seriesIndex, pointIndex, plot) {
                    var date = plot.data[seriesIndex][pointIndex][0];
                    var risk = plot.data[seriesIndex][pointIndex][1];
                    // text 
                    var html = "<div><span><b>Datetime</b>: " + date + "</span><br>";
                    html += "<span><b>Fall risk</b>: " + risk + "%</span><br>";

                    if (risk >= 0 && risk < 25){
                        html += "<span><b>Evaluation</b>: Low </span></div>";
                    }
                    else if(risk >= 25 && risk < 50){
                        html += "<span><b>Evaluation</b>: High </span></div>";
                    }
                    else if(risk >= 50 && risk < 75){
                        html += "<span><b>Evaluation</b>: Very High </span></div>";
                    }
                    else if(risk >= 75 && risk < 100){
                        html += "<span><b>Evaluation</b>: Critical </span></div>";
                    }                       
                    return html;
                }
            }
        }],
        animate: true,
        legend: {
            show: true,
            renderer: $.jqplot.EnhancedLegendRenderer,
            placement: "outsideGrid",
            labels: label,
            location: legendPosition,
            rendererOptions: {
                seriesToggle: 'normal',
                seriesToggleReplot: {}
            },
            background: 'white',
            textColor: 'black',
            rowSpacing: '10px',
            shrinkGrid: false
        },
        cursor: {
            show: true,
            zoom: true,
            showTooltip: false
        },
        highlighter: {
            show: true,
            sizeAdjust: 4
        }
    };
    return opts;
}

//******************************
//	Retrieve y-axis plot options
//******************************
function getYaxisOptions(opts, unit, min, max){
	opts.axes.yaxis = {
                min: min,
                max: max,
                numberTicks: 5,
                autoscale: true,
                label: unit,
                tickOptions: {
                    angle: 0
                },
                tickInterval: null
                };
            opts.seriesDefaults.shadow = true;
            opts.seriesDefaults.pointLabels = {show: true};
            opts.seriesDefaults.markerOptions.color = 'darkblue';
            opts.highlighter.sizeAdjust = 4; 

    return opts;
}


$(document).on("click", "#refresh-btn", function(){
    refresh();
});


function refresh(){

    MashupPlatform.wiring.pushEvent("refresh", 1);
}


function autoRefresh(minutes){
    var secs = minutes * 60 * 1000;

    if ($("#zoom_btn").hasClass("hidden") == false){
        setInterval(function() {
            refresh();
        }, secs);
    }
}