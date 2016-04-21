"use strict";

//************************
//	Global variables
//************************
var debug = 0;
var legendPosition = "n";
var plot1;
var plotID = "chart";


//**************************
// 	Ready document actions
//**************************
$(document).ready(function(){
    // jqplot declarations 
    $.jqplot.config.enablePlugins = true;
    $.jqplot._noToImageButton = true;  

    // define an JS object
    var visualization = {title: null, labels: [], unit: null, dataset: [[]], min: null, max: null};

    // debug msg
    if (debug) {
        console.log("The widget with id: " + MashupPlatform.widget.id + " has been loaded!");
    }

    // handle title input
    var handleTitle = function handleTitle(input){
        visualization["title"] = input;
    }

    // handle label input
    var handleLabel = function handleLabel(input){
        visualization["labels"] = [input];
    }

    // handle unit input
    var handleUnit = function handleUnit(input){
        visualization["unit"] = input;
    }

    // get minimum value
    var handleMin = function handleMin(value){
        visualization["min"] = value;   
    }

    // get maximum value
    var handleMax = function handleMax(value){
        visualization["max"] = value;   
    }

    // handle data input
    var handleData = function handleData(input){
        visualization["dataset"] = input;

        // validate input data
        var state = dataValidation(visualization);
        if (state === false){
            if ( !$("#zoom_btn").hasClass("hidden") ){
                $("#zoom_btn").addClass("hidden");
            }
            return;
        }

        // draw a plot
        drawPlot(visualization);
    }


    // inputs
    MashupPlatform.wiring.registerCallback("title", handleTitle);
    MashupPlatform.wiring.registerCallback("label", handleLabel);
    MashupPlatform.wiring.registerCallback("unit", handleUnit);
    MashupPlatform.wiring.registerCallback("min", handleMin);
    MashupPlatform.wiring.registerCallback("max", handleMax);
    MashupPlatform.wiring.registerCallback("measurements", handleData);


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
                              "<li>the user based on its unique id number</li>" +
                              "<li>the desired biologic parameter</li>" +
                              "<li>the starting and ending date of your interest</li>" +
                            "</ul>" +
                            "and press the button " +
                        "<button type='button' class='btn btn-default disabled'>" +
                            "<span class='fa fa-search fa-lg' style='color: blue'></span> Search"+
                        "</button>"+
                        " to be visualized the measurements of the user!</p>"
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

    if (obj["dataset"] == "[[]]" || obj["dataset"].length == 0){
        var html = "<div class='row'>" +
                    "<div class='col-sm-12'>" +
                        "<div class='jumbotron'>" +
                            "<h1>Oops!</h1>"+
                            "<h2>404 No measurements Found!!!</h2>" +
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
    var options = plotOptions(object["title"], object["labels"]);
    options = getYaxisOptions(options, object["unit"], object["min"], object["max"]);
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
        //height: ($(window).height())*0.5,
        //width: ($(window).width())*0.6,
        title: {
            text: title,
            show: true,
            fontSize: '12pt',
            renderer: $.jqplot.DivTitleRenderer
        },
        axes: {
            xaxis: {
                renderer:$.jqplot.DateAxisRenderer,
                tickOptions:{formatString:"%F\n%H:%M"},
                autoscale: true
            }
        },
        axesDefaults: {
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            tickRenderer: $.jqplot.CanvasAxisTickRenderer, 
            tickOptions: {
                //angle: +60,
                angle: -70,
                fontSize: '8pt'
            }
        },
        seriesDefaults:{
            showMarker: true,
            shadow: true,
            markerOptions: {
                lineWidth: 1,
                size: 5
            },
            rendererOptions: {
                smooth: false
            },
            varyBarColor: true
        },
        series: [{
            neighborThreshold: 0,
            fill: false
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
            rowSpacing: '8px',
            shrinkGrid: true
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