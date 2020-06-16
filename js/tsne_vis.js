// t-SNE Visualization and global variables

//BACKEND_API_URL = "https://sheldon.lnu.se/t-viSNE/tsneGrid"
BACKEND_API_URL = "http://127.0.0.1:5000"

// This variable is used when a new file is upload by a user.
var new_file; 

// Scale - Responsiveness
var overallWidth = 0, overallHeight = 0;

// Initialize the horizontal (correlations) barchart's variables
var svg, defs, gBrush, brush, main_xScale, mini_xScale, main_yScale, mini_yScale, main_xAxis, main_yAxis, mini_width, textScale, main_margin, mini_margin;

// Added only for the mouse wheel
var zoomer = d3v3.behavior.zoom()
.on("zoom", null);

function myResponsiveComponent(props) {
  overallWidth = props.width;
  overallHeight = props.height;

  // Margin of the main barchart
  main_margin = {top: 8, right: 10, bottom: 30, left: 100},
    main_width = overallWidth/5.2 - main_margin.left - main_margin.right,
    main_height = overallHeight/5.2 - main_margin.top - main_margin.bottom;
  // Margin of the mini barchart
  mini_margin = {top: 8, right: 10, bottom: 30, left: 10},
    mini_height = overallHeight/5.2 - mini_margin.top - mini_margin.bottom;
    mini_width =  overallWidth/23 - mini_margin.left - mini_margin.right;

  // Create the svg correlation component
  svg = d3v3.select("#correlation").attr("class", "svgWrapper")
    .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
    .attr("height", main_height + main_margin.top + main_margin.bottom)
    .call(zoomer)
    .on("wheel.zoom", scroll)
    .on("mousedown.zoom", null)
    .on("touchstart.zoom", null)
    .on("touchmove.zoom", null)
    .on("touchend.zoom", null);
}

// The basic variables in order to execute t-SNE (opt is perplexity and learning rate). 
var tsne; var opt; var step_counter; var max_counter; var runner; 

// These variables are initialized here in order to store the final dataset, the points, the cost, the cost for each iteration, the beta values, the positions, the 2D points positions,
// In addition, there is an array which keeps the initial information of the points (i.e., initial state), the data features (with the label of the category plus the id of the point), the data features without the category (only numbers).
var final_dataset; var points = []; var cost = []; var cost_each; var beta_all = []; var x_position = []; var y_position = []; var points2d = []; var InitialStatePoints = []; 
var ArrayContainsDataFeaturesCleared = []; var ArrayContainsDataFeaturesClearedwithoutNull = []; var ArrayContainsDataFeaturesClearedwithoutNullKeys = []; var flagAnalysis = false;

// The distances in the high dimensional space and in the 2D space. All the labels that were found in the selected data set.
var dists; var dists2d; var all_labels; var dist_list = []; var dist_list2d = []; var InitialFormDists = []; var InitialFormDists2D = []; var IterationsList = []; var ArrayWithCostsList = [];

// These are the dimensions for the Overview view and the Main view
var dim = document.getElementById('overviewRect').offsetWidth-2; var dimensions = document.getElementById('modtSNEcanvas').offsetWidth; var dimensionsY = document.getElementById('modtSNEcanvas').offsetHeight; var lassoFlag = false;
var dimh = document.getElementById('overviewRect').offsetHeight-2;

// Category = the name of the category if it exists. The user has to add an asterisk ("*") mark in order to let the program identify this feature as a label/category name. 
// ColorsCategorical = the categorical colors (maximum value = 10).
var Category; var ColorsCategorical; var valCategExists = 0; var insideCall = false;

// This is for the removal of the distances cache. 
var returnVal = false; 

var ArrayWithCosts = []; var Iterations = [];

var VisiblePoints = []; 

var sliderTrigger = false; var sliderInsideTrigger = false; var parameters; var SelProjIDS; var SelProjIDSProv; var SelectedProjections = []; var activeProjectionNumber = []; var activeProjectionNumberProv = []; var globalFlagCheck = true;

// This variable is for the kNN Bar Chart in order to store the first execution.
var inside = 0; var kValuesLegend = []; var findNearestTable = []; var howManyPoints;
var maxKNN = 0

var mode = 1; var colors = ['#00bbbb','#b15928','#ff7f00','#e31a1c','#1f78b4']; var projections = []; var betas = []; var cost_per_point = []; var cost_overall; var metricsSorting = []; var dataReceivedFromServer = []; var dataReceivedFromServerOptimized = []; var metrics = []; var FocusedIDs = [];

var Category; var target_names = []

var format; 

// Schema Investigation 
// svgClick = Click a left mouse click in order to add a point.
// prevRightClick = When right click is pressed prevent any other action. Lock the current schema.
// if flagForSchema is false then send a message to the user that he/she has to: "Please, draw a schema first!");
var svgClick; var prevRightClick; var flagForSchema = false; var PreComputFlagCorrelation = true; var maxminTotal = [];

// Save the parameters for the current analysis, save the overallCost, and store in the "input" variable all the points and points2D.
var ParametersSet = []; var overallCost; var input; 

// These parameters are initiated here for the annotations.
var ringNotes = []; var gAnnotationsAll = []; var AnnotationsAll = []; var draggable = [];

// These variables are set here in order to instatiate the very first Three.js scene.
var MainCanvas; var Child; var renderer; var near = 10; var far = 7000; var camera; var scene;

if (getViewport()[0] >= 2560) {
  var fov = 14.3;
} else {
  var fov = 10.2;
}

// Initialize the Schema Investigation variables.
var Arrayx = []; var Arrayy = []; var XYDistId = []; var Arrayxy = []; var DistanceDrawing1D = []; var allTransformPoints = []; var p; var pFinal = []; var paths; var path; var ArrayLimit = [];
var minimum; var correlationResults = []; var correlationResultsFinal = []; var ArrayContainsDataFeaturesLimit = [];

var results_all_global = []

// This function is executed when the factory button is pressed in order to bring the visualization in the initial state.
function FactoryReset(){
  var graphDiv = 'ProjectionsVisual'

  Plotly.purge(graphDiv);
  
  location.reload(); 
}

// Returns if a value is a string
function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

// Load a previously executed analysis function.
function loadAnalysis(){
  document.getElementById('file-input').click();
  document.getElementById("ExecuteBut").innerHTML = "Execute previous t-SNE analysis";
}

// This function is being used when the user selects to upload a new data set.
function getfile(file){
  new_file = file;   //uploaded data file
}

// Read the previous analysis, which the user wants to upload. 
function fetchVal(callback) {
  var file, fr;
  file = input.files[0];
  fr = new FileReader();
  fr.onload = function (e) {
    lines = e.target.result;
    callback(lines);
  };
  fr.readAsText(file);
}

function OptimizePoints() {
  if (lassoFlag) {
    FocusedIDs = []
    for (let i = 0; i < points.length; i++) {
      if (points[i].selected) {
        FocusedIDs[i] = i
      }
    }

     // ajax the JSON to the server
     $.post(BACKEND_API_URL+"/receiverOptimizer", JSON.stringify(FocusedIDs), function(){
      $.get(BACKEND_API_URL+"/senderOptimizer", function( data ) {
        dataReceivedFromServerOptimized = data
        ReSort(false)
    });
  
    });
  } else {
    alert('Group Selection Mode should be enabled to perform this action.')
  }
}

function ReSort(flagInitialize) {
  mode = 2
  sliderTrigger = true
  var traces = []

  var width= dimensions*0.97;
  var viewport = getViewport(); // Get the width and height of the main visualization
  var vh = viewport[1] * 0.035;
  var height= vh * 2.8;

  var graphDiv = 'ProjectionsVisual'

  Plotly.purge(graphDiv);

  var metricsSortingCopy
  var metricsCopy

  projections = dataReceivedFromServer['projections']
  parameters = dataReceivedFromServer['parameters']
  metricsSorting = dataReceivedFromServer['metrics']
  betas = dataReceivedFromServer['betas']
  cost_per_point = dataReceivedFromServer['cpp']
  cost_overall = dataReceivedFromServer['cpi']
  if (FocusedIDs.length != 0) {
    if (globalFlagCheck) {
      metricsSortingCopy = metricsSorting
      metricsCopy = metrics
    }
    globalFlagCheck = false
    metricsSorting = dataReceivedFromServerOptimized['metrics']
    metrics = dataReceivedFromServerOptimized['metricsEntire']
    if (FocusedIDs.length == points.length) {
      document.getElementById("textToChange").innerHTML = "[Sorting:";
    } else {
      document.getElementById("textToChange").innerHTML = "[Sorting for Selection:";
    }
  } else {
    if (!globalFlagCheck) {
      metricsSorting = metricsSortingCopy
      metrics = metricsCopy
    }
  }

  var traces = []
  var target_names = []

  results_all_global.filter(function(obj) { 

    var temp = []; 
    temp.push(Object.keys(obj)); 
    for (var object in temp[0]){
      if(temp[0][object].indexOf("*") != -1){
        Category = temp[0][object];
        return Category;
      }
    }

  });

  for (let i = 0; i < results_all_global.length; i++){
    target_names.push(results_all_global[i][Category])
  }
  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  }

  const uniqueTarget = target_names.filter(unique)
  var labelsTarget = []
  if (format[0] == "diabetes"){
  for (let m = 0; m < uniqueTarget.length; m++) {
    if (uniqueTarget[m] === 1) {
      labelsTarget[m] = "Positive"
    } else {
      labelsTarget[m] = "Negative"
    }
  }
} else {
  labelsTarget = uniqueTarget
}

if(flagInitialize) {
  var optionMetricOver = document.getElementById("param-SortMOver-view").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
  $('#param-SortM-view').val(optionMetricOver).change();
}

var optionMetric = document.getElementById("param-SortM-view").value; // Get the threshold value with which the user set's the boundaries of the schema investigation

var order = [];
SelectedProjections = []
var xValues;
if (optionMetric == 1) {
  order = metricsSorting[optionMetric-1]
  xValues = ['<b>QMA</b>', 'NH', 'T', 'C', 'S', 'SDC'];
} else if (optionMetric == 2) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', '<b>NH</b>', 'T', 'C', 'S', 'SDC'];
} else if (optionMetric == 3) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', '<b>T</b>', 'C', 'S', 'SDC'];
} else if (optionMetric == 4) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', 'T', '<b>C</b>', 'S', 'SDC'];
} else if (optionMetric == 5) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', 'T', 'C', '<b>S</b>', 'SDC'];
} else {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', 'T', 'C', 'S', '<b>SDC</b>'];
}

var index = order.indexOf(activeProjectionNumber);

var arrayLineColor = []

for (let k = 0; k < 6; k++) {
  if (index > 5) {
    if (k == 5 && index > 4) {
      SelectedProjections.push(activeProjectionNumber)
      arrayLineColor.push('red')
    } else {
      if (order[k] == activeProjectionNumber) {
        arrayLineColor.push('red')
      } else {
        arrayLineColor.push('black')
      }
      SelectedProjections.push(order[k])
    }
  } else {
    if (order[k] == activeProjectionNumber) {
      arrayLineColor.push('red')
    } else {
      arrayLineColor.push('black')
    }
    SelectedProjections.push(order[k])
  }
}

var checkCounter = 0
var checkCounterMetr = 0

var colorscaleValue = [
  [0, '#d9d9d9'],
  [1, '#000000']
];

for (let k = 0; k < 6*2; k++) {
if(k >= 6) {
  if (k == 6) {
    traces.push({
      y: [],
      x: xValues,
      z: [metrics[SelectedProjections[checkCounterMetr]]],
      type: 'heatmap',
      hoverinfo:"z",
      zmin:0,
      zmax:1,
      colorscale: colorscaleValue,
      colorbar: {
          title: 'Perform.',
          tickvals:[0,0.5,1],
          titleside:'right',
        },
      xaxis: 'x'+parseInt(k+1),
      yaxis: 'y'+parseInt(k+1),
    })
  } else {
    traces.push({
      y: [],
      x: xValues,
      z: [metrics[SelectedProjections[checkCounterMetr]]],
      hoverinfo:"z",
      zmin:0,
      zmax:1,
      type: 'heatmap',
      colorscale: colorscaleValue,
      showscale: false,
      xaxis: 'x'+parseInt(k+1),
      yaxis: 'y'+parseInt(k+1),
    })
  }
  checkCounterMetr++;
} else {
  var result = projections[SelectedProjections[checkCounter]].reduce(function(r, a) {
    a.forEach(function(s, i) {
        var key = i === 0 ? 'Xax' : 'Yax';

        r[key] || (r[key] = []); // if key not found on result object, add the key with empty array as the value

        r[key].push(s);
    })
    return r;
  }, {})
  var Text = [];

  for (let i = 0; i < uniqueTarget.length; i++) {
    /*count = 0
    for (let j = 0; j < target_names.length; j++) {

      Text.push('Perplexity: '+parameters[SelectedProjections[checkCounter]][0]+'; Learning rate: '+parameters[SelectedProjections[checkCounter]][1]+'; Max iterations: '+parameters[SelectedProjections[checkCounter]][2])

      if (uniqueTarget[i] == target_names[j]) {
        count = count + 1
      }
       
    }*/

    const aux_X = result.Xax.filter((item, index) => target_names[index] == uniqueTarget[i]);
    const aux_Y = result.Yax.filter((item, index) => target_names[index] == uniqueTarget[i]);

    Text = aux_X.map(() => {
      let popup = 'Perplexity: '+parameters[SelectedProjections[checkCounter]][0]+'; Learning rate: '+parameters[SelectedProjections[checkCounter]][1]+'; Max iterations: '+parameters[SelectedProjections[checkCounter]][2];
      return popup;
    });

    
        traces.push({
          x: aux_X,
          y: aux_Y,
          mode: 'markers',
          showlegend: false,
          text: Text,
          hoverinfo:"text",
          hoverlabel: {
            bgcolor: 'white',
            font: {color: 'black'}
          },
          name: labelsTarget[i],
          showlegend: false,
          marker: {
            color: colors[i]
          },
          xaxis: 'x'+parseInt(k+1),
          yaxis: 'y'+parseInt(k+1),
        })

    //countPrev = count + countPrev
  }

  checkCounter++;
}

}
  
      var layout = {
      xaxis: {
        linecolor: arrayLineColor[0],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          zeroline: false,
          anchor: 'y',
          domain: [0, 0.15],
          showticklabels: false
      },
      yaxis: {
        linecolor: arrayLineColor[0],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          zeroline: false,
          anchor: 'x',
          domain: [0.22, 1],
          showticklabels: false
      },
      xaxis2: {
        linecolor: arrayLineColor[1],
        linewidth: 1,
        mirror: true,
        showgrid: false,
        anchor: 'y2',
        domain: [0.17, 0.32],
        zeroline: false,
        showticklabels: false
      },
      yaxis2: {
          linecolor: arrayLineColor[1],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          zeroline: false,
          anchor: 'x2',
          domain: [0.22, 1],
          showticklabels: false
      },
      xaxis3: {
        linecolor: arrayLineColor[2],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          anchor: 'y3',
          domain: [0.34, 0.49],
          zeroline: false,
          showticklabels: false
      },
      yaxis3: {
        linecolor: arrayLineColor[2],
          linewidth: 1,
          mirror: true,
          anchor: 'x3',
          domain: [0.22, 1],
          showgrid: false,
          zeroline: false,
          showticklabels: false
      },
      xaxis4: {
        linecolor: arrayLineColor[3],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          anchor: 'y4',
          domain: [0.51, 0.66],
          zeroline: false,
          showticklabels: false
      },
      yaxis4: {
        linecolor: arrayLineColor[3],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          anchor: 'x4',
          domain: [0.22, 1],
          zeroline: false,
          showticklabels: false
      },
      xaxis5: {
        linecolor: arrayLineColor[4],
          linewidth: 1,
          mirror: true,
          anchor: 'y5',
          domain: [0.68, 0.83],
          showgrid: false,
          zeroline: false,
          showticklabels: false
      },
      yaxis5: {
        linecolor: arrayLineColor[4],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          anchor: 'x5',
          domain: [0.22, 1],
          zeroline: false,
          showticklabels: false
      },
      xaxis6: {
        linecolor: arrayLineColor[5],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          anchor: 'y6',
          domain: [0.85, 1],
          zeroline: false,
          showticklabels: false
      },
      yaxis6: {
        linecolor: arrayLineColor[5],
          linewidth: 1,
          mirror: true,
          showgrid: false,
          anchor: 'x6',
          domain: [0.22, 1],
          zeroline: false,
          showticklabels: false
      },
      xaxis7: {
        ticks: '',
        side: 'bottom',
        anchor: 'y7',
        domain: [0, 0.15],
      },
      yaxis7: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        anchor: 'x7',
        domain: [0, 0.18],
        autotick: true,
        ticks: '',
        showticklabels: false
      },
      xaxis8: {
        ticks: '',
        side: 'bottom',
        anchor: 'y8',
        domain: [0.17, 0.32],
      },
      yaxis8: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        anchor: 'x8',
        domain: [0, 0.18],
        autotick: true,
        ticks: '',
        showticklabels: false
      },
      xaxis9: {
        ticks: '',
        side: 'bottom',
        anchor: 'y9',
        domain: [0.34, 0.49],
      },
      yaxis9: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        anchor: 'x9',
        domain: [0, 0.18],
        autotick: true,
        ticks: '',
        showticklabels: false
      },
      xaxis10: {
        ticks: '',
        side: 'bottom',
        anchor: 'y10',
        domain: [0.51, 0.66],
      },
      yaxis10: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        anchor: 'x10',
        domain: [0, 0.18],
        autotick: true,
        ticks: '',
        showticklabels: false
      },
      xaxis11: {
        ticks: '',
        side: 'bottom',
        anchor: 'y11',
        domain: [0.68, 0.83],
      },
      yaxis11: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        anchor: 'x11',
        domain: [0, 0.18],
        autotick: true,
        ticks: '',
        showticklabels: false
      },
      xaxis12: {
        ticks: '',
        side: 'bottom',
        anchor: 'y12',
        domain: [0.85, 1],
      },
      yaxis12: {
        autorange: true,
        showgrid: false,
        zeroline: false,
        showline: false,
        anchor: 'x12',
        domain: [0, 0.18],
        autotick: true,
        ticks: '',
        showticklabels: false
      },
      margin: {
        l: 10,
        r: 10,
        b: 37,
        t: 2,
        pad: 0
      },
      autosize: true,
      width: width,
      height: height,
      hovermode:'closest',
      legend: {"orientation": "h"},
      grid: {pattern: 'independent'},
    }
    document.getElementById('overviewRect').style.border = '1px solid red'
    document.getElementById('modtSNEcanvas').style.border = '1px solid red'
    
    var config = {displayModeBar: false}

    Plotly.newPlot(graphDiv, traces, layout, config)

    var myPlotProvenance = document.getElementById('ProjectionsVisual')

    myPlotProvenance.on('plotly_click', function(data){
      var update = {
        'xaxis.linecolor': 'black',   // updates the xaxis range
        'yaxis.linecolor': 'black',    // updates the end of the yaxis range
        'xaxis2.linecolor': 'black',   // updates the xaxis range
        'yaxis2.linecolor': 'black',    // updates the end of the yaxis range
        'xaxis3.linecolor': 'black',   // updates the xaxis range
        'yaxis3.linecolor': 'black',    // updates the end of the yaxis range
        'xaxis4.linecolor': 'black',   // updates the xaxis range
        'yaxis4.linecolor': 'black',    // updates the end of the yaxis range
        'xaxis5.linecolor': 'black',   // updates the xaxis range
        'yaxis5.linecolor': 'black',    // updates the end of the yaxis range
        'xaxis6.linecolor': 'black',   // updates the xaxis range
        'yaxis6.linecolor': 'black',    // updates the end of the yaxis range
        };

        Plotly.relayout(graphDiv, update)
      
          SelProjIDSProv = []
          if (data.points[0].xaxis._id == 'x') {
      
              var update = {
                'xaxis.linecolor': 'red',   // updates the xaxis range
                'yaxis.linecolor': 'red'    // updates the end of the yaxis range
              };
            
            SelProjIDSProv.push(0)
          } else if (data.points[0].xaxis._id == 'x2') {
      
              var update = {
                'xaxis2.linecolor': 'red',   // updates the xaxis range
                'yaxis2.linecolor': 'red'    // updates the end of the yaxis range
              };
      
            
              SelProjIDSProv.push(1)
          } else if (data.points[0].xaxis._id == 'x3') {
      
              var update = {
                'xaxis3.linecolor': 'red',   // updates the xaxis range
                'yaxis3.linecolor': 'red'    // updates the end of the yaxis range
              };
          
              SelProjIDSProv.push(2)
          } else if (data.points[0].xaxis._id == 'x4') {
      
              var update = {
                'xaxis4.linecolor': 'red',   // updates the xaxis range
                'yaxis4.linecolor': 'red'    // updates the end of the yaxis range
              };
      
            
              SelProjIDSProv.push(3)
          } else if (data.points[0].xaxis._id == 'x5') {
      
              var update = {
                'xaxis5.linecolor': 'red',   // updates the xaxis range
                'yaxis5.linecolor': 'red'    // updates the end of the yaxis range
              };
      
              SelProjIDSProv.push(4)
          } else {
      
          
              var update = {
                'xaxis6.linecolor': 'red',   // updates the xaxis range
                'yaxis6.linecolor': 'red'    // updates the end of the yaxis range
              };
          
              SelProjIDSProv.push(5)
          }

          Plotly.relayout(graphDiv, update)

          sliderInsideTrigger = true
          insideCall = true;
          activeProjectionNumberProv = order[SelProjIDSProv[0]]

      getData()
    })

  if (flagInitialize) {
    closeModalFun()
    insideCall = true;
    getData()
  }
  
}

function ExecuteMode() {
  mode = document.getElementById("param-EX-view").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
  mode = parseInt(mode);
}

// Parse the analysis folder if requested or the csv file if we run a new execution. 
var getData = function() {

  PreComputFlagCorrelation = true;
  let value;
  if (typeof window.FileReader !== 'function') {
    alert("The file API is not supported on this browser yet.");
  }
  // Check if the input already exists, which means if we loaded a previous analysis
  input = document.getElementById("file-input");
  if (!input) {
    alert("Could not find the file input element.");
  } else if (!input.files) {
    alert("This browser does not seem to support the `files` property of file inputs.");
  } else if (!input.files[0]) {
    value = document.getElementById("param-dataset").value; // Get the value of the data set
    format = value.split("."); //Get the format (e.g., [iris, csv])
    if (format[value.split(".").length-1] == "csv") { // Parse the predefined files
      parseData("./data/"+value);
    } else{
      parseData(new_file, init);  // Parse new files
    }

  } else {
    fetchVal(function(lines){

      // Load an analysis and parse the previous points and parameters information.
      AnalysisResults = JSON.parse(lines); 
      var length = (AnalysisResults.length - 9);

      ParametersSet = AnalysisResults.slice(length+1, AnalysisResults.length+7)
      value = ParametersSet[0];
      if (!isNaN(parseInt(value))){
        flagAnalysis = true;
        length = (AnalysisResults.length - 11);
        ParametersSet = AnalysisResults.slice(length+1, length+7);

        value = ParametersSet[0];
      } else {
        flagAnalysis = false;
      }
      format = value.split("."); //Get the actual format
      if (format[value.split(".").length-1] == "csv") {
        // Check if the file is in the right folder, i.e., ./data/{file}
        $.ajax({
          type: 'HEAD',
          url: './data/'+value,
          complete: function (xhr){
            if (xhr.status == 404){
              alert(xhr.statusText); // Not found
              alert("Please, place your new data set into the ./data folder of the implementation.");
            }
          }
        });
        parseData("./data/"+value);
      }
  });
  }

}

// Parse the data set with the use of PapaParse.
function parseData(url) {

  var graphDiv = 'gridVisual'
  Plotly.purge(graphDiv);

  document.getElementById("loader").style.display = "block";
  
  Papa.parse(url, { 
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        results.data = results.data.filter(function (el) {
        var counter = 0;
        for(key in el) {
            if(el.hasOwnProperty(key)) {
                var value = el[key];
                  if(key === "id" || key === "Version" || typeof(value) !== 'number' || value === undefined){ // Add more limitations if needed in both areas. This is for the calculations so  it needs more limitations!
                    delete el[key];
                  }else{
                    el[counter] = el[key];
                    delete el[key];
                    counter = counter + 1;
                  }
            }
        }
        return el;
        });

        Papa.parse(url, { 
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(data) {
              doStuff(data.data.filter(function (el) {
                  var counter = 0;
                  for(key in el) {
                      if(el.hasOwnProperty(key)) {
                          var value = el[key];
                            if(key === "id" || key === "Version"){ // Add more limitations if needed in both areas. Key limitations here!
                              delete el[key];
                            }
                      }
                  }
                  return el;
                  }));
            }
          });
          function doStuff(results_all){
            results_all_global = results_all
            // results_all variable is all the columns multiplied by all the rows.
            // results.data variable is all the columns except strings, undefined values, or "Version" plus beta and cost values."
            // results.meta.fields variable is all the features (columns) plus beta and cost strings.  
            if (mode == 2) {
                if (insideCall) {
                  init(results.data, results_all, results.meta.fields); // Call the init() function that starts everything!
                } else {
                  $.post(BACKEND_API_URL+"/resetAll", JSON.stringify(''), function(){
                  });
                  var parametersLocal = []
                  parametersLocal.push(document.getElementById("param-perplexity-value").value)
                  parametersLocal.push(document.getElementById("param-learningrate-value").value)
                  parametersLocal.push(document.getElementById("param-maxiter-value").value)
                  parametersLocal.push(results_all)
                  $.post(BACKEND_API_URL+"/receiverSingle", JSON.stringify(parametersLocal), function(){
                    $.get(BACKEND_API_URL+"/senderSingle", function( data ) {
                      dataReceivedFromServer = data
                      projections = dataReceivedFromServer['projections']
                      betas = dataReceivedFromServer['betas']
                      cost_per_point = dataReceivedFromServer['cpp']
                      cost_overall = dataReceivedFromServer['cpi']
                      activeProjectionNumber = 0
                      activeProjectionNumberProv = 0
                      init(results.data, results_all, results.meta.fields); // Call the init() function that starts everything!
                  });
                  
                });
              }
            } else {
              if (flagAnalysis) {

                $('#myModal').modal('hide');
                $.post(BACKEND_API_URL+"/resetAll", JSON.stringify(''), function(){
                  });

                  var parametersLocal = []
                  parametersLocal.push(document.getElementById("param-perplexity-value").value)
                  parametersLocal.push(document.getElementById("param-learningrate-value").value)
                  parametersLocal.push(document.getElementById("param-maxiter-value").value)
                  parametersLocal.push(results_all)
                  $.post(BACKEND_API_URL+"/receiverSingle", JSON.stringify(parametersLocal), function(){
                    $.get(BACKEND_API_URL+"/senderSingle", function( data ) {
                      dataReceivedFromServer = data
                      projections = dataReceivedFromServer['projections']
                      betas = dataReceivedFromServer['betas']
                      cost_per_point = dataReceivedFromServer['cpp']
                      cost_overall = dataReceivedFromServer['cpi']
                      activeProjectionNumber = 0
                      init(results.data, results_all, results.meta.fields); // Call the init() function that starts everything!
                  });
                  
                });
              } else {
                    // ajax the JSON to the server
                    $.post(BACKEND_API_URL+"/resetAll", JSON.stringify(''), function(){
                    });
                    $.post(BACKEND_API_URL+"/receiver", JSON.stringify(results_all), function(){
                      $.get(BACKEND_API_URL+"/sender", function( data ) {
                        dataReceivedFromServer = data
                        ReSortOver()

                  });
                  
                });
              }

        }
            
          }
      }
    });

}

function ReSortOver() {

  var graphDiv = 'gridVisual'
  Plotly.purge(graphDiv);

  projections = dataReceivedFromServer['projections']
  parameters = dataReceivedFromServer['parameters']
  metricsSorting = dataReceivedFromServer['metrics']
  metrics = dataReceivedFromServer['metricsEntire']
  betas = dataReceivedFromServer['betas']
  cost_per_point = dataReceivedFromServer['cpp']
  cost_overall = dataReceivedFromServer['cpi']

  var traces = []
  var target_names = []

  results_all_global.filter(function(obj) { 

    var temp = []; 
    temp.push(Object.keys(obj)); 
    for (var object in temp[0]){
      if(temp[0][object].indexOf("*") != -1){
        Category = temp[0][object];
        return Category;
      }
    }

  });

  for (let i = 0; i < results_all_global.length; i++){
    target_names.push(results_all_global[i][Category])
  }

  const unique = (value, index, self) => {
    return self.indexOf(value) === index
  }

  const uniqueTarget = target_names.filter(unique)
  var labelsTarget = []
  if (format[0] == "diabetes"){
  for (let m = 0; m < uniqueTarget.length; m++) {
    if (uniqueTarget[m] === 1) {
      labelsTarget[m] = "Positive"
    } else {
      labelsTarget[m] = "Negative"
    }
  }
} else {
  labelsTarget = uniqueTarget
}

var optionMetric = document.getElementById("param-SortMOver-view").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
var order = [];

var xValues;
if (optionMetric == 1) {
  order = metricsSorting[optionMetric-1]
  xValues = ['<b>QMA</b>', 'NH', 'T', 'C', 'S', 'SDC'];
} else if (optionMetric == 2) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', '<b>NH</b>', 'T', 'C', 'S', 'SDC'];
} else if (optionMetric == 3) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', '<b>T</b>', 'C', 'S', 'SDC'];
} else if (optionMetric == 4) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', 'T', '<b>C</b>', 'S', 'SDC'];
} else if (optionMetric == 5) {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', 'T', 'C', '<b>S</b>', 'SDC'];
} else {
  order = metricsSorting[optionMetric-1]
  xValues = ['QMA', 'NH', 'T', 'C', 'S', '<b>SDC</b>'];
}

  var checkCounter = 0
  var checkCounterMetr = 0

  var colorscaleValue = [
    [0, '#d9d9d9'],
    [1, '#000000']
  ];

  for (let k = 0; k < projections.length*2; k++) {
  if((k >= 5 && k < 10) || (k >=15 && k< 20) || (k >= 25 && k< 30) || (k >= 35 && k< 40) || (k >= 45 && k< 50)) {
    if (k == 6) {
      traces.push({
        y: [],
        x: xValues,
        z: [metrics[order[checkCounterMetr]]],
        type: 'heatmap',
        hoverinfo:"z",
        colorscale: colorscaleValue,
        zmin:0,
        zmax:1,
        colorbar: {
            title: 'Metrics performance (normalized)',
            tickvals:[0,0.2,0.4,0.6,0.8,1],
            titleside:'right',
          },
        xaxis: 'x'+parseInt(k+1),
        
        yaxis: 'y'+parseInt(k+1),
      })
    } else {

      traces.push({
        y: [],
        x: xValues,
        z: [metrics[order[checkCounterMetr]]],
        hoverinfo:"z",
        type: 'heatmap',
        zmin:0,
        zmax:1,
        colorscale: colorscaleValue,
        showscale: false,
        xaxis: 'x'+parseInt(k+1),
        yaxis: 'y'+parseInt(k+1),
      })
    }
    checkCounterMetr++;
  } else {
    var result = projections[order[checkCounter]].reduce(function(r, a) {
      a.forEach(function(s, i) {
          var key = i === 0 ? 'Xax' : 'Yax';

          r[key] || (r[key] = []); // if key not found on result object, add the key with empty array as the value

          r[key].push(s);
      })
      return r;
    }, {})
    var Text = [];


    for (let i = 0; i < uniqueTarget.length; i++) {

        const aux_X = result.Xax.filter((item, index) => target_names[index] == uniqueTarget[i]);
        const aux_Y = result.Yax.filter((item, index) => target_names[index] == uniqueTarget[i]);

        Text = aux_X.map(() => {
          let popup = 'Perplexity: '+parameters[order[checkCounter]][0]+'; Learning rate: '+parameters[order[checkCounter]][1]+'; Max iterations: '+parameters[order[checkCounter]][2];
          return popup;
        });
    
        if (k == 0) {
          traces.push({
            x: aux_X,
            y: aux_Y,
            mode: 'markers',
            name: labelsTarget[i],
            text: Text,
            hoverinfo:"text",
            hoverlabel: {
              bgcolor: 'white',
              font: {color: 'black'}
            },
            marker: {
              color: colors[i]
            },
            xaxis: 'x'+parseInt(k+1),
            yaxis: 'y'+parseInt(k+1),
          })
        } else {
          traces.push({
            x: aux_X,
            y: aux_Y,
            mode: 'markers',
            showlegend: false,
            text: Text,
            hoverinfo:"text",
            hoverlabel: {
              bgcolor: 'white',
              font: {color: 'black'}
            },
            name: labelsTarget[i],
            showlegend: false,
            marker: {
              color: colors[i]
            },
            xaxis: 'x'+parseInt(k+1),
            yaxis: 'y'+parseInt(k+1),
          })
        }
    }

    checkCounter++;
  }

}

  var width = 1050 // interactive visualization
  var height = 1150 // interactive visualization
  document.getElementById("confirmModal").disabled = true;

  const layout = {
  xaxis: {
    linecolor: 'black',
    linewidth: 1,
    mirror: true,
    showgrid: false,
    zeroline: false,
    anchor: 'y1',
    domain: [0, 0.19],
    showticklabels: false,
  },
  yaxis: {
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'x1',
      domain: [0.86, 1],
      showticklabels: false
  },
  xaxis2: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y2',
      domain: [0.21, 0.39],
      zeroline: false,
      showticklabels: false
  },
  yaxis2: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x2',
      domain: [0.86, 1],
      zeroline: false,
      showticklabels: false
  },
  xaxis3: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'y3',
      domain: [0.41, 0.59],
      showticklabels: false
  },
  yaxis3: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'x3',
      domain: [0.86, 1],
      showticklabels: false
  },
  xaxis4: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'y4',
      domain: [0.61, 0.79],
      showticklabels: false
  },
  yaxis4: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'x4',
      domain: [0.86, 1],
      showticklabels: false
  },
  xaxis5: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'y5',
      domain: [0.81, 1],
      showticklabels: false
  },
  yaxis5: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'x5',
      domain: [0.86, 1],
      showticklabels: false
  },
  xaxis6: {
    side: 'top',
    anchor: 'y6',
    domain: [0, 0.19],
  },
  yaxis6: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x6',
    domain: [0.82, 0.84],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis7: {
    side: 'top',
    anchor: 'y7',
    domain: [0.21, 0.39],
  },
  yaxis7: {
    autorange: true,
    showgrid: false,
    anchor: 'x7',
    domain: [0.82, 0.84],
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis8: {
    side: 'top',
    anchor: 'y8',
    domain: [0.41, 0.59],
  },
  yaxis8: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    anchor: 'x8',
    domain: [0.82, 0.84],
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis9: {
    side: 'top',
    anchor: 'y9',
    domain: [0.61, 0.79],
  },
  yaxis9: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x9',
    domain: [0.82, 0.84],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis10: {
    side: 'top',
    anchor: 'y10',
    domain: [0.81, 1],
  },
  yaxis10: {
    autorange: true,
    showgrid: false,
    anchor: 'x10',
    domain: [0.82, 0.84],
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis11: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y11',
      domain: [0, 0.19],
      zeroline: false,
      showticklabels: false
  },
  yaxis11: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x11',
      domain: [0.66, 0.80],
      zeroline: false,
      showticklabels: false
  },
  xaxis12: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y12',
      domain: [0.21, 0.39],
      zeroline: false,
      showticklabels: false
  },
  yaxis12: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x12',
      domain: [0.66, 0.80],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis13: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'y13',
      domain: [0.41, 0.59],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis13: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x13',
      domain: [0.66, 0.80],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis14: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'y14',
      domain: [0.61, 0.79],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis14: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x14',
      domain: [0.66, 0.80],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis15: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'y15',
      domain: [0.81, 1],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis15: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x15',
      domain: [0.66, 0.80],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis16: {
    side: 'top',
    anchor: 'y16',
    domain: [0, 0.19],
    
  },
  yaxis16: {
    autorange: true,
    showgrid: false,
    anchor: 'x16',
    domain: [0.62, 0.64],
    zeroline: false,
    showline: false,
    
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis17: {
    side: 'top',
    anchor: 'y17',
    domain: [0.21, 0.39],
  },
  yaxis17: {
    autorange: true,
    showgrid: false,
    anchor: 'x17',
    domain: [0.62, 0.64],
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis18: {
    side: 'top',
    anchor: 'y18',
    domain: [0.41, 0.59],
  },
  yaxis18: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x18',
    domain: [0.62, 0.64],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis19: {
    side: 'top',
    anchor: 'y19',
    domain: [0.61, 0.79],
  },
  yaxis19: {
    autorange: true,
    showgrid: false,
    anchor: 'x19',
    domain: [0.62, 0.64],
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis20: {
    side: 'top',
    anchor: 'y20',
    domain: [0.81, 1],
  },
  yaxis20: {
    autorange: true,
    showgrid: false,
    anchor: 'x20',
    domain: [0.62, 0.64],
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis21: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y21',
      domain: [0, 0.19],
      zeroline: false,
      showticklabels: false
  },
  yaxis21: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x21',
      domain: [0.46, 0.60],
      zeroline: false,
      showticklabels: false
  },
  xaxis22: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y22',
      domain: [0.21, 0.39],
      zeroline: false,
      showticklabels: false
  },
  yaxis22: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x22',
      domain: [0.46, 0.60],
      zeroline: false,
      showticklabels: false
  },
  xaxis23: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y23',
      domain: [0.41, 0.59],
      zeroline: false,
      showticklabels: false
  },
  yaxis23: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x23',
      domain: [0.46, 0.60],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis24: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y24',
      domain: [0.61, 0.79],
      zeroline: false,
      showticklabels: false
  },
  yaxis24: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      zeroline: false,
      anchor: 'x24',
      domain: [0.46, 0.60],
      showticklabels: false
  },
  xaxis25: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y25',
      domain: [0.81, 1],
      zeroline: false,
      showticklabels: false
  },
  yaxis25: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x25',
      domain: [0.46, 0.60],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis26: {
    side: 'top',
    anchor: 'y26',
    domain: [0, 0.19],
  },
  yaxis26: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    anchor: 'x26',
    domain: [0.42, 0.44],
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis27: {
    side: 'top',
    anchor: 'y27',
    domain: [0.21, 0.39],
  },
  yaxis27: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x27',
    domain: [0.42, 0.44],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis28: {
    side: 'top',
    anchor: 'y28',
    domain: [0.41, 0.59],
  },
  yaxis28: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x28',
    domain: [0.42, 0.44],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis29: {
    side: 'top',
    anchor: 'y29',
    domain: [0.61, 0.79],
  },
  yaxis29: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    anchor: 'x29',
    domain: [0.42, 0.44],
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis30: {
    side: 'top',
    anchor: 'y30',
    domain: [0.81, 1],
  },
  yaxis30: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    anchor: 'x30',
    domain: [0.42, 0.44],
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis31: {
    linecolor: 'black',
    linewidth: 1,
    mirror: true,
    showgrid: false,
    zeroline: false,
    anchor: 'y31',
    domain: [0, 0.19],
    showticklabels: false
  },
  yaxis31: {
      linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x31',
      domain: [0.26, 0.40],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis32: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'y32',
      domain: [0.21, 0.39],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis32: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x32',
      domain: [0.26, 0.40],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis33: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y33',
      domain: [0.41, 0.59],
      zeroline: false,
      showticklabels: false
  },
  yaxis33: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x33',
      domain: [0.26, 0.40],
      zeroline: false,
      showticklabels: false
  },
  xaxis34: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true, 
      anchor: 'y34',
      domain: [0.61, 0.79],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis34: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x34',
      domain: [0.26, 0.40],
      zeroline: false,
      showticklabels: false
  },
  xaxis35: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'y35',
      domain: [0.81, 1],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis35: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'x35',
      domain: [0.26, 0.40],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  xaxis36: {
    side: 'top',
    anchor: 'y36',
    domain: [0, 0.19],
  },
  yaxis36: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x36',
    domain: [0.22, 0.24],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis37: {
    side: 'top',
    anchor: 'y37',
    domain: [0.21, 0.39],
  },
  yaxis37: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x37',
    domain: [0.22, 0.24],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis38: {
    side: 'top',
    anchor: 'y38',
    domain: [0.41, 0.59],
  },
  yaxis38: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x38',
    domain: [0.22, 0.24],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis39: {
    side: 'top',
    anchor: 'y39',
    domain: [0.61, 0.79],
  },
  yaxis39: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    anchor: 'x39',
    domain: [0.22, 0.24],
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis40: {
    side: 'top',
    anchor: 'y40',
    domain: [0.81, 1],
  },
  yaxis40: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x40',
    domain: [0.22, 0.24],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis41: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y41',
      domain: [0, 0.19],
      zeroline: false,
      showticklabels: false
  },
  yaxis41: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x41',
      domain: [0.06, 0.20],
      zeroline: false,
      showticklabels: false
  },
  xaxis42: {
    linecolor: 'black',
      linewidth: 1,
      anchor: 'y42',
      domain: [0.21, 0.39],
      mirror: true,
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis42: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x42',
      domain: [0.06, 0.20],
      zeroline: false,
      showticklabels: false
  },
  xaxis43: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y43',
      domain: [0.41, 0.59],
      zeroline: false,
      showticklabels: false
  },
  yaxis43: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x43',
      domain: [0.06, 0.20],
      zeroline: false,
      showticklabels: false
  },
  xaxis44: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'y44',
      domain: [0.61, 0.79],
      zeroline: false,
      showticklabels: false
  },
  yaxis44: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x44',
      domain: [0.06, 0.20],
      zeroline: false,
      showticklabels: false
  },
  xaxis45: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      anchor: 'y45',
      domain: [0.81, 1],
      showgrid: false,
      zeroline: false,
      showticklabels: false
  },
  yaxis45: {
    linecolor: 'black',
      linewidth: 1,
      mirror: true,
      showgrid: false,
      anchor: 'x45',
      domain: [0.06, 0.20],
      zeroline: false,
      showticklabels: false
  },
  xaxis46: {
    side: 'top',
    anchor: 'y46',
    domain: [0, 0.19],
  },
  yaxis46: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x46',
    domain: [0.02, 0.04],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis47: {
    side: 'top',
    anchor: 'y47',
    domain: [0.21, 0.39],
  },
  yaxis47: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    showline: false,
    anchor: 'x47',
    domain: [0.02, 0.04],
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis48: {
    side: 'top',
    anchor: 'y48',
    domain: [0.41, 0.59],
  },
  yaxis48: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x48',
    domain: [0.02, 0.04],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis49: {
    side: 'top',
    anchor: 'y49',
    domain: [0.61, 0.79],
  },
  yaxis49: {
    autorange: true,
    showgrid: false,
    zeroline: false,
    anchor: 'x49',
    domain: [0.02, 0.04],
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },
  xaxis50: {
    side: 'top',
    anchor: 'y50',
    domain: [0.81, 1],
  },
  yaxis50: {
    autorange: true,
    showgrid: false,
    anchor: 'x50',
    domain: [0.02, 0.04],
    zeroline: false,
    showline: false,
    autotick: true,
    ticks: '',
    showticklabels: false
  },

  margin: {
    l: 10,
    r: 5,
    b: 0,
    t: 10,
    pad: 0
  },
  autosize: true,
  width: width,
  height: height,
  hovermode:'closest',
  legend: {"orientation": "h",
          y: 0},
  grid: {pattern: 'independent'},
  }

  var config = {displayModeBar: false}

  document.getElementById("loader").style.display = "none";

  Plotly.newPlot(graphDiv, traces, layout, config)

  var myPlot = document.getElementById('gridVisual')

  myPlot.on('plotly_click', function(data){

  var update = {
  'xaxis.linecolor': 'black',   // updates the xaxis range
  'yaxis.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis2.linecolor': 'black',   // updates the xaxis range
  'yaxis2.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis3.linecolor': 'black',   // updates the xaxis range
  'yaxis3.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis4.linecolor': 'black',   // updates the xaxis range
  'yaxis4.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis5.linecolor': 'black',   // updates the xaxis range
  'yaxis5.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis11.linecolor': 'black',   // updates the xaxis range
  'yaxis11.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis12.linecolor': 'black',   // updates the xaxis range
  'yaxis12.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis13.linecolor': 'black',   // updates the xaxis range
  'yaxis13.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis14.linecolor': 'black',   // updates the xaxis range
  'yaxis14.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis15.linecolor': 'black',   // updates the xaxis range
  'yaxis15.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis21.linecolor': 'black',   // updates the xaxis range
  'yaxis21.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis22.linecolor': 'black',   // updates the xaxis range
  'yaxis22.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis23.linecolor': 'black',   // updates the xaxis range
  'yaxis23.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis24.linecolor': 'black',   // updates the xaxis range
  'yaxis24.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis25.linecolor': 'black',   // updates the xaxis range
  'yaxis25.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis31.linecolor': 'black',   // updates the xaxis range
  'yaxis31.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis32.linecolor': 'black',   // updates the xaxis range
  'yaxis32.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis33.linecolor': 'black',   // updates the xaxis range
  'yaxis33.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis34.linecolor': 'black',   // updates the xaxis range
  'yaxis34.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis35.linecolor': 'black',   // updates the xaxis range
  'yaxis35.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis41.linecolor': 'black',   // updates the xaxis range
  'yaxis41.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis42.linecolor': 'black',   // updates the xaxis range
  'yaxis42.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis43.linecolor': 'black',   // updates the xaxis range
  'yaxis43.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis44.linecolor': 'black',   // updates the xaxis range
  'yaxis44.linecolor': 'black',    // updates the end of the yaxis range
  'xaxis45.linecolor': 'black',   // updates the xaxis range
  'yaxis45.linecolor': 'black',    // updates the end of the yaxis range
  };
  Plotly.relayout(graphDiv, update)

    SelProjIDS = []
    if (data.points[0].xaxis._id == 'x') {

        var update = {
          'xaxis.linecolor': 'red',   // updates the xaxis range
          'yaxis.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(0)
    } else if (data.points[0].xaxis._id == 'x2') {

        var update = {
          'xaxis2.linecolor': 'red',   // updates the xaxis range
          'yaxis2.linecolor': 'red'    // updates the end of the yaxis range
        };

      
      SelProjIDS.push(1)
    } else if (data.points[0].xaxis._id == 'x3') {

        var update = {
          'xaxis3.linecolor': 'red',   // updates the xaxis range
          'yaxis3.linecolor': 'red'    // updates the end of the yaxis range
        };
    
      SelProjIDS.push(2)
    } else if (data.points[0].xaxis._id == 'x4') {

        var update = {
          'xaxis4.linecolor': 'red',   // updates the xaxis range
          'yaxis4.linecolor': 'red'    // updates the end of the yaxis range
        };

      
      SelProjIDS.push(3)
    } else if (data.points[0].xaxis._id == 'x5') {

        var update = {
          'xaxis5.linecolor': 'red',   // updates the xaxis range
          'yaxis5.linecolor': 'red'    // updates the end of the yaxis range
        };

      SelProjIDS.push(4)
    } else if (data.points[0].xaxis._id == 'x11') {

    
        var update = {
          'xaxis11.linecolor': 'red',   // updates the xaxis range
          'yaxis11.linecolor': 'red'    // updates the end of the yaxis range
        };
    
      SelProjIDS.push(5)
    } else if (data.points[0].xaxis._id == 'x12') {

      
        var update = {
          'xaxis12.linecolor': 'red',   // updates the xaxis range
          'yaxis12.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(6)
    } else if (data.points[0].xaxis._id == 'x13') {


        var update = {
          'xaxis13.linecolor': 'red',   // updates the xaxis range
          'yaxis13.linecolor': 'red'    // updates the end of the yaxis range
        };
        firstProj = false
    
      SelProjIDS.push(7)
    } else if (data.points[0].xaxis._id == 'x14') {

        var update = {
          'xaxis14.linecolor': 'red',   // updates the xaxis range
          'yaxis14.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(8)
    } else if (data.points[0].xaxis._id == 'x15') {

        var update = {
          'xaxis15.linecolor': 'red',   // updates the xaxis range
          'yaxis15.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(9)
    } else if (data.points[0].xaxis._id == 'x21') {

        var update = {
          'xaxis21.linecolor': 'red',   // updates the xaxis range
          'yaxis21.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(10)
    } else if (data.points[0].xaxis._id == 'x22') {

        var update = {
          'xaxis22.linecolor': 'red',   // updates the xaxis range
          'yaxis22.linecolor': 'red'    // updates the end of the yaxis range
        };

      SelProjIDS.push(11)
    } else if (data.points[0].xaxis._id == 'x23') {

        var update = {
          'xaxis23.linecolor': 'red',   // updates the xaxis range
          'yaxis23.linecolor': 'red'    // updates the end of the yaxis range
        };
    
      SelProjIDS.push(12)
    } else if (data.points[0].xaxis._id == 'x24') {

        var update = {
          'xaxis24.linecolor': 'red',   // updates the xaxis range
          'yaxis24.linecolor': 'red'    // updates the end of the yaxis range
        };

      SelProjIDS.push(13)
    } else if (data.points[0].xaxis._id == 'x25') {

        var update = {
          'xaxis25.linecolor': 'red',   // updates the xaxis range
          'yaxis25.linecolor': 'red'    // updates the end of the yaxis range
        };

      SelProjIDS.push(14)
    } else if (data.points[0].xaxis._id == 'x31') {

        var update = {
          'xaxis31.linecolor': 'red',   // updates the xaxis range
          'yaxis31.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(15)
    } else if (data.points[0].xaxis._id == 'x32') {

        var update = {
          'xaxis32.linecolor': 'red',   // updates the xaxis range
          'yaxis32.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(16)
    } else if (data.points[0].xaxis._id == 'x33') {

        var update = {
          'xaxis33.linecolor': 'red',   // updates the xaxis range
          'yaxis33.linecolor': 'red'    // updates the end of the yaxis range
        };
        firstProj = false
      
      SelProjIDS.push(17)
    } else if (data.points[0].xaxis._id == 'x34') {

        var update = {
          'xaxis34.linecolor': 'red',   // updates the xaxis range
          'yaxis34.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(18)
    } else if (data.points[0].xaxis._id == 'x35') {

        var update = {
          'xaxis35.linecolor': 'red',   // updates the xaxis range
          'yaxis35.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(19)
    } else if (data.points[0].xaxis._id == 'x41') {

        var update = {
          'xaxis41.linecolor': 'red',   // updates the xaxis range
          'yaxis41.linecolor': 'red'    // updates the end of the yaxis range
        };
    
      SelProjIDS.push(20)
    } else if (data.points[0].xaxis._id == 'x42') {

        var update = {
          'xaxis42.linecolor': 'red',   // updates the xaxis range
          'yaxis42.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(21)
    } else if (data.points[0].xaxis._id == 'x43') {

        var update = {
          'xaxis43.linecolor': 'red',   // updates the xaxis range
          'yaxis43.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(22)
    } else if (data.points[0].xaxis._id == 'x44') {

        var update = {
          'xaxis44.linecolor': 'red',   // updates the xaxis range
          'yaxis44.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(23)
    } else {

        var update = {
          'xaxis45.linecolor': 'red',   // updates the xaxis range
          'yaxis45.linecolor': 'red'    // updates the end of the yaxis range
        };
      
      SelProjIDS.push(24)
    }

    document.getElementById("confirmModal").disabled = false;

  Plotly.relayout(graphDiv, update)


  activeProjectionNumber = order[SelProjIDS[0]]

});
}

function setContinue(){ // This function allows the continuation of the analysis because it decreases the layer value of the annotator.
  d3v3.select("#SvgAnnotator").style("z-index", 1);
}

function setReset(){ // Reset only the filters which were applied into the data points.

  VisiblePoints = [];
  emptyPCP();
  // Clear d3 SVGs
  d3.selectAll("#correlation > *").remove(); 
  d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
  d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
  d3.select("#PCP").selectAll('g').remove();
  // Enable lasso interaction
  lassoEnable();
  // Disable Schema Investigation
  flagForSchema = false;
  // Empty all the arrays that are related to Schema Investigation
  Arrayx = [];
  Arrayy = [];
  XYDistId = [];
  Arrayxy = [];
  DistanceDrawing1D = [];
  allTransformPoints = [];
  pFinal = [];
  ArrayLimit = [];
  correlationResults = [];
  ArrayContainsDataFeaturesLimit = [];
  prevRightClick = false;

  

  //pcpInitialize();

  // Reset the points into their initial state
  for (var i=0; i < InitialStatePoints.length; i++){
    InitialStatePoints[i].selected = true;
    InitialStatePoints[i].pcp = false;
    InitialStatePoints[i].schemaInv = false;
    InitialStatePoints[i].DimON = null;
  }
  redraw(InitialStatePoints);

}

function setReInitializeDistanceCorrelation(flag){
  if(flag){
    // Change between color-encoding and size-encoding mapped to 1/sigma and KLD.
    var correlationMeasur = document.getElementById("param-correlationMeasur").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
    correlationMeasur = parseInt(correlationMeasur);

    if (correlationMeasur == 1){
      document.getElementById('param-corrLabel2').style = 'display: none';
      document.getElementById('param-corr2').style = 'display: none';
      document.getElementById('param-corr-value2').style = 'display: none';
      document.getElementById('param-corrLabel').style = 'display: normal';
      document.getElementById('param-corr').style = 'display: normal';
      document.getElementById('param-corr').style = 'margin-left: -20px';
      document.getElementById('param-corr-value').style = 'display: normal';
      document.getElementById('param-corr-value').style = 'margin-left: -20px';
    } else{
      document.getElementById('param-corrLabel').style = 'display: none';
      document.getElementById('param-corr').style = 'display: none';
      document.getElementById('param-corr-value').style = 'display: none';
      document.getElementById('param-corrLabel2').style = 'display: normal';
      document.getElementById('param-corr2').style = 'display: normal';
      document.getElementById('param-corr2').style = 'margin-left: -20px';
      document.getElementById('param-corr-value2').style = 'display: normal';
      document.getElementById('param-corr-value2').style = 'margin-left: -20px';
    }
  }
}


function setReInitialize(flag){
  if(flag){
    // Change between color-encoding and size-encoding mapped to 1/sigma and KLD.
    if (document.getElementById('selectionLabel').innerHTML == 'Size'){
      document.getElementById('selectionLabel').innerHTML = 'Color';
    } else{
      document.getElementById('selectionLabel').innerHTML = 'Size';
    }
  } 

  // Clear d3 SVGs
  d3.selectAll("#correlation > *").remove(); 
  d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
  d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
  d3.selectAll("#SvgAnnotator > *").remove(); 
  
    // Clear d3 SVGs
    d3.selectAll("#correlation > *").remove(); 
    d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
    d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
    d3.selectAll("#SvgAnnotator > *").remove(); 
    // Enable lasso interaction
    lassoEnable();
    // Disable Schema Investigation
    flagForSchema = false;
    // Empty all the arrays that are related to Schema Investigation
    Arrayx = [];
    Arrayy = [];
    XYDistId = [];
    Arrayxy = [];
    DistanceDrawing1D = [];
    allTransformPoints = [];
    pFinal = [];
    ArrayLimit = [];
    correlationResults = [];
    ArrayContainsDataFeaturesLimit = [];
    prevRightClick = false;

  // Reset the points into their initial state
  for (var i=0; i < InitialStatePoints.length; i++){
    InitialStatePoints[i].selected = true;
    InitialStatePoints[i].pcp = false;
  }
  redraw(InitialStatePoints);

}

function setLayerProj(){ // The main Layer becomes the projection
  VisiblePoints = [];
  d3.select("#modtSNEcanvas").style("z-index", 2);
  d3.select("#modtSNEcanvas_svg").style("z-index", 1);
  d3.select("#modtSNEcanvas_svg_Schema").style("z-index", 1);
  d3.select("#SvgAnnotator").style("z-index", 1);
  lassoFlag = false

}

function setLayerComp(){ // The main Layer becomes the comparison (pcp)
  VisiblePoints = [];
  d3.selectAll("#modtSNEcanvas_svg > *").remove();
  d3.select("#modtSNEcanvas_svg").style("z-index", 2);
  d3.select("#modtSNEcanvas_svg_Schema").style("z-index", 1);
  d3.select("#modtSNEcanvas").style("z-index", 1);
  d3.select("#SvgAnnotator").style("z-index", 1);
  lassoFlag = true
  if (points.length){
    lassoEnable();
  }

  redraw(points);

}

function setLayerSche(){ // The main Layer becomes the correlation (barchart)
  VisiblePoints = [];
  d3.select("#modtSNEcanvas_svg_Schema").style("z-index", 2);
  d3.select("#modtSNEcanvas").style("z-index", 1);
  d3.select("#modtSNEcanvas_svg").style("z-index", 1);
  d3.select("#SvgAnnotator").style("z-index", 1);
  for (var i=0; i < points.length; i++){
    points[i].selected = true;
    if (points[i].pcp == true){
      points[i].pcp = false;
    }
  }
  emptyPCP();
  redraw(points);
  click();
  if (prevRightClick == true){
    flagForSchema = true;
    CalculateCorrel();
  }
  lassoFlag = false
}

function lassoEnable(){ // The main Layer becomes the correlation (barchart)

  var interactionSvg = d3.select("#modtSNEcanvas_svg")
  .attr("width", dimensions)
  .attr("height", dimensionsY)
  .style('position', 'absolute')
  .style('top', 0)
  .style('left', 0);

  var lassoInstance = lasso()
    .on('end', handleLassoEnd) // Lasso ending point of the interaction
    .on('start', handleLassoStart); // Lasso starting point of the interaction

  interactionSvg.call(lassoInstance);  

}

function deleteAnnotations(){
  AnnotationsAll = [];
  ringNotes = [];
  d3.selectAll("#SvgAnnotator > *").remove(); 
}

function BringBackAnnotations(){
  d3.select("#SvgAnnotator").style("z-index", 3);
}

function setAnnotator(){ // Set a new annotation on top of the main visualization.

  vw2 = dimensions;
  vh2 = dimensionsY;

  var textarea = document.getElementById("comment").value;

  d3.select("#SvgAnnotator").style("z-index", 3);

  var annotations = [ // Initialize the draggable ringNote.
  {
  "cx": 232,
  "cy": 123,
  "r": 103,
  "text": textarea,
  "textOffset": [
    114,
    88
  ]
  }
  ];

  var ringNote = d3v3.ringNote() // Make it draggable.
  .draggable(true);

  var svgAnnotator = d3v3.select("#SvgAnnotator")
  .attr("width", vw2)
  .attr("height", vh2)
  .style("z-index", 3);
  var gAnnotations = svgAnnotator.append("g")
  .attr("class", "annotations")
  .call(ringNote, annotations);

  // Styling individual annotations based on bound data
  gAnnotations.selectAll(".annotation circle")
  .classed("shaded", function(d) { return d.shaded; });

  ringNotes.push(ringNote); // Push all the ringNote and annotations and enable draggable property.
  gAnnotationsAll.push(gAnnotations);
  AnnotationsAll.push(annotations);
  draggable.push(true);
  document.getElementById("comment").value = '';
    $('#comment').removeAttr('placeholder');
}

  // Hide or show the controls
  d3.select("#controls")
  .on("change", function() {
    if(ringNotes[0]){ // If at least one ringNote exists, then enable or disable the draggable and radius changing controllers.
      for (var i = 0; i < ringNotes.length; i++){
        ringNotes[i].draggable(draggable[i] = !draggable[i]);
        gAnnotationsAll[i]
            .call(ringNotes[i], AnnotationsAll[i])
            .selectAll(".annotation circle")
            .classed("shaded", function(d) { return d.shaded; });
      }
    } else{
      // Get the checkbox.
      var checkBox = document.getElementById("controls");
      // Unchecked!
      checkBox.checked = false;
      // Print a message to the user.
      alert("Cannot hide the annotator controls because there are no comments on top of the main visualization at the moment.")
    }
  });

  $(document).ready(function() {
    //set initial state.

    $('#downloadDists').change(function() {
        if(!this.checked) {
            returnVal = confirm("Are you sure that you want to store only the points and all the parameters without the distances?");
            $(this).prop("checked", !returnVal);
        }
    });
});

  // Three.js render loop for the very first scene.
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

function MainVisual(){

  MainCanvas = document.getElementById('modtSNEcanvas');
  Child = document.getElementById('modtSNEDiv');

  // Add main canvas
  renderer = new THREE.WebGLRenderer({ canvas: MainCanvas });
  renderer.setSize(dimensions, dimensionsY);
  Child.append(renderer.domElement);

  // Add a new empty (white) scene.
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Set up camera.
  camera = new THREE.PerspectiveCamera(
    fov,
    dimensions / dimensionsY,
    near,
    far 
  );
  // Animate the scene.
  animate();

  if (points.length > 0){
    BetatSNE(points);
  }

}
 

// The following function executes exactly after the data is successfully loaded. New EXECUTION!
// results_all variable is all the columns multiplied by all the rows.
// data variable is all the columns except strings, undefined values, or "Version" plus beta and cost values."
// fields variable is all the features (columns) plus beta and cost strings.  
function init(data, results_all, fields) { 

    $('#comment').attr('placeholder', "Write a comment.");
    ArrayWithCosts = [];
    Iterations = [];
    VisiblePoints = [];
    points = [];
    // Remove all previously drawn SVGs
    d3.selectAll("#correlation > *").remove(); 
    d3.selectAll("#modtSNEcanvas_svg > *").remove();
    d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
    d3.selectAll("#SvgAnnotator > *").remove(); 
    d3.selectAll("#sheparheat > *").remove(); 
    d3.selectAll("#overviewRect > *").remove(); 
    d3.selectAll("#knnBarChart > *").remove(); 
    d3.selectAll("#costHist > *").remove(); 
    d3.select("#PCP").selectAll('g').remove();
    MainVisual();
    //pcpInitialize();
    
    d3.select("#hider").style("z-index", 2);
    d3.select("#hider").style("width", "48.7vw");
    d3.select("#hider").style("height", overallHeight/11.8);
    d3.select("#knnBarChart").style("z-index", 1);

    d3.select("#hider2").style("z-index", 2);
    d3.select("#hider2").style("width", overallWidth/4.6);
    d3.select("#hider2").style("height", overallHeight/16);
    d3.select("#PlotCost").style("z-index", 1);

    // Clear the previously drawn main visualization canvas.
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Clear all the legends that were drawn.
    d3.selectAll("#legend1 > *").remove();
    d3.selectAll("#legend2 > *").remove();
    d3.selectAll("#legend3 > *").remove();
    d3.selectAll("#legend4 > *").remove();

    $("#datasetDetails").html('(Num. of Dim. and Ins.: ?)');
    $("#CategoryName").html('No labels');
    $("#knnBarChartDetails").html('(Num. of Selected Points: 0/0)');

    // Enable again the lasso interaction.
    lassoEnable();
    emptyPCP();
    // Empty all the Schema Investigation arrays.
    Arrayx = [];
    Arrayy = [];
    XYDistId = [];
    Arrayxy = [];
    DistanceDrawing1D = [];
    allTransformPoints = [];
    pFinal = [];
    ArrayLimit = [];
    correlationResults = [];
    ArrayContainsDataFeaturesLimit = [];
    prevRightClick = false;

    // Step counter set to 0
    step_counter = 0;
    // Get the new parameters from the t-SNE parameters panel.
    if (sliderTrigger) {
      if (sliderInsideTrigger) {
        max_counter = parameters[activeProjectionNumberProv][2]
        $('#param-maxiter-value').text(max_counter);
      } else {
        max_counter = parameters[activeProjectionNumber][2]
        $('#param-maxiter-value').text(max_counter);
      }
    } else {
      max_counter = document.getElementById("param-maxiter-value").value;
    }
    opt = {};
    var fields;
    fields.push("beta");
    fields.push("cost");
    if (sliderTrigger) {
      if (sliderInsideTrigger) {
        opt.perplexity = parameters[activeProjectionNumberProv][0]
        opt.epsilon = parameters[activeProjectionNumberProv][1]
        $('#param-perplexity-value').text(opt.perplexity);
        $('#param-learningrate-value').text(opt.epsilon);
      } else {
        opt.perplexity = parameters[activeProjectionNumber][0]
        opt.epsilon = parameters[activeProjectionNumber][1]
        $('#param-perplexity-value').text(opt.perplexity);
        $('#param-learningrate-value').text(opt.epsilon);
      }
    } else {
      opt.epsilon = document.getElementById("param-learningrate-value").value; // Epsilon is learning rate (10 = default)
      opt.perplexity = document.getElementById("param-perplexity-value").value; // Roughly how many neighbors each point influences (30 = default)
    }


    // Put the input variables into more properly named variables and store them.
    final_dataset = data;
    dataFeatures = results_all;
    if (flagAnalysis){
    } else{
      dists = [];
      dists = computeDistances(data, 'euclideanDist', 'noTrans'); // Compute the distances in the high-dimensional space.
      InitialFormDists.push(dists);
      //tsne.initDataDist(dists); // Init t-SNE with dists.
      //for(var i = 0; i < final_dataset.length; i++) {final_dataset[i].beta = tsne.beta[i]; beta_all[i] = tsne.beta[i];} // Calculate beta and bring it back from the t-SNE algorithm.
    }
    var object;
    all_labels = [];
    // Get the dimension that contains an asterisk mark ("*"). This is our classification label.
    dataFeatures.filter(function(obj) { 

      var temp = []; 
      temp.push(Object.keys(obj)); 
      for (var object in temp[0]){
        if(temp[0][object].indexOf("*") != -1){
          Category = temp[0][object];
          return Category;
        }
      }

    });
    ArrayContainsDataFeaturesCleared = [];
    ArrayContainsDataFeaturesClearedwithoutNull = [];
    ArrayContainsDataFeaturesClearedwithoutNullKeys = [];
    for (let k = 0; k < dataFeatures.length; k++){

      object = [];
      object2 = [];
      object3 = [];
      for (let j = 0; j < Object.keys(dataFeatures[k]).length; j++){
        if(!isString((Object.values(dataFeatures[k])[j])) && (Object.keys(dataFeatures[k])[j] != Category)){ // Only numbers and not the classification labels. 
          object.push(Object.values(dataFeatures[k])[j]);
          object2.push(Object.values(dataFeatures[k])[j]);
          object3.push(Object.keys(dataFeatures[k])[j]);
        } else {
          object.push(null);
        }
      }
      ArrayContainsDataFeaturesCleared.push(object.concat(k)); // The ArrayContainsDataFeaturesCleared contains only numbers without the categorization parameter even if it is a number.
      ArrayContainsDataFeaturesClearedwithoutNull.push(object2);
      ArrayContainsDataFeaturesClearedwithoutNullKeys.push(object3);
    }
    valCategExists = 0;
    for (var i=0; i<Object.keys(dataFeatures[0]).length; i++){
      if (Object.keys(dataFeatures[0])[i] == Category){
        valCategExists = valCategExists + 1;
      }
    }

    for(var i = 0; i < dataFeatures.length; i++) {
      if (dataFeatures[i][Category] != "" || dataFeatures[i][Category] != "undefined"){ // If a categorization label exist then add it into all_labels variable.
        if (format[0] == "diabetes"){
          if (dataFeatures[i][Category] == 1){
            all_labels[i] = "Positive";
          } else{
            all_labels[i] = "Negative";
          }
        } else{
          all_labels[i] = dataFeatures[i][Category];
        }
      }
    }

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
    }
    

    // During the initialization check if we loaded a previous analysis.
    input = document.getElementById("file-input");
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    } else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    } else if (!input.files[0]) { // If we execute a new analysis continue running with a step = 0.
      AnalysisResults = [];
      runner = setInterval(step, 0);
    } else {
      fetchVal(function(lines){ // If we uploaded a previous analysis file then parse the .txt file with JSON.parse.
        AnalysisResults = JSON.parse(lines); 
        updateEmbedding(AnalysisResults);
    });
    }
}

// Initialize distance matrix
function initDist(data) {

    var dist = new Array(data.length);
    for(var i = 0; i < data.length; i++) {
      dist[i] = new Array(data.length);
    }
    for(var i = 0; i < data.length; i++) {
      for(var j = 0; j < data.length; j++) {
        dist[i][j] = 0;
      }
    }
    return dist;

}

// Calculate euclidean distance
function euclideanDist(data) {

  dist = initDist(data);
  for(var i = 0; i < data.length; i++) {
    for(var j = i + 1; j < data.length; j++) {
      for(var d in data[0]) {
        if(d != Category) {
          dist[i][j] += Math.pow(data[i][d] - data[j][d], 2);
        }
      }
      dist[i][j] = Math.sqrt(dist[i][j]);
      dist[j][i] = dist[i][j];
      }
    }
  return dist;

}

// Normalize distances to prevent numerical issues.
function normDist(data, dist) {

  var max_dist = 0;
  for(var i = 0; i < data.length; i++) {
    for(var j = i + 1; j < data.length; j++) {
      if(dist[i][j] > max_dist) max_dist = dist[i][j];
    }
  }
  for(var i = 0; i < data.length; i++) {
    for(var j = 0; j < data.length; j++) {
      dist[i][j] /= max_dist;
    }
  }
  return dist;

}

// No tranformation
function noTrans(data) {
  return data;
}

// Compute the distances by applying the chosen distance functions and transformation functions.
function computeDistances(data, distFunc, transFunc) {
  dist = eval(distFunc)(eval(transFunc)(data));
  dist = normDist(data, dist);
  return dist;

}

function OverallCostLineChart(){

  d3.select("#hider2").style("z-index", -1);
  d3.select("#hider2").style("width", 0);
  d3.select("#hider2").style("height", 0);
  d3.select("#PlotCost").style("z-index", 2);

  var trace1 = {
    x: Iterations,
    y: ArrayWithCosts,
    mode: 'lines',
    connectgaps: true,
    marker: {
      color: "rgb(0,128,0)", 
       line: {
        color:  "rgb(0, 0, 0)", 
        width: 0.5
      }
    }
  }
  
  var data = [trace1];
  
  var layout = {
    showlegend: false,
    width: overallWidth/4.6,
    height: overallHeight/16,
    xaxis:{title: 'Iteration',
      titlefont: {
        family: "sans-serif",
        size: '11',
        color: 'black'
      }},
    yaxis:{title: 'Ov. cost',
      titlefont: {
        family: "sans-serif",
        size: '11',
        color: 'black'
      },
      y: 0.1,},
    margin: {
      l: 32,
      r: 15,
      b: 25,
      t: 6
    },
  };
  
  Plotly.newPlot('PlotCost', data, layout,{displayModeBar:false}, {staticPlot: true}, {responsive: true});
}

// Function that updates embedding
function updateEmbedding(AnalysisResults) {
  
  inside = 0;
  points = [];
  points2d = [];
  if (AnalysisResults == ""){ // Check if the embedding does not need to load because we had a previous analysis uploaded.
    if (sliderTrigger) {
      if (sliderInsideTrigger) {
        var Y = projections[activeProjectionNumberProv]
      } else {
        var Y = projections[activeProjectionNumber]
      }
    } else {
      var Y = projections[activeProjectionNumber]
    }
    var xExt = d3.extent(Y, d => d[0]);
    var yExt = d3.extent(Y, d => d[1]);
    var maxExt = [Math.min(xExt[0], yExt[0]), Math.max(xExt[1], yExt[1])];

    var x = d3.scaleLinear() // Scale the x points into the canvas width/height
            .domain(maxExt)
            .range([10, +dimensions-10]);

    var y = d3.scaleLinear() // Scale the y points into the canvas width/height
            .domain(maxExt)
            .range([+dimensionsY-10, 10]);

      for(var i = 0; i < betas[activeProjectionNumber].length; i++) {
        x_position[i] = x(Y[i][0]); // x points position
        y_position[i] = y(Y[i][1]); // y points position
            points[i] = {id: i, x: x_position[i], y: y_position[i], beta: betas[activeProjectionNumber][i], cost: cost_per_point[activeProjectionNumber][i], selected: true, schemaInv: false, DimON: null, pcp: false}; // Create the points and points2D (2 dimensions) 
            points2d[i] = {x: x_position[i], y: y_position[i]}; // and add everything that we know about the points (e.g., selected = true, pcp = false in the beginning and so on)
            points[i] = extend(points[i], ArrayContainsDataFeaturesCleared[i]);
            points[i] = extend(points[i], dataFeatures[i]);
        }
  } else{
    if (flagAnalysis){
      var length = (AnalysisResults.length - dataFeatures.length*2 - 9 - 2);
      points = AnalysisResults.slice(0, dataFeatures.length); // Load the points from the previous analysis
      points2d = AnalysisResults.slice(dataFeatures.length, 2*dataFeatures.length); // Load the 2D points 
      dist_list = AnalysisResults.slice(2*dataFeatures.length, 2*dataFeatures.length+length/2); // Load the parameters and set the necessary values to the visualization of those parameters.
      dist_list2d = AnalysisResults.slice(2*dataFeatures.length+length/2, 2*dataFeatures.length+length); // Load the parameters and set the necessary values to the visualization of those parameters.
      overallCost = AnalysisResults.slice(2*dataFeatures.length+length,  2*dataFeatures.length+length+1); // Load the overall cost
      ParametersSet = AnalysisResults.slice(2*dataFeatures.length+length+1, 2*dataFeatures.length+length+7); // Load the parameters and set the necessary values to the visualization of those parameters.
      dists = AnalysisResults.slice(2*dataFeatures.length+length+7, 2*dataFeatures.length+length+8)[0]; // Load the parameters and set the necessary values to the visualization of those parameters.
      dists2d = AnalysisResults.slice(2*dataFeatures.length+length+8, 2*dataFeatures.length+length+9)[0]; // Load the parameters and set the necessary values to the visualization of those parameters.
      IterationsList = AnalysisResults.slice(2*dataFeatures.length+length+9, 2*dataFeatures.length+length+10);
      ArrayWithCostsList = AnalysisResults.slice(2*dataFeatures.length+length+10, 2*dataFeatures.length+length+11);
      Iterations = IterationsList[0];
      ArrayWithCosts = ArrayWithCostsList[0];
      $("#cost").html("(Ov. Cost: " + overallCost + ")");
      $('#param-perplexity-value').text(ParametersSet[1]);
      $('#param-learningrate-value').text(ParametersSet[2]);
      $('#param-maxiter-value').text(ParametersSet[3]);
    } else{
      var length = (AnalysisResults.length - 9) / 2;
      points = AnalysisResults.slice(0, length); // Load the points from the previous analysis
      points2d = AnalysisResults.slice(length, 2*length); // Load the 2D points 
      overallCost = AnalysisResults.slice(2*length, 2*length+1); // Load the overall cost
      ParametersSet = AnalysisResults.slice(2*length+1, 2*length+7); // Load the parameters and set the necessary values to the visualization of those parameters.
      IterationsList = AnalysisResults.slice(2*length+7, 2*length+8);
      ArrayWithCostsList = AnalysisResults.slice(2*length+8, 2*length+9);
      Iterations = IterationsList[0];
      ArrayWithCosts = ArrayWithCostsList[0];
      $("#cost").html("(Ov. Cost: " + overallCost + ")");
      $('#param-perplexity-value').text(ParametersSet[1]);
      $('#param-learningrate-value').text(ParametersSet[2]);
      $('#param-maxiter-value').text(ParametersSet[3]);
    }
    $("#data").html(ParametersSet[0]); // Print on the screen the classification label.
    $("#param-dataset").html('-');
  }

  OverallCostLineChart(); // Cost plot
  InitialStatePoints = points; // Initial Points will not be modified!

  function extend(obj, src) { // Call this function to add additional information to the points such as dataFeatures and Array which contains the data features without strings.
  for (var key in src) {
      if (src.hasOwnProperty(key)) obj[key] = src[key];
  }
    return obj; // Return the different forms of the same data that we eventually store on those points.
  }
  
  // Run all the main functions (Shepard Heatmap, Overview t-SNE, and Beta/Cost t-SNE) Beta = 1/sigma, Cost = KLD(Q||P).
  OverviewtSNE(points);
  ShepardHeatMap();
  BetatSNE(points);
  CostHistogram(points);
}

function ShepardHeatMap () {
  
  // Remove any previous shepard heatmaps.
  d3.selectAll("#sheparheat > *").remove();
  d3.selectAll("#legend3 > *").remove();

  // Get the checkbox
  var SHViewOptions = document.getElementById("param-SH-view").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
  SHViewOptions = parseInt(SHViewOptions);
  // Get the output text

  if (SHViewOptions == 1) {

    // Set the margin of the shepard heatmap
    var margin = { top: 35, right: 15, bottom: 15, left: 40 },
    dim2 = Math.min(parseInt(d3.select("#sheparheat").style("width")), parseInt(d3.select("#sheparheat").style("height")))
    width = dim2- margin.left - margin.right,
    height = dim2 - margin.top - margin.bottom,
    buckets = 10, // Set the number of buckets.
    gridSize = width / buckets,
    dim_1 = ["0.0", "0.2", "0.4", "0.6", "0.8", "1.0"], // Set the dimensions for the output and input distances.
    dim_2 = ["0.0", "0.4", "0.6", "1.0"] //I.e., the axes.

    // Create the svg for the shepard heatmap
    var svg = d3.select("#sheparheat")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (flagAnalysis){
    } else{
      dists2d = [];
      dist_list2d = []; // Distances lists empty
      dist_list = [];
      // Calculate the 2D distances.
      dists2d = computeDistances(points2d, 'euclideanDist', 'noTrans');
      InitialFormDists2D.push(dists2d);
      for (var j=0; j<dists2d.length; j++){ // Fill them with the distances 2D and high-dimensional, respectively.
        dists2d[j] = dists2d[j].slice(0,j);
        dists[j] = dists[j].slice(0,j);
      }
    
      for (var i=0; i<dists2d.length; i++){
        for (var j=0; j<dists2d.length; j++){
          let singleObj = {};
          singleObj = dists2d[i][j];
          dist_list2d.push(singleObj);
          let singleObj2 = {};
          singleObj2 = dists[i][j];
          dist_list.push(singleObj2);
        }
      }
      dist_list2d = dist_list2d.sort(); // Sort the lists that contain the distances.
      dist_list = dist_list.sort();
      dist_list2d = dist_list2d.filter(function(val){ return val!==undefined; }); // Filter all undefined values
      dist_list = dist_list.filter(function(val){ return val!==undefined; });
    }
      

    d3.tsv("./modules/heat.tsv").then(function(data) { // Run the heat.tsv file and get the data from there. This file contains and ordering of the dimensions 1 and dimensions 2.
    // For example: dim1 = 1 and the dim 2 = 1, 2, 3, 4, 5, 6, 7, 8, 9, 10... and then dim2 = 2 and the dim2=... (same)
      data.forEach(function(d) { // Get the data from the heat.tsv.
          d.dim1 = +d.dim1;
          d.dim2 = +d.dim2;
          d.value = 0;
      });

      var counter = 0;
      var counnum = [];
      var temp_loop = 0;
      for (var l=0; l<100; l++) {counnum[l] = 0};
      var dist_list_all = [];
      dist_list_all =[dist_list, dist_list2d]; // Combine the two lists.

      for (var l=0; l<100; l++){ // Here we calculate the shepard diagram and then we add the colors! -> shepard heatmap
        for (k=0; k<dist_list_all[0].length;k++){
          if (l==0){
            if (dist_list_all[0][k] <= data[l].dim1/10 && dist_list_all[1][k] <= data[l].dim2/10){
              counnum[l] = counnum[l] + 1;
            }
          }else if (l <= 10){
            if (dist_list_all[0][k] < data[l].dim1/10 && dist_list_all[1][k] < data[l].dim2/10 && dist_list_all[1][k] > data[l-1].dim2/10){
              counnum[l] = counnum[l] + 1;
            }
          }else if (l % 10 == 1){
            temp_loop = data[l].dim1-1;
            if (dist_list_all[0][k] < data[l].dim1/10 && dist_list_all[1][k] < data[l].dim2/10 && dist_list_all[0][k] > temp_loop/10){
              counnum[l] = counnum[l] + 1;
            }
          }else{
            if (dist_list_all[0][k] <= data[l].dim1/10 && dist_list_all[1][k] <= data[l].dim2/10 && dist_list_all[1][k] >= data[l-1].dim2/10 && dist_list_all[0][k] > temp_loop/10){
              counnum[l] = counnum[l] + 1;
            }
          }
        }
        counter = counter + counnum[l];
      }

      for (var m=0; m<data.length; m++)
      {
        data[m].value = counnum[m]; // Count the number of data values.
      }

      // Color scale for minimum and maximum values for the shepard heatmap.
      var maxNum = Math.round(d3.max(data,function(d){ return d.value; }));
      var minNum = Math.round(d3.min(data,function(d){ return d.value; }));
      var colors = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"];
      let calcStep = (maxNum-minNum)/colors.length;
      var colorScale = d3.scaleLinear()
          .domain(d3.range(0, maxNum+calcStep,calcStep))
          .range(colors);

      var tip = d3.tip() // This is for the tooltip that is being visible when you hover over a square on the shepard heatmap.
                  .attr('class', 'd3-tip')
                  .style("visibility","visible")
                  .offset([-10, 36.5])
                  .html(function(d) {
                    return "Value:  <span style='color:red'>" + Math.round(d.value);
                  });

      tip(svg.append("g"));

      var dim1Labels = svg.selectAll(".dim1Label") // Label
          .data(dim_1)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize * 2; })
            .style("text-anchor", "end")
            .style("font-size", "calc(0.35em + 0.5vmin)")
            .attr("transform", "translate(-6," + gridSize / 4 + ")")
            .attr("class","mono");
  

      /*var tooltip2 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "12")	
        .style("text-align","center")
        .style("width","300px")
        .style("height","60px")
        .style("padding","2px")
        .style("background","lightsteelblue")
        .style("border-radius","8px")
        .style("border","0px")
        .style("pointer-events","centnoneer")		
        .style("color","black")
        .style("visibility", "hidden")
        .text("Tip: if values are closer to N-D distances, then the visualization is too compressed.");*/

      var title = svg.append("text") // Title = Input Distance
                      .attr("class", "mono")
                      .attr("x", -(gridSize * 8))
                      .attr("y", -28)
                      .style("font-size", "calc(0.35em + 0.75vmin)")
                      .attr("transform", "rotate(-90)")
                      .attr("title","Tip: if values are closer to N-D distances, then the visualization is too compressed.")
                      //.on("mouseover", function(){return tooltip2.style("visibility", "visible");})
                      //.on("mousemove", function(){return tooltip2.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                      //.on("mouseout", function(){return tooltip2.style("visibility", "hidden");})
                      .text("N-D distances");

      /*var tooltip1 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "12")	
        .style("text-align","center")
        .style("width","300px")
        .style("height","60px")
        .style("padding","2px")
        .style("background","lightsteelblue")
        .style("border-radius","8px")
        .style("border","0px")
        .style("pointer-events","centnoneer")		
        .style("color","black")
        .style("visibility", "hidden")
        .text("Tip: if values are closer to 2-D distances, then the visualization is too spread out.");*/

      var title = svg.append("text") // Title = Output Distance
        .attr("class", "mono")
        .attr("x", gridSize * 2.5)
        .attr("y", -20)
        .attr("title","Tip: if values are closer to 2-D distances, then the visualization is too spread out.")
        //.on("mouseover", function(){return tooltip1.style("visibility", "visible");})
        //.on("mousemove", function(){return tooltip1.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        //.on("mouseout", function(){return tooltip1.style("visibility", "hidden");})
        .style("font-size", "calc(0.35em + 0.75vmin)")
        .text("2-D distances");

      var dim2Labels = svg.selectAll(".dim2Label") // Label
          .data(dim_2)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize * 3.2; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .style("font-size", "calc(0.35em + 0.5vmin)")
            .attr("transform", "translate(" + gridSize / 4 + ", -6)")
            .attr("class","mono");

      var heatMap = svg.selectAll(".dim2") // Combine the two dimensions and plot the shepard heatmap
          .data(data)
          .enter().append("rect")
          .attr("x", function(d) { return (d.dim2 - 1) * gridSize; })
          .attr("y", function(d) { return (d.dim1 - 1) * gridSize; })
          .attr("rx", 0.4)
          .attr("ry", 0.4)
          .attr("class", "dim2 bordered")
          .attr("width", gridSize-2)
          .attr("height", gridSize-2)
          .style("fill", colors[0])
          .attr("class", "square")
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

      heatMap.transition()
          .style("fill", function(d) { return colorScale(d.value); });

      heatMap.append("title").text(function(d) { return d.value; });

      var heatleg = d3.select("#legend3"); // Legend3 = the legend of the shepard heatmap

      heatleg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(0,14)");

      var legend = d3.legendColor() // Legend color and title!
        .labelFormat(d3.format(",.0f"))
        .shapeWidth(14)
        .shapeHeight(14)
        .cells(9)
        .title("Num. of points")
        .scale(colorScale);

      heatleg.select(".legendLinear")
        .call(legend);
    });
  } else {

    // Set the margin of the shepard heatmap
    var margin = { top: 35, right: 15, bottom: 15, left: 35 },
    dim2 = Math.min(parseInt(d3.select("#sheparheat").style("width")), parseInt(d3.select("#sheparheat").style("height")))
    width = dim2- margin.left - margin.right,
    height = dim2 - margin.top - margin.bottom,
    buckets = 10, // Set the number of buckets.
    gridSize = width / buckets,
    dim_1 = ["0.0", "0.2", "0.4", "0.6", "0.8", "1.0"], // Set the dimensions for the output and input distances.
    dim_2 = ["0.0", "0.4", "0.6", "1.0"] //I.e., the axes.

    // Create the svg for the shepard heatmap
    var svg = d3.select("#sheparheat")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    if (flagAnalysis){
    } else{
      dists2d = [];
      dist_list2d = []; // Distances lists empty
      dist_list = [];
      // Calculate the 2D distances.
      dists2d = computeDistances(points2d, 'euclideanDist', 'noTrans');
      InitialFormDists2D.push(dists2d);
    }

      var dist_list_all = [];

      for (var j=0; j<dists2d.length; j++){ // Fill them with the distances 2D and high-dimensional, respectively.
        dists2d[j] = dists2d[j].slice(0,j);
        dists[j] = dists[j].slice(0,j);
      }

      for (var i=0; i<dists2d.length; i++){
        for (var j=0; j<dists2d.length; j++){

            dist_list_all.push({'ND':dists[i][j], 'TwoD':dists2d[i][j]});
          }
        }
      
      // append the svg object to the body of the page
      var svg = d3.select("#sheparheat")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

      var tip = d3.tip() // This is for the tooltip that is being visible when you hover over a square on the shepard heatmap.
      .attr('class', 'd3-tip')
      .style("visibility","visible")
      .offset([-10, 36.5])
      .html(function(d) {
        return "Value:  <span style='color:red'>" + Math.round(d.value);
      });

      tip(svg.append("g"));

      /*var tooltip2 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "12")	
        .style("text-align","center")
        .style("width","300px")
        .style("height","60px")
        .style("padding","2px")
        .style("background","lightsteelblue")
        .style("border-radius","8px")
        .style("border","0px")
        .style("pointer-events","centnoneer")		
        .style("color","black")
        .style("visibility", "hidden")
        .text("Tip: if values are closer to N-D distances, then the visualization is too compressed.");

      var tooltip1 = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "12")	
        .style("text-align","center")
        .style("width","300px")
        .style("height","60px")
        .style("padding","2px")
        .style("background","lightsteelblue")
        .style("border-radius","8px")
        .style("border","0px")
        .style("pointer-events","centnoneer")		
        .style("color","black")
        .style("visibility", "hidden")
        .text("Tip: if values are closer to 2-D distances, then the visualization is too spread out.");*/

      svg.append("rect")
      .attr("x",0)
      .attr("y",0)
      .attr("height", height)
      .attr("width", height)
      .style("fill", "#f7fbff")

      // Add X axis
      var x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width])
      svg.append("g")
      .call(d3.axisTop(x).tickSize(-height*1.3).ticks(10))
      .select(".domain").remove()

      // Add Y axis
      var y = d3.scaleLinear()
      .domain([0, 1])
      .range([0, height])
      .nice()
      svg.append("g")
      .call(d3.axisLeft(y).tickSize(-width*1.3).ticks())
      .select(".domain").remove()

      // Customization
      svg.selectAll(".tick line").attr("stroke", "white").attr("stroke-width","2.5px")

      var title = svg.append("text") // Title = Input Distance
      .attr("class", "mono")
      .attr("x", -(gridSize * 8))
      .attr("y", -28)
      .style("font-size", "calc(0.35em + 0.8vmin)")
      .attr("transform", "rotate(-90)")
      .attr("title","Tip: if values are closer to N-D distances, then the visualization is too compressed.")
      //.on("mouseover", function(){return tooltip2.style("visibility", "visible");})
      //.on("mousemove", function(){return tooltip2.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
      //.on("mouseout", function(){return tooltip2.style("visibility", "hidden");})
      .text("N-D distances");


      // Add X axis label:
      svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2 + margin.left)
        .attr("y", height + margin.top + 20)
        .text("2-D distances");

        var title = svg.append("text") // Title = Output Distance
        .attr("class", "mono")
        .attr("x", gridSize * 2.5)
        .attr("y", -20)
        .style("font-size", "calc(0.35em + 0.75vmin)")
        .attr("title","Tip: if values are closer to 2-D distances, then the visualization is too spread out.")
        //.on("mouseover", function(){return tooltip1.style("visibility", "visible");})
        //.on("mousemove", function(){return tooltip1.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        //.on("mouseout", function(){return tooltip1.style("visibility", "hidden");})
        .text("2-D distances");

          //var colors = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"];
     // Add dots
     // opacity for Shepard Diagram
     svg.append('g')
     .selectAll("dot")
     .data(dist_list_all)
     .enter()
     .append("circle")
       .attr("cx", function (d) { if (d.TwoD === 'undefined') {} else {return x(d.TwoD);} } )
       .attr("cy", function (d) { if (d.ND === 'undefined') {} else {return y(d.ND); } } )
       .attr("r", 1.5)
       .style("opacity", 0.05)
       .style("fill", "#323232");
  }
}
// Here is the end of ShepardHeatmap

// perform single t-SNE iteration
function step() {
      step_counter++;
      if(step_counter <= max_counter) {
          //cost = tsne.step();
          //cost_each = cost[1];
          //for(var i = 0; i < final_dataset.length; i++) final_dataset[i].cost = cost_each[i];
          if (sliderTrigger) {
            if (sliderInsideTrigger) {
              if (cost_overall[activeProjectionNumberProv][step_counter-1].toFixed(3) < 0) {
                $("#cost").html("(Ov. Cost: 0.000)");
                ArrayWithCosts.push(0);
                Iterations.push(step_counter);
              } else {
                $("#cost").html("(Ov. Cost: " + cost_overall[activeProjectionNumberProv][step_counter-1].toFixed(3) + ")");
                ArrayWithCosts.push(cost_overall[activeProjectionNumberProv][step_counter-1].toFixed(3));
                Iterations.push(step_counter);
              }

            } else {
              if (cost_overall[activeProjectionNumber][step_counter-1].toFixed(3) < 0) {
                $("#cost").html("(Ov. Cost: 0.000)");
                ArrayWithCosts.push(0);
                Iterations.push(step_counter);
              } else {
                $("#cost").html("(Ov. Cost: " + cost_overall[activeProjectionNumber][step_counter-1].toFixed(3) + ")");
                ArrayWithCosts.push(cost_overall[activeProjectionNumber][step_counter-1].toFixed(3));
                Iterations.push(step_counter);
              }
            }
          } else {
            if (cost_overall[activeProjectionNumber][step_counter-1].toFixed(3) < 0) {
              $("#cost").html("(Ov. Cost: 0.000)");
              ArrayWithCosts.push(0);
              Iterations.push(step_counter);
            } else {
              $("#cost").html("(Ov. Cost: " + cost_overall[activeProjectionNumber][step_counter-1].toFixed(3) + ")");
              ArrayWithCosts.push(cost_overall[activeProjectionNumber][step_counter-1].toFixed(3));
              Iterations.push(step_counter);
            }
        }
        }
        else {
            clearInterval(runner);
        }
        if (step_counter == max_counter){
          ArrayWithCostsList.push(ArrayWithCosts);
          IterationsList.push(Iterations);
          updateEmbedding(AnalysisResults);
        }
}

function resize(canvas) { // This is being used in the WebGL t-SNE for the overview canvas

  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth || canvas.height != displayHeight) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

}

function OverviewtSNE(points){ // The overview t-SNE function

  if (format[0] == "diabetes"){
  for(var i = 0; i < dataFeatures.length; i++) {
    if (dataFeatures[i][Category] != "" || dataFeatures[i][Category] != "undefined"){ // If a categorization label exist then add it into all_labels variable.
        if (dataFeatures[i][Category] == 1){
          all_labels[i] = "Positive";
        } else{
          all_labels[i] = "Negative";
        }
      }
    }
  }
  $("#datasetDetails").html("(Num. of Dim.: " + (Object.keys(dataFeatures[0]).length - valCategExists) + ", Num. of Ins.: " + final_dataset.length + ")"); // Print on the screen the number of features and instances of the data set, which is being analyzed.
  if (Category == undefined){
    $("#CategoryName").html("Target label: N/A"); // Print on the screen the classification label.
  } else {
    $("#CategoryName").html("Target label: "+Category.replace('*','')); // Print on the screen the classification label.
  }

//Make an SVG Container
d3.selectAll("#overviewRect > *").remove(); 
if (format[0] == "diabetes"){
  ColorsCategorical = ['#00bbbb','#b15928','#ff7f00','#e31a1c','#1f78b4']; // Colors for the labels/categories if there are some!
} else{
  ColorsCategorical = ['#00bbbb','#b15928','#ff7f00','#e31a1c','#1f78b4']; // Colors for the labels/categories if there are some!
}


  if (all_labels[0] == undefined){
    var colorScale = d3.scaleOrdinal().domain(["No Category"]).range(["#00000"]); // If no category then grascale.
    $("#CategoryName").html('');
  } else{
    var colorScale = d3.scaleOrdinal().domain(all_labels).range(ColorsCategorical); // We use the color scale here!
  }

  d3.select("#legend2").select("svg").remove(); // Create the legend2 which is for the overview panel.
  var svg = d3.select("#legend2").append("svg");

  svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(8,5)");

  var legendOrdinal = d3.legendColor()
    .shape("path", d3.legendSize(100))
    .shapePadding(15)
    .scale(colorScale);

  svg.select(".legendOrdinal")
    .call(legendOrdinal);

// CREATE THE SVG
var svg = d3.select('#overviewRect').append('svg')
  .attr('width', dim)
  .attr('height', dimh)
  .append('g');

// CREATE THE GROUP
var theGroup = svg.append('g')
  .attr('class', 'the-group');

// CREATE ITS BOUNDING RECT
var theRect = theGroup.append('rect')
  .attr('class', 'bounding-rect');

  function updateRect() {
    // SELECT ALL CHILD NODES EXCEPT THE BOUNDING RECT
    var AllSelectedChildNodes = [];
    var allChildNodes = svg.selectAll(':not(.bounding-rect)')._groups[0]
    for (var i = 0; i<VisiblePoints.length; i++){
      for (var j = 1; j<allChildNodes.length; j++){
        if (VisiblePoints[i] == allChildNodes[j].id){
          AllSelectedChildNodes.push(allChildNodes[j])
        }
      }
    }
    // `x` AND `y` ARE SIMPLY THE MIN VALUES OF ALL CHILD BBOXES
    var x = d3.min(AllSelectedChildNodes, function(d) {return d.getBBox().x;}),
        y = d3.min(AllSelectedChildNodes, function(d) {return d.getBBox().y;}),
        
        // WIDTH AND HEIGHT REQUIRE A BIT OF CALCULATION
        width = d3.max(AllSelectedChildNodes, function(d) {
          var bb = d.getBBox();
          return (bb.x + bb.width) - x;
        }),
        
        height = d3.max(AllSelectedChildNodes, function(d) {
          var bb = d.getBBox();
          return (bb.y + bb.height) - y;
        });
     
    // UPDATE THE ATTRS FOR THE RECT
    theRect.transition().duration(1000)
       .attr('x', x)
       .attr('y', y)
       .attr('width', width)
       .attr('height', height);
  }

    for (var i = 0; i < points.length; i++) {
    svg.selectAll("circle")
    .data(points)
    .enter().append("circle")
    .attr("fill",function(d){
      if (!d.selected){
        return "#D3D3D3";
      } else{
        if (all_labels[0] != undefined){
          if (format[0] == "diabetes"){
            if (d[Category] == 1){
              return colorScale("Positive");
            } else{
              return colorScale("Negative");
            }
          } else{
            return colorScale(d[Category]); // Normal color for the points that are selected
          }
        } else {
          return "#00000";
        }
      }
    })
    .attr("id", function(d){return d.id;})
    .attr("r", 2)
    .attr("cx", function(d){return ((d.x/dimensions)*dim);})
    .attr("cy", function(d){return ((d.y/dimensionsY)*dimh);});
    }
    updateRect();
}

function redraw(repoints){ // On redraw manipulate the points of the main and overview visualizations.
  OverviewtSNE(repoints);
  BetatSNE(repoints); // Redraw the points!
}

function CostHistogram(points){

  var frequency = [];
  var frequency2 = [];

  points = points.sort(function(a, b) { // Sort them according to importance (darker color!)
    return a.id - b.id;
  })

  var max2 = (d3.max(points,function(d){ return d.beta; }));
  var min2 = (d3.min(points,function(d){ return d.beta; }));

  for (var i=0; i<points.length; i++){
    frequency2.push((points[i].beta-min2)/(max2-min2));
  }
    var trace1 = {
      x: frequency2,
      name: 'Density',
      autobinx: false, 
      marker: {
        color: "rgb(0,128,0)",
        line: {
          color:  "rgb(0, 0, 0)", 
          width: 1
        }
      },  
      opacity: 0.5, 
      type: "histogram", 
      xbins: {
        end: 1.01, 
        size: 0.01,
        start: 0
      }
    };

    var max = (d3.max(points,function(d){ return d.cost; }));
    var min = (d3.min(points,function(d){ return d.cost; }));
    for (var i=0; i<points.length; i++){
      if ((points[i].cost-min)/(max-min) < 0) {
        frequency.push(0)
      } else {
        frequency.push((points[i].cost-min)/(max-min));
      }
    }
    var trace2 = {
      x: frequency,
      name: 'Remaining Cost',
      autobinx: false, 
      histnorm: "count", 
      marker: {
        color: "rgb(128,0,0)", 
         line: {
          color:  "rgb(0, 0, 0)", 
          width: 1
        }
      },  
      opacity: 0.5, 
      type: "histogram", 
      xbins: {
        end: 1.01, 
        size: 0.01,
        start: 0
      }
    };

  var data = [trace1, trace2];
  var layout = {
    barmode: "overlay",
    bargroupgap: points.length,
    autosize: false,
    width: overallWidth/4.4,
    height: overallHeight/6,
    margin: {
      l: 50,
      r: 20,
      b: 40,
      t: 10,
      pad: 4
    },
    xaxis:{range: [0,1.01],title: 'Bins (normalized)',
              titlefont: {
                size: 12,
                color: 'black'
              }},
    yaxis:{title: 'Num. of points (log)',
          type: "log",
            titlefont: {
              size: 12,
              color: 'black'
            }}
  };

  Plotly.newPlot('costHist', data, layout, {displayModeBar:false}, {staticPlot: true});
}

function handleLassoEnd(lassoPolygon) { // This is for the lasso interaction

  var countLassoFalse = 0;
  KNNEnabled = true;
      for (var i = 0 ; i < points.length ; i ++) {
        x = points[i].x;
        y = points[i].y;
        if (d3.polygonContains(lassoPolygon, [x, y])){
            points[i].selected = true;
        } else{
          countLassoFalse = countLassoFalse + 1;
          points[i].selected = false;
        }
    }
    if (countLassoFalse == points.length){
      for (var i = 0 ; i < points.length ; i ++) {
        points[i].selected = true;
      }
    }
    if (points.length - countLassoFalse <= 10 && points.length - countLassoFalse != 0){
      for (var i = 0 ; i < points.length ; i ++) {
        if (points[i].selected == true){
          points[i].pcp = true;
        }
      }
    } else{
      for (var i = 0 ; i < points.length ; i ++) {
        points[i].pcp = false;
      }
    }
    redraw(points);
 
}
function emptyPCP(){
  wrapData=[];
  IDS=[];
          ////////////////////////////////////////////////////////////// 
        //////////////////// Draw the Chart ////////////////////////// 
        ////////////////////////////////////////////////////////////// 
        var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a']; // Colorscale for the pcp
        var colorScl = d3v3.scale.ordinal()
          .domain(IDS)
          .range(colors);

      var color = function(d) { return colors(d.group); };

      var parcoords = d3v3.parcoords()("#PCP")
        .data(wrapData)
        .composite("darken")
        .margin({ top: 20, left: 0, bottom: 10, right: 0 })
        .mode("queue")
        .color(function(d, i) { return colorScl(IDS[i]); })
        .render()
        .brushMode("1D-axes")  // enable brushing
        .reorderable();
    
      parcoords.svg.selectAll("text")
        .style("font", "14px");
}

function handleLassoStart(lassoPolygon) { // Empty we do not need to reset anything.  
   /*emptyPCP();
    KNNEnabled = false;
    for (var i = 0 ; i < points.length ; i ++) {
      points[i].selected = true;
      points[i].pcp = false;
    }

  redraw(points);*/
}

function click(){ // This is the click of the Schema Investigation scenario
  
  svgClick = d3.select('#modtSNEcanvas_svg_Schema'); // Selecte the svg element

  function drawCircle(x, y, size) { 
    svgClick.append("circle")
      .attr('class', 'click-circle') // Draw a small black circle
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", size); 
    Arrayx.push(x); // Get coordinates
    Arrayy.push(y); 
  }
  svgClick.on('click', function() {

    if (prevRightClick == false){ // Check the right click if it should be prevented or not.
      var coords = d3.mouse(this);
      drawCircle(coords[0], coords[1], 3);
    }
    for (var k = 0; k < Arrayx.length ; k++){
      Arrayxy[k] = [Arrayx[k], Arrayy[k]]; // Combine the coordinates into one array -> Arrayxy.
    }

    for (var k = 0; k < Arrayxy.length - 1 ; k++){ // Draw the line which connects two circles
      d3.select('#modtSNEcanvas_svg_Schema').append('line')
      .attr("x1", Arrayxy[k][0])
      .attr("y1", Arrayxy[k][1])
      .attr("x2", Arrayxy[k+1][0])
      .attr("y2", Arrayxy[k+1][1])
      .style("stroke","black")
      .style("stroke-width",1);
    } 

  });

  svgClick.on("contextmenu", function (d) {
    if (prevRightClick == true){ // Do not do anything because the right click should be prevented
    } else {
      var line = d3.line().curve(d3.curveCardinal);

      for (var k = 0; k < Arrayxy.length - 1; k++){ // Define a path and check the schema.
        path = svgClick.append("path")
        .datum(Arrayxy.slice(k, k+2))
        .attr("class", "SchemaCheck")
        .attr("d", line);
      }
      // Prevent the default mouse action. Allow right click to be used for the confirmation of our schema.
      d3.event.preventDefault();

      flagForSchema = true; // Schema is activated.
      var option = document.getElementById("param-correlationMeasur").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
      option = parseInt(option);
      CalculateCorrel(flagForSchema, option); // Calculate the correlations
    }
  });

}

function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function CalculateCorrel(flagForSchema, option){ // Calculate the correlation is a function which has all the computations for the schema ordering (investigation).
 
  if (flagForSchema == false){
    alert("Please, draw a schema first!"); // If no Schema is drawn then ask the user!
  } else{
    if (option == 1) {
      var correlLimit = document.getElementById("param-corr-value").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
      correlLimit = parseInt(correlLimit);
  
      allTransformPoints = [];
      for (var loop = 0; loop < points.length ; loop++){
          allTransformPoints[loop] = [points[loop].x, points[loop].y, points[loop].id, points[loop].beta, points[loop].cost, points[loop].selected];
      }
  
      var line = svgClick.append("line");
  
      paths = svgClick.selectAll("path").filter(".SchemaCheck");
      XYDistId = [];
      if (paths.nodes().length == 0){ // We need more than 1 points
        alert("Please, provide one more point in order to create a line (i.e., path)!")
      } else{
        for (var m = 0; m < paths.nodes().length; m++) {
          for (var j = 0; j < allTransformPoints.length; j++){
            p = closestPoint(paths.nodes()[m], allTransformPoints[j]); // Closest of each point to the paths that we have.
            XYDistId.push(p); // Take the XY coordinates, Distance, and ID
          }
        }

        for (var j = 0; j < allTransformPoints.length; j++){
          for (var m = 0; m < paths.nodes().length; m++) { // Find the minimum path distance for each point 
            if (m == 0){
              minimum = XYDistId[j].distance;
            }
            else if (minimum > XYDistId[(m * allTransformPoints.length) + j].distance) {
              minimum = XYDistId[(m * allTransformPoints.length) + j].distance;
            }
          }
  
          for (var l = 0; l < paths.nodes().length ; l++) {
            if (XYDistId[(l * allTransformPoints.length) + j].distance == minimum){
              allTransformPoints[j].bucketID = l; // Bucket ID in which each point belongs to...
            }
          }
        }
  
      var arrays = [], size = allTransformPoints.length;
      while (XYDistId.length > 0) { // For each path I have all the necessary information (all the IDs of the points etc..)
          arrays.push(XYDistId.splice(0, size));
      }
    
      var arraysCleared = [];
  
      for (var j = 0; j < allTransformPoints.length; j++){ // Now we have the XY coordinates values of the points, the IDs of the points, the xy coordinates on the line, the number of the path that they belong two times.
        for (var m=0; m < arrays.length; m++) {
          if (allTransformPoints[j].bucketID == m){
            arraysCleared.push(arrays[m][j].concat(allTransformPoints[j].bucketID, Arrayxy[m], arrays[m][j].distance, arrays[m][j].id));
          }
        }
      }
      var compareThreshold = ((correlLimit/100)*arraysCleared.length)
      compareThreshold = parseInt(compareThreshold);
  
      arraysCleared = sortByKey(arraysCleared, 5);
      ArrayLimit = [];
      for (var i=0; i<arraysCleared.length; i++) {
        if (i <= compareThreshold) { // Now we add a limit to the distance that we search according to the thresholder which the user changes through a slider.
          ArrayLimit.push(arraysCleared[i]);
        }
      }
      var temparray = [];
      var count = new Array(paths.nodes().length).fill(0);
  
      for (var m=0; m < paths.nodes().length; m++) { // Sort the arrays from the smaller distance to the highest distance
        for (var i=0; i<ArrayLimit.length; i++) {
          if (ArrayLimit[i][2] == m){ // Match the bucket IDs
              count[m] = count[m] + 1;
            temparray.push(ArrayLimit[i]);
          }
        }
      }
      var arraysSplitted = [];
  
      for (var m=0; m < paths.nodes().length; m++) {
        arraysSplitted.push(temparray.splice(0, count[m])); // Separate the combined array according to the number of points in each path.
      }
  
      for (var m=0; m < paths.nodes().length; m++) { // Compare the distances and find the minimum values. Connect the paths afterwards.
        arraysSplitted[m] = arraysSplitted[m].sort(function(a, b){
                var dist = (a[0]-a[3]) * (a[0]-a[3]) + (a[1]-a[4]) * (a[1]-a[4]);
                var distAgain = (b[0]-b[3]) * (b[0]-b[3]) + (b[1]-b[4]) * (b[1]-b[4]);
                // Compare the 2 dates
                if(dist < distAgain) return -1;
                if(distAgain > dist) return 1;
                return 0;
        });
      }
  
      // This is how we gain the order.
      var arraysConnected = [];
  
      if (paths.nodes().length == 1) {
          arraysConnected = arraysSplitted[0];
      } else {
        for (var m=0; m < paths.nodes().length - 1; m++) {
          arraysConnected = arraysSplitted[m].concat(arraysSplitted[m+1]);
        }
      }
  
      var Order = [];
  
      for (var temp = 0; temp < arraysConnected.length; temp++) {
        Order.push(arraysConnected[temp][6]); // We have the order now for the entire path.
      }
  
      for (var i = 0; i < points.length; i++){
        points[i].selected = false;
        points[i].schemaInv = false;
        for (var j = 0; j < ArrayLimit.length; j++){
          if (ArrayLimit[j][ArrayLimit[0].length-1] == points[i].id){
            points[i].selected = true;
            points[i].schemaInv = true;
          }
        }
      }
      redraw(points); // Redraw the points and leave only the selected points with a color (else gray color)
  
      ArrayContainsDataFeaturesCleared = []; // Recalculate that because we want dimensions + 1 (the id) elements in columns.
      for (let k = 0; k < dataFeatures.length; k++){
  
        object = [];
        for (let j = 0; j < Object.keys(dataFeatures[k]).length; j++){
          if(!isString(Object.values(dataFeatures[k])[j]) && Object.keys(dataFeatures[k])[j] != Category){ // Only numbers and not the classification labels. 
            object.push(Object.values(dataFeatures[k])[j]);
          } else{
            object.push(null);
          }
        }
        ArrayContainsDataFeaturesCleared.push(object.concat(k)); // The ArrayContainsDataFeaturesCleared contains only numbers without the categorization parameter even if it is a number.
  
      }
  
      ArrayContainsDataFeaturesCleared = mapOrder(ArrayContainsDataFeaturesCleared, Order, ArrayContainsDataFeaturesCleared[0].length-1); // Order the features according to the order.
      ArrayContainsDataFeaturesLimit = [];
      for (var i = 0; i < ArrayContainsDataFeaturesCleared.length; i++){
        for (var j = 0; j < arraysConnected.length; j++){
          if (ArrayContainsDataFeaturesCleared[i][ArrayContainsDataFeaturesCleared[0].length-1] == arraysConnected[j][6]){
            ArrayContainsDataFeaturesLimit.push(ArrayContainsDataFeaturesCleared[i]); // These are the selected points in an order from the higher id (the previous local id) to the lower. 
          } 
        }
      }
  
      if (ArrayContainsDataFeaturesLimit.length == 0){ // If no points were selected then send a message to the user! And set everything again to the initial state.
        d3.selectAll("#correlation > *").remove(); 
        d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
        d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove();
        flagForSchema = false; 
        Arrayx = [];
        Arrayy = [];
        XYDistId = [];
        Arrayxy = [];
        DistanceDrawing1D = [];
        allTransformPoints = [];
        pFinal = [];
        ArrayLimit = [];
        correlationResults = [];
        ArrayContainsDataFeaturesLimit = [];
        prevRightClick = false;
  
        for (var i=0; i < InitialStatePoints.length; i++){
          InitialStatePoints[i].selected = true;
          InitialStatePoints[i].pcp = false;
        }
        redraw(InitialStatePoints);
  
        alert("No points selected! Please, try to increase the correlation threshold.");
      } else {
        for (var loop = 0; loop < ArrayContainsDataFeaturesLimit.length; loop++) {
          ArrayContainsDataFeaturesLimit[loop].push(loop);
        }
    
        var SignStore = [];
        correlationResults = [];
        const arrayColumn = (arr, n) => arr.map(x => x[n]);
  
        for (var temp = 0; temp < ArrayContainsDataFeaturesLimit[0].length - 2; temp++) {
          if (ArrayContainsDataFeaturesLimit[0][temp] == null){ // Match the data features with every dimension, which is a number!
          } else {
            var tempData = new Array(
              arrayColumn(ArrayContainsDataFeaturesLimit, temp),
              arrayColumn(ArrayContainsDataFeaturesLimit, ArrayContainsDataFeaturesLimit[0].length - 1)
            );
            if (isNaN(pearsonCorrelation(tempData, 0, 1))) {
            } else{
              SignStore.push([temp, pearsonCorrelation(tempData, 0, 1)]); // Keep the sign
                //correlationResults.push([Object.keys(dataFeatures[0])[temp], Math.abs(pearsonCorrelation(tempData, 0, 1)),temp]); // Find the pearson correlations
                correlationResults.push([Object.keys(dataFeatures[0])[temp] + " (" + temp + ")", Math.pow(pearsonCorrelation(tempData, 0, 1),2),temp]); // Find the pearson correlations (MAYBE!)
            }
          }
        }
      function getMinMaxOf2DIndex (arr, idx) {
        return {
          min: Math.min.apply(null, arr.map(function (e) { return e[idx]})),
          max: Math.max.apply(null, arr.map(function (e) { return e[idx]}))
        }
      } 
  
      var maxminArea = [];
      for (var i=0; i<ArrayContainsDataFeaturesLimit[0].length; i++){
        maxminArea.push(getMinMaxOf2DIndex(ArrayContainsDataFeaturesLimit, i));
      }
  
      if (PreComputFlagCorrelation){
        maxminTotal = [];
        for (var i=0; i<ArrayContainsDataFeaturesCleared[0].length; i++){
          maxminTotal.push(getMinMaxOf2DIndex(ArrayContainsDataFeaturesCleared, i));
        }
        PreComputFlagCorrelation = false;
      }
      correlationResultsFinal = [];
      for (var i=0; i<correlationResults.length; i++){
        if (parseFloat(document.getElementById("param-corlim-value").value) < Math.abs((maxminArea[correlationResults[i][2]].max - maxminArea[correlationResults[i][2]].min) / (maxminTotal[correlationResults[i][2]].max - maxminTotal[correlationResults[i][2]].min) * correlationResults[i][1])){
          correlationResultsFinal.push([correlationResults[i][0],Math.abs((maxminArea[correlationResults[i][2]].max - maxminArea[correlationResults[i][2]].min) / (maxminTotal[correlationResults[i][2]].max - maxminTotal[correlationResults[i][2]].min) * correlationResults[i][1]),correlationResults[i][2]]);
        }
      }
  
      correlationResultsFinal = correlationResultsFinal.sort( // Sort the correlations from the biggest to the lowest value (absolute values)
      function(a,b) {
        if (a[1] == b[1])
          return a[0] < b[0] ? -1 : 1;
          return a[1] < b[1] ? 1 : -1;
        }
      );
  
      correlationResults = correlationResults.sort( // Sort the correlations from the biggest to the lowest value (absolute values)
      function(a,b) {
        if (a[1] == b[1])
          return a[0] < b[0] ? -1 : 1;
          return a[1] < b[1] ? 1 : -1;
        }
      );
  
    for (var j = 0; j < correlationResultsFinal.length; j++) {
      for (var i = 0; i < SignStore.length; i++) {
        if (SignStore[i][0] == correlationResults[j][2]){
          if (SignStore[i][1] < 0)
          {
            correlationResultsFinal[j][1] = parseFloat((correlationResultsFinal[j][1])).toFixed(2) * (-1); // Give the negative sign if needed and multiply by 100
          }
          else 
          {
            correlationResultsFinal[j][1] = parseFloat((correlationResultsFinal[j][1])).toFixed(2); // Give a positive sign and multiply by 100
          }
        }
      }
    }
  }
      drawBarChart(); // Draw the horizontal barchart with the correlations.
      
      }
    } else {
      // This is for KNN!
      var kvalue = document.getElementById("param-corr-value2").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
      kvalue = parseInt(kvalue);

      allTransformPoints = [];
      for (var loop = 0; loop < points.length ; loop++){
          allTransformPoints[loop] = [points[loop].x, points[loop].y, points[loop].id, points[loop].beta, points[loop].cost, points[loop].selected];
      }
  
      var line = svgClick.append("line");
  
      paths = svgClick.selectAll("path").filter(".SchemaCheck");
      XYDistId = [];
      if (paths.nodes().length == 0){ // We need more than 1 points
        alert("Please, provide one more point in order to create a line (i.e., path)!")
      } else{
        for (var m = 0; m < paths.nodes().length; m++) {
          for (var j = 0; j < allTransformPoints.length; j++){
            p = closestPoint(paths.nodes()[m], allTransformPoints[j]); // Closest of each point to the paths that we have.
            XYDistId.push(p); // Take the XY coordinates, Distance, and ID
          }
        }

        for (var j = 0; j < allTransformPoints.length; j++){
          for (var m = 0; m < paths.nodes().length; m++) { // Find the minimum path distance for each point 
            if (m == 0){
              minimum = XYDistId[j].distance;
            }
            else if (minimum > XYDistId[(m * allTransformPoints.length) + j].distance) {
              minimum = XYDistId[(m * allTransformPoints.length) + j].distance;
            }
          }
  
          for (var l = 0; l < paths.nodes().length ; l++) {
            if (XYDistId[(l * allTransformPoints.length) + j].distance == minimum){
              allTransformPoints[j].bucketID = l; // Bucket ID in which each point belongs to...
            }
          }
        }
  
      var arrays = [], size = allTransformPoints.length;
      while (XYDistId.length > 0) { // For each path I have all the necessary information (all the IDs of the points etc..)
          arrays.push(XYDistId.splice(0, size));
      }
    
      var arraysCleared = [];
  
      for (var j = 0; j < allTransformPoints.length; j++){ // Now we have the XY coordinates values of the points, the IDs of the points, the xy coordinates on the line, the number of the path that they belong two times.
        for (var m=0; m < arrays.length; m++) {
          if (allTransformPoints[j].bucketID == m){
            arraysCleared.push(arrays[m][j].concat(allTransformPoints[j].bucketID, Arrayxy[m], arrays[m][j].distance, arrays[m][j].id));
          }
        }
      }
  
      arraysCleared = sortByKey(arraysCleared, 5);
      ArrayLimit = [];
      for (var i=0; i<arraysCleared.length; i++) {
        if (i <= kvalue) { // Now we add a limit to the distance that we search according to the thresholder which the user changes through a slider.
          ArrayLimit.push(arraysCleared[i]);
        }
      }
      var temparray = [];
      var count = new Array(paths.nodes().length).fill(0);
  
      for (var m=0; m < paths.nodes().length; m++) { // Sort the arrays from the smaller distance to the highest distance
        for (var i=0; i<ArrayLimit.length; i++) {
          if (ArrayLimit[i][2] == m){ // Match the bucket IDs
              count[m] = count[m] + 1;
            temparray.push(ArrayLimit[i]);
          }
        }
      }
      var arraysSplitted = [];
  
      for (var m=0; m < paths.nodes().length; m++) {
        arraysSplitted.push(temparray.splice(0, count[m])); // Separate the combined array according to the number of points in each path.
      }
  
      for (var m=0; m < paths.nodes().length; m++) { // Compare the distances and find the minimum values. Connect the paths afterwards.
        arraysSplitted[m] = arraysSplitted[m].sort(function(a, b){
                var dist = (a[0]-a[3]) * (a[0]-a[3]) + (a[1]-a[4]) * (a[1]-a[4]);
                var distAgain = (b[0]-b[3]) * (b[0]-b[3]) + (b[1]-b[4]) * (b[1]-b[4]);
                // Compare the 2 dates
                if(dist < distAgain) return -1;
                if(distAgain > dist) return 1;
                return 0;
        });
      }
  
      // This is how we gain the order.
      var arraysConnected = [];
  
      if (paths.nodes().length == 1) {
          arraysConnected = arraysSplitted[0];
      } else {
        for (var m=0; m < paths.nodes().length - 1; m++) {
          arraysConnected = arraysSplitted[m].concat(arraysSplitted[m+1]);
        }
      }
  
      var Order = [];
  
      for (var temp = 0; temp < arraysConnected.length; temp++) {
        Order.push(arraysConnected[temp][6]); // We have the order now for the entire path.
      }
  
      for (var i = 0; i < points.length; i++){
        points[i].selected = false;
        points[i].schemaInv = false;
        for (var j = 0; j < ArrayLimit.length; j++){
          if (ArrayLimit[j][ArrayLimit[0].length-1] == points[i].id){
            points[i].selected = true;
            points[i].schemaInv = true;
          }
        }
      }
      redraw(points); // Redraw the points and leave only the selected points with a color (else gray color)
  
      ArrayContainsDataFeaturesCleared = []; // Recalculate that because we want dimensions + 1 (the id) elements in columns.
      for (let k = 0; k < dataFeatures.length; k++){
  
        object = [];
        for (let j = 0; j < Object.keys(dataFeatures[k]).length; j++){
          if(!isString(Object.values(dataFeatures[k])[j]) && Object.keys(dataFeatures[k])[j] != Category){ // Only numbers and not the classification labels. 
            object.push(Object.values(dataFeatures[k])[j]);
          } else{
            object.push(null);
          }
        }
        ArrayContainsDataFeaturesCleared.push(object.concat(k)); // The ArrayContainsDataFeaturesCleared contains only numbers without the categorization parameter even if it is a number.
  
      }
  
      ArrayContainsDataFeaturesCleared = mapOrder(ArrayContainsDataFeaturesCleared, Order, ArrayContainsDataFeaturesCleared[0].length-1); // Order the features according to the order.
      ArrayContainsDataFeaturesLimit = [];
      for (var i = 0; i < ArrayContainsDataFeaturesCleared.length; i++){
        for (var j = 0; j < arraysConnected.length; j++){
          if (ArrayContainsDataFeaturesCleared[i][ArrayContainsDataFeaturesCleared[0].length-1] == arraysConnected[j][6]){
            ArrayContainsDataFeaturesLimit.push(ArrayContainsDataFeaturesCleared[i]); // These are the selected points in an order from the higher id (the previous local id) to the lower. 
          } 
        }
      }
  
      if (ArrayContainsDataFeaturesLimit.length == 0){ // If no points were selected then send a message to the user! And set everything again to the initial state.
        d3.selectAll("#correlation > *").remove(); 
        d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
        d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove();
        flagForSchema = false; 
        Arrayx = [];
        Arrayy = [];
        XYDistId = [];
        Arrayxy = [];
        DistanceDrawing1D = [];
        allTransformPoints = [];
        pFinal = [];
        ArrayLimit = [];
        correlationResults = [];
        ArrayContainsDataFeaturesLimit = [];
        prevRightClick = false;
  
        for (var i=0; i < InitialStatePoints.length; i++){
          InitialStatePoints[i].selected = true;
          InitialStatePoints[i].pcp = false;
        }
        redraw(InitialStatePoints);
  
        alert("No points selected! Please, try to increase the correlation threshold.");
      } else {
        for (var loop = 0; loop < ArrayContainsDataFeaturesLimit.length; loop++) {
          ArrayContainsDataFeaturesLimit[loop].push(loop);
        }
    
        var SignStore = [];
        correlationResults = [];
        const arrayColumn = (arr, n) => arr.map(x => x[n]);
  
        for (var temp = 0; temp < ArrayContainsDataFeaturesLimit[0].length - 2; temp++) {
          if (ArrayContainsDataFeaturesLimit[0][temp] == null){ // Match the data features with every dimension, which is a number!
          } else {
            var tempData = new Array(
              arrayColumn(ArrayContainsDataFeaturesLimit, temp),
              arrayColumn(ArrayContainsDataFeaturesLimit, ArrayContainsDataFeaturesLimit[0].length - 1)
            );
            if (isNaN(pearsonCorrelation(tempData, 0, 1))) {
            } else{
              SignStore.push([temp, pearsonCorrelation(tempData, 0, 1)]); // Keep the sign
                //correlationResults.push([Object.keys(dataFeatures[0])[temp], Math.abs(pearsonCorrelation(tempData, 0, 1)),temp]); // Find the pearson correlations
                correlationResults.push([Object.keys(dataFeatures[0])[temp] + " (" + temp + ")", Math.pow(pearsonCorrelation(tempData, 0, 1),2),temp]); // Find the pearson correlations (MAYBE!)
            }
          }
        }
      function getMinMaxOf2DIndex (arr, idx) {
        return {
          min: Math.min.apply(null, arr.map(function (e) { return e[idx]})),
          max: Math.max.apply(null, arr.map(function (e) { return e[idx]}))
        }
      } 
  
      var maxminArea = [];
      for (var i=0; i<ArrayContainsDataFeaturesLimit[0].length; i++){
        maxminArea.push(getMinMaxOf2DIndex(ArrayContainsDataFeaturesLimit, i));
      }
  
      if (PreComputFlagCorrelation){
        maxminTotal = [];
        for (var i=0; i<ArrayContainsDataFeaturesCleared[0].length; i++){
          maxminTotal.push(getMinMaxOf2DIndex(ArrayContainsDataFeaturesCleared, i));
        }
        PreComputFlagCorrelation = false;
      }
      correlationResultsFinal = [];
      for (var i=0; i<correlationResults.length; i++){
        if (parseFloat(document.getElementById("param-corlim-value").value) < Math.abs((maxminArea[correlationResults[i][2]].max - maxminArea[correlationResults[i][2]].min) / (maxminTotal[correlationResults[i][2]].max - maxminTotal[correlationResults[i][2]].min) * correlationResults[i][1])){
          correlationResultsFinal.push([correlationResults[i][0],Math.abs((maxminArea[correlationResults[i][2]].max - maxminArea[correlationResults[i][2]].min) / (maxminTotal[correlationResults[i][2]].max - maxminTotal[correlationResults[i][2]].min) * correlationResults[i][1]),correlationResults[i][2]]);
        }
      }
  
      correlationResultsFinal = correlationResultsFinal.sort( // Sort the correlations from the biggest to the lowest value (absolute values)
      function(a,b) {
        if (a[1] == b[1])
          return a[0] < b[0] ? -1 : 1;
          return a[1] < b[1] ? 1 : -1;
        }
      );
  
      correlationResults = correlationResults.sort( // Sort the correlations from the biggest to the lowest value (absolute values)
      function(a,b) {
        if (a[1] == b[1])
          return a[0] < b[0] ? -1 : 1;
          return a[1] < b[1] ? 1 : -1;
        }
      );
  
    for (var j = 0; j < correlationResultsFinal.length; j++) {
      for (var i = 0; i < SignStore.length; i++) {
        if (SignStore[i][0] == correlationResults[j][2]){
          if (SignStore[i][1] < 0)
          {
            correlationResultsFinal[j][1] = parseFloat((correlationResultsFinal[j][1])).toFixed(2) * (-1); // Give the negative sign if needed and multiply by 100
          }
          else 
          {
            correlationResultsFinal[j][1] = parseFloat((correlationResultsFinal[j][1])).toFixed(2); // Give a positive sign and multiply by 100
          }
        }
      }
    }
  }
      drawBarChart(); // Draw the horizontal barchart with the correlations.
      
      }
    }
  }
}

function drawBarChart(){ // Draw the horizontal barchart with the correlations.
  // Remove any previous barchart.
  d3.selectAll("#correlation > *").remove(); 

  /////////////////////////////////////////////////////////////
  ///////////////// Set-up SVG and wrappers ///////////////////
  /////////////////////////////////////////////////////////////


  var mainGroup = svg.append("g")
  .attr("class","mainGroupWrapper")
  .attr("transform","translate(" + main_margin.left + "," + main_margin.top + ")")
  .append("g") //another one for the clip path - due to not wanting to clip the labels
  .attr("clip-path", "url(#clip)")
  .style("clip-path", "url(#clip)")
  .attr("class","mainGroup");

  var miniGroup = svg.append("g")
          .attr("class","miniGroup")
          .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

  var brushGroup = svg.append("g")
          .attr("class","brushGroup")
          .attr("transform","translate(" + (main_margin.left + main_width + main_margin.right + mini_margin.left) + "," + mini_margin.top + ")");

  /////////////////////////////////////////////////////////////
  ////////////////////// Initiate scales //////////////////////
  /////////////////////////////////////////////////////////////

  main_xScale = d3v3.scale.linear().range([0, main_width]);
  mini_xScale = d3v3.scale.linear().range([0, mini_width]);

  main_yScale = d3v3.scale.ordinal().rangeBands([0, main_height], 0.4, 0);
  mini_yScale = d3v3.scale.ordinal().rangeBands([0, mini_height], 0.4, 0);
  //Based on the idea from: http://stackoverflow.com/questions/21485339/d3-brushing-on-grouped-bar-chart
  main_yZoom = d3v3.scale.linear()
  .range([0, main_height])
  .domain([0, main_height]);

  //Create x axis object
  main_xAxis = d3v3.svg.axis()
  .scale(main_xScale)
  .orient("bottom")
  .ticks(8)
  .outerTickSize(0);

  //Add group for the x axis
  d3v3.select(".mainGroupWrapper").append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(" + 0 + "," + (main_height + 5) + ")");

  //Create y axis object
  main_yAxis = d3v3.svg.axis()
  .scale(main_yScale)
  .orient("left")
  .tickSize(0)
  .outerTickSize(0);

  //Add group for the y axis
  mainGroup.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(-5,0)");

  /////////////////////////////////////////////////////////////
  /////////////////////// Update scales ///////////////////////
  /////////////////////////////////////////////////////////////
  //Update the scales
  main_xScale.domain([-1, 1]);
  mini_xScale.domain([-1, 1]);     
  main_yScale.domain(correlationResultsFinal.map(function(d) { return d[0]; }));
  mini_yScale.domain(correlationResultsFinal.map(function(d) { return d[0]; }));

  //Create the visual part of the y axis
  d3v3.select(".mainGroup").select(".y.axis").call(main_yAxis);
  d3v3.select(".mainGroupWrapper").select(".x.axis").call(main_xAxis);

  /////////////////////////////////////////////////////////////
  ///////////////////// Label axis scales /////////////////////
  /////////////////////////////////////////////////////////////

  textScale = d3v3.scale.linear()
  .domain([15,50])
  .range([12,6])
  .clamp(true);

  /////////////////////////////////////////////////////////////
  ///////////////////////// Create brush //////////////////////
  /////////////////////////////////////////////////////////////

  //What should the first extent of the brush become - a bit arbitrary this
  brush = d3v3.svg.brush()
  .y(mini_yScale)
  .extent([mini_yScale(correlationResultsFinal[0][0]), main_height])
  .on("brush", brushmove)

  //Set up the visual part of the brush
  gBrush = d3v3.select(".brushGroup").append("g")
  .attr("class", "brush")
  .call(brush);

  gBrush.selectAll(".resize")
  .append("line")
  .attr("x2", mini_width);

  gBrush.selectAll(".resize")
  .append("path")
  .attr("d", d3v3.svg.symbol().type("triangle-up").size(20))
  .attr("transform", function(d,i) { 
  return i ? "translate(" + (mini_width/2) + "," + 4 + ") rotate(180)" : "translate(" + (mini_width/2) + "," + -4 + ") rotate(0)"; 
  });

  gBrush.selectAll("rect")
  .attr("width", mini_width);

  //On a click recenter the brush window
  gBrush.select(".background")
  .on("mousedown.brush", brushcenter)
  .on("touchstart.brush", brushcenter);
  ///////////////////////////////////////////////////////////////////////////
  /////////////////// Create a rainbow gradient - for fun ///////////////////
  ///////////////////////////////////////////////////////////////////////////

  defs = svg.append("defs")

  //Create two separate gradients for the main and mini bar - just because it looks fun
  createGradient("gradient-main", "60%");
  createGradient("gradient-mini", "13%");

  //Add the clip path for the main bar chart
  defs.append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("x", -main_margin.left)
  .attr("width", main_width + main_margin.left)
  .attr("height", main_height);

  /////////////////////////////////////////////////////////////
  /////////////// Set-up the mini bar chart ///////////////////
  /////////////////////////////////////////////////////////////

  //The mini brushable bar
  //DATA JOIN
  var mini_bar = d3v3.select(".miniGroup").selectAll(".bar")
  .data(correlationResultsFinal, function(d) { return +d[2]; });

  //UDPATE
  mini_bar
  .attr("width", function(d) { return Math.abs(mini_xScale(d[1]) - mini_xScale(0)); })
  .attr("y", function(d,i) { return mini_yScale(d[0]); })
  .attr("height", mini_yScale.rangeBand())

  //ENTER
  mini_bar.enter().append("rect")
  .attr("class", "bar")
  .attr("x", function (d) { return mini_xScale(Math.min(0, d[1])); })
  .attr("width", function(d) { return Math.abs(mini_xScale(d[1]) - mini_xScale(0)); })
  .attr("y", function(d,i) { return mini_yScale(d[0]); })
  .attr("height", mini_yScale.rangeBand())
  .style("fill", "url(#gradient-mini)");

  //EXIT
  mini_bar.exit()
  .remove();

  //Start the brush
  //gBrush.call(brush.event);
  gBrush.call(brush.event);
  prevRightClick = true;
  }

//Function runs on a brush move - to update the big bar chart
function updateBarChart() {

  /////////////////////////////////////////////////////////////
  ////////// Update the bars of the main bar chart ////////////
  /////////////////////////////////////////////////////////////

  var bar = d3v3.select(".mainGroup").selectAll(".bar")
      .data(correlationResultsFinal, function(d) { return +d[2]; })
  //, function(d) { return d.key; });

  bar
    .attr("x", function (d) { return main_xScale(Math.min(0, d[1])); })
    .attr("width", function(d) { return Math.abs(main_xScale(d[1]) - main_xScale(0)); })
    .attr("y", function(d,i) { return main_yScale(d[0]); })
    .attr("height", main_yScale.rangeBand());

  //ENTER
  bar.enter().append("rect")
    .attr("class", "bar")
    .style("fill", "url(#gradient-main)")
    .attr("x", function (d) { return main_xScale(Math.min(0, d[1])); })
    .attr("width", function(d) { return Math.abs(main_xScale(d[1]) - main_xScale(0)); })
    .attr("y", function(d,i) { return main_yScale(d[0]); })
    .attr("height", main_yScale.rangeBand())
    .on("mouseover", () => {
      svg.select('.tooltip').style('display', 'none'); 
    })
    .on("click", function(d) {
      var flag = false;
      points.forEach(function (p) {
        if (p.DimON == d[0])
        {
          flag = true;
        }
      });
      if (flag == false){
        correlationResultsFinal.forEach(function(corr){
          var str2 = corr[0];
            var elements2 = $("*:contains('"+ str2 +"')").filter(
                    function(){
                        return $(this).find("*:contains('"+ str2 +"')").length == 0
                    }
                 );
                 elements2[0].style.fontWeight = 'normal';
                 if (typeof elements2[1] != "undefined"){
                  elements2[1].style.fontWeight = 'normal';
                 }
        });
        points.forEach(function (p) {
          if (p.schemaInv == true) {
            p.DimON = d[0];
            var str = p.DimON;
            var elements = $("*:contains('"+ str +"')").filter(
                    function(){
                        return $(this).find("*:contains('"+ str +"')").length == 0
                    }
                 );
                 elements[0].style.fontWeight = 'bold';
          }
        })
      } else{
        correlationResultsFinal.forEach(function(corr){
          var str2 = corr[0];
            var elements2 = $("*:contains('"+ str2 +"')").filter(
                    function(){
                        return $(this).find("*:contains('"+ str2 +"')").length == 0
                    }
                 );
                 elements2[0].style.fontWeight = 'normal';
                 if (typeof elements2[1] != "undefined"){
                  elements2[1].style.fontWeight = 'normal';
                 }
        });
        points.forEach(function (p) {
          p.DimON = null;
        });
      }
      BetatSNE(points);
    });
    

  //EXIT
  bar.exit()
    .remove();
}//update

/////////////////////////////////////////////////////////////
////////////////////// Brush functions //////////////////////
/////////////////////////////////////////////////////////////

//First function that runs on a brush move
function brushmove() {

  var extent = brush.extent();

   //Reset the part that is visible on the big chart
   var originalRange = main_yZoom.range();
   main_yZoom.domain( extent );

  //Update the domain of the x & y scale of the big bar chart
  main_yScale.domain(correlationResultsFinal.map(function(d) { return d[0]; }));
  main_yScale.rangeBands( [ main_yZoom(originalRange[0]), main_yZoom(originalRange[1]) ], 0.4, 0);

  //Update the y axis of the big chart
  d3v3.select(".mainGroup")
    .select(".y.axis")
    .select("textLength","10")
    .call(main_yAxis);
    
  //Which bars are still "selected"
  var selected = mini_yScale.domain()
    .filter(function(d) { return (extent[0] - mini_yScale.rangeBand () + 1e-2 <= mini_yScale(d)) && (mini_yScale(d) <= extent[1] - 1e-2); }); 

    //Update the colors of the mini chart - Make everything outside the brush grey
 d3.select(".miniGroup").selectAll(".bar")
    .style("fill", function(d, i) { return selected.indexOf(d[0]) > -1 ? "url(#gradient-mini)" : "#e0e0e0"; });

  //Update the label size
  d3v3.selectAll(".y.axis text")
    .style("font-size", textScale(selected.length));

  //Update the big bar chart
  updateBarChart();
  
}//brushmove

/////////////////////////////////////////////////////////////
////////////////////// Click functions //////////////////////
/////////////////////////////////////////////////////////////

  //Based on http://bl.ocks.org/mbostock/6498000
  //What to do when the user clicks on another location along the brushable bar chart
  function brushcenter() {
    var target = d3v3.event.target,
        extent = brush.extent(),
        size = extent[1] - extent[0],
        range = mini_yScale.range(),
        y0 = d3v3.min(range) + size / 2,
        y1 = d3.max(range) + mini_yScale.rangeBand() - size / 2,
        center = Math.max( y0, Math.min( y1, d3.mouse(target)[1] ) );

    d3v3.event.stopPropagation();

    gBrush
        .call(brush.extent([center - size / 2, center + size / 2]))
        .call(brush.event);

  }//brushcenter

  function scroll() {

    //Mouse scroll on the mini chart
    var extent = brush.extent(),
      size = extent[1] - extent[0],
      range = mini_yScale.range(),
      y0 = d3v3.min(range),
      y1 = d3v3.max(range) + mini_yScale.rangeBand(),
      dy = d3v3.event.deltaY,
      topSection;

    if ( extent[0] - dy < y0 ) { topSection = y0; } 
    else if ( extent[1] - dy > y1 ) { topSection = y1 - size; } 
    else { topSection = extent[0] - dy; }

    //Make sure the page doesn't scroll as well
    d3v3.event.stopPropagation();
    d3v3.event.preventDefault();

    gBrush
        .call(brush.extent([ topSection, topSection + size ]))
        .call(brush.event);

  }//scroll

/////////////////////////////////////////////////////////////
///////////////////// Helper functions //////////////////////
/////////////////////////////////////////////////////////////

//Create a gradient 
function createGradient(idName, endPerc) {

  var colorsBarChart = ['#919191'];

  colorsBarChart.reverse();

  defs.append("linearGradient")
    .attr("id", idName)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", endPerc).attr("y2", "0%")
    .selectAll("stop") 
    .data(colorsBarChart)                  
    .enter().append("stop") 
    .attr("offset", function(d,i) { return i/(colorsBarChart.length-1); })   
    .attr("stop-color", function(d) { return d; });
}//createGradient

function mapOrder(array, order, key) { // Order an array according to a key.
  
  array.sort( function (a, b) {
    var A = a[key], B = b[key];
    if (order.indexOf(A) > order.indexOf(B)) {
      return 1;
    } else {
      return -1;
    }
    
  });
  return array;

};

    /**
   *  Calculate the person correlation score between two items in a dataset.
   *
   *  @param  {object}  prefs The dataset containing data about both items that
   *                    are being compared.
   *  @param  {string}  p1 Item one for comparison.
   *  @param  {string}  p2 Item two for comparison.
   *  @return {float}  The pearson correlation score.
   */
  function pearsonCorrelation(prefs, p1, p2) {
    var si = [];

    for (var key in prefs[p1]) {
      if (prefs[p2][key]) si.push(key);
    }

    var n = si.length;

    if (n == 0) return 0;

    var sum1 = 0;
    for (var i = 0; i < si.length; i++) sum1 += prefs[p1][si[i]];

    var sum2 = 0;
    for (var i = 0; i < si.length; i++) sum2 += prefs[p2][si[i]];

    var sum1Sq = 0;
    for (var i = 0; i < si.length; i++) {
      sum1Sq += Math.pow(prefs[p1][si[i]], 2);
    }

    var sum2Sq = 0;
    for (var i = 0; i < si.length; i++) {
      sum2Sq += Math.pow(prefs[p2][si[i]], 2);
    }

    var pSum = 0;
    for (var i = 0; i < si.length; i++) {
      pSum += prefs[p1][si[i]] * prefs[p2][si[i]];
    }

    var num = pSum - (sum1 * sum2 / n);
    var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
        (sum2Sq - Math.pow(sum2, 2) / n));
        
    if (den == 0) return 0;

    return num / den;
  }

  function closestPoint(pathNode, point) {
    var pathLength = pathNode.getTotalLength(),
        precision = 8,
        best,
        bestLength,
        bestDistance = Infinity;

    // linear scan for coarse approximation
    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
      if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
        best = scan, bestLength = scanLength, bestDistance = scanDistance;
      }
    }
  
    // binary search for precise estimate
    precision /= 2;
    while (precision > 0.5) {
      var before,
          after,
          beforeLength,
          afterLength,
          beforeDistance,
          afterDistance;
      if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
        best = before, bestLength = beforeLength, bestDistance = beforeDistance;
      } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
        best = after, bestLength = afterLength, bestDistance = afterDistance;
      } else {
        precision /= 2;
      }
    }
  
    best = [best.x, best.y];
    best.distance = Math.sqrt(bestDistance);
    best.id = point[2];
    return best;
  
    function distance2(p) {
      var dx = p.x - point[0],
          dy = p.y - point[1];
      return dx * dx + dy * dy;
    }
}

function abbreviateNumber(value) { // Abbreviate the numbers for the main visualization legend!

  var newValue = value;
  if (value >= 1000) {
      var suffixes = ["", "k", "m", "b","t"];
      var suffixNum = Math.floor( (""+value).length/3 );
      var shortValue = '';
      for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
          var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
          if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
      newValue = shortValue+suffixes[suffixNum];
  }
  return newValue;

}

function clearThree(obj){ // Clear three.js object!

  while(obj.children.length > 0){ 
    clearThree(obj.children[0])
    obj.remove(obj.children[0]);
  }
  if(obj.geometry) obj.geometry.dispose()
  if(obj.material) obj.material.dispose()
  if(obj.texture) obj.texture.dispose()

}   

var viewport3 = getViewport(); // Get the width and height of the main visualization
var vw3 = viewport3[0] * 0.2; 

var margin = {top: 40, right: 100, bottom: 40, left: 190}, // Set the margins for the pcp
width = Math.min(vw3, window.innerWidth - 10) - margin.left - margin.right,
height = Math.min(width, window.innerHeight - margin.top - margin.bottom);

function BetatSNE(points){ // Run the main visualization
inside = inside + 1;
if (points.length) { // If points exist (at least 1 point)

    selectedPoints = [];
    howManyPoints = 0;
    for (let m=0; m<points.length; m++){
      //if (points[m].id == 257){
      if (points[m].selected == true){
        howManyPoints = howManyPoints + 1;
        selectedPoints.push(points[m]); // Add the selected points in to a new variable
      }
    }

      var indexOrder = [];
      var indexOrder2d = [];
      var indices = new Array(selectedPoints.length);
      var indices2d = new Array(selectedPoints.length);

      var findNearest;

      //var maxKNN = 1;
      selectedPoints.sort(function(a, b) { // Sort the points according to ID.
        return parseFloat(a.id) - parseFloat(b.id);
      });
      findNearestTable = [];
      maxKNN = Math.round(document.getElementById("param-perplexity-value").value*1.25); // Specify the amount of k neighborhoods that we are going to calculate. According to "perplexity."

      for (k=maxKNN; k>0; k--){ // Start from the maximum k value and go to the minimum (k=2).

        var findNearest = [];
        var indexOrderSliced = [];
        var indexOrderSliced2d = [];
        var count = [];
        var findNearestAVG = 0;
        var sumIntersection = [];
        var sumUnion = [];
        for (var i=0; i<selectedPoints.length;i++){
          count[i] = 0;
          var id = selectedPoints[i].id;
            // Temporary array holds objects with position and sort-value
            indices[i] = dists[id].map(function(el, j) {
              return [ j, el ];
            })
            indices2d[i] = dists2d[id].map(function(el, j) {
              return [ j, el ];
            })
            if (k == maxKNN){
              for (var j = id+1; j<points.length; j++){ // For the selected points check the purity of the cluster.
                indices[i].push([j,dists[j][id]]);
                indices2d[i].push([j,dists2d[j][id]]);
              }
                // Sorting the mapped array containing the reduced values
                indices[i].sort(function(a, b) {
                  if (a[1] > b[1]) {
                    return 1;
                  }
                  if (a[1] < b[1]) {
                    return -1;
                  }
                  return 0;
                });
                indexOrder[i] = indices[i].map(function(value) { return value[0]; });
                // Sorting the mapped array containing the reduced values
                indices2d[i].sort(function(a, b) {
                  if (a[1] > b[1]) {
                    return 1;
                  }
                  if (a[1] < b[1]) {
                    return -1;
                  }
                  return 0;
                });

                indexOrder2d[i] = indices2d[i].map(function(value) { return value[0]; });
              }
              indexOrderSliced[i] = indexOrder[i].slice(0,k);
              indexOrderSliced2d[i] = indexOrder2d[i].slice(0,k);
            for (var m=0; m < indexOrderSliced2d[i].length; m++){
              if (indexOrderSliced[i].includes(indexOrderSliced2d[i][m])){ // Union
                count[i] = count[i] + 1;
              }
            }

            sumIntersection.push(count[i]);
            sumUnion.push((k*2 - sumIntersection[i]));
          }

          for (var i=0; i<selectedPoints.length;i++){
            findNearest[i] = sumIntersection[i] / sumUnion[i];
            findNearestAVG = findNearestAVG + findNearest[i];
          }

          findNearestAVG = findNearestAVG / selectedPoints.length; // Nearest neighbor!

          if (isNaN(findNearestAVG)){
            findNearestAVG = 0; // If kNN is fully uncorrelated then we say that the value is 0.
          }
          findNearestTable.push(findNearestAVG.toFixed(2)); // These values are multiplied by the height of the viewport because we need to draw the bins of the barchart representation
      }
         
      findNearestTable.reverse();
      
      d3.select("#hider").style("z-index", 1);
      d3.select("#knnBarChart").style("z-index", 2);

      var data = [];
      var layout = [];
      kValuesLegend = [];
      for (var i=1; i<=maxKNN; i++){
        kValuesLegend.push(i);
      }
      if (inside == 1){
        StoreInitialFindNearestTable = findNearestTable;
      }  
              
      LineBar();

        // Here we have the code for the pcp
        d3.select("#PCP").selectAll('g').remove(); // Remove the pcp if there was one before

        var coun = 0;
        for (var i=0; i < selectedPoints.length; i++){
          if (selectedPoints[i].pcp == true){ // Count the selected points
            coun = coun + 1;
          } 
        }
        

        var FeatureWise = [];
        for (var j=0; j<Object.values(dataFeatures[0]).length; j++){ // Get the features of the data set.
          for (var i=0;i<dataFeatures.length;i++){
            if (!isNaN(Object.values(dataFeatures[i])[j])){
              FeatureWise.push(Object.values(dataFeatures[i])[j]);
            }
          }
        }
        
        var max = [];
        var min = [];
        var vectors = [];
        var FeatureWiseSlicedArray = [];

        for (var j=0; j<Object.values(dataFeatures[0]).length; j++){
          var FeatureWiseSliced = FeatureWise.slice(0+(j*dataFeatures.length),dataFeatures.length+j*dataFeatures.length);
          if (FeatureWiseSliced != ""){
            FeatureWiseSlicedArray.push(FeatureWiseSliced);
          }

          max[j] = FeatureWiseSliced[0];
          min[j] = FeatureWiseSliced[0];
          for (var i=0; i<FeatureWiseSliced.length; i++){
            if (max[j] < FeatureWiseSliced[i]){
              max[j] = FeatureWiseSliced[i];
            }
            if (min[j] > FeatureWiseSliced[i]){
              min[j] = FeatureWiseSliced[i];
            }
          }
        }

        var FeaturesSelectedPoints = []; 
        for (var i=0; i< selectedPoints.length; i++){
          FeaturesSelectedPoints.push(ArrayContainsDataFeaturesClearedwithoutNull[selectedPoints[i].id]);
        }

        var vectors = PCA.getEigenVectors(FeaturesSelectedPoints); // Run a local PCA!
        var PCAResults = PCA.computeAdjustedData(FeaturesSelectedPoints,vectors[0]); // Get the results with the first most variation.

        var PCASelVec = []; var PCASelVecAbs = [];
        PCASelVec = PCAResults.selectedVectors[0];
        PCASelVec.forEach(element => {
          element = Math.abs(element);
          PCASelVecAbs.push(element);
        });

        var len = PCASelVecAbs.length;
        var indices = new Array(len);

        for (var i = 0; i < len; ++i) indices[i] = i;
        indices = indices.sort(function (a, b) { return PCASelVecAbs[a] > PCASelVecAbs[b] ? -1 : PCASelVecAbs[a] < PCASelVecAbs[b] ? 1 : 0; }); // Get the most important features first! 

        if (len > 8){ // Get only the 8 best dimensions.
          indices = indices.slice(0,8);
          len = 8
        }

      emptyPCP();
      var parcoords = d3v3.parcoords()("#PCP");
      // Remove or add that if you want to achieve a different effect when you have less than 10 points.
      var wrapData2 = [];
      for (var i=0; i<selectedPoints.length; i++){
        var data = [];
        for (var m=0; m <= len; m++){
          for (var j=0; j< Object.keys(dataFeatures[selectedPoints[i].id]).length; j++){
              if (m == len){
                var index = Object.keys(dataFeatures[points[i].id]).indexOf(Category)
                if(format[0] == "diabetes"){
                  if (Object.values(dataFeatures[selectedPoints[i].id])[index] == 1){
                    Object.assign(data,{[Object.keys(dataFeatures[selectedPoints[i].id])[index]]:"Positive"}); // Push the values into the pcp
                  } else{
                    Object.assign(data,{[Object.keys(dataFeatures[selectedPoints[i].id])[index]]:"Negative"}); // Push the values into the pcp
                  }
                } else{
                  Object.assign(data,{[Object.keys(dataFeatures[selectedPoints[i].id])[index]]:(Object.values(dataFeatures[selectedPoints[i].id])[index])}); // Push the values into the pcp
                }
              } else{
                if (indices[m] == j){
                //if (m == j){
                  Object.assign(data,{[Object.keys(dataFeatures[selectedPoints[i].id])[indices[m]]]:parseFloat(Object.values(dataFeatures[selectedPoints[i].id])[indices[m]]).toFixed(1)}); // Push the values into the pcp
                  //Object.assign(data,{[Object.keys(dataFeatures[selectedPoints[i].id])[m]]:parseFloat(Object.values(dataFeatures[selectedPoints[i].id])[m]).toFixed(1)}); // Push the values into the pcp
                //}
                }
              }
            }
          } 
          wrapData2.push(data);
      }
      
    var CategoryReplaced = Category;
    wrapData2.sort(function(a, b){
      if(a[CategoryReplaced] < b[CategoryReplaced]) { return -1; }
      if(a[CategoryReplaced] > b[CategoryReplaced]) { return 1; }
      return 0;
  })
  function sortByFrequency(array) {
    var frequency = {};
    var CategoryReplaced = Category;
    array.forEach(function(value) { frequency[value[CategoryReplaced]] = 0; });

    var uniques = array.filter(function(value) {
        return ++frequency[value[CategoryReplaced]] == 1;
    });
    var result = uniques.map(function(value) {
      return frequency[value[CategoryReplaced]];
    });
    return result;
  }

  var lessmore = sortByFrequency(wrapData2);
  if (lessmore[0] < lessmore[1]){
    wrapData2.reverse();
  }

      var AllPointsWrapData2 = [];
      for (var i=0; i<points.length; i++){
        var data = [];
        for (var m=0; m <= len; m++){
         for (var j=0; j< Object.keys(dataFeatures[points[i].id]).length; j++){
              if (m == len){
                var index = Object.keys(dataFeatures[points[i].id]).indexOf(Category)
                if(format[0] == "diabetes"){
                  if (Object.values(dataFeatures[points[i].id])[index] == 1){
                    Object.assign(data,{[Object.keys(dataFeatures[points[i].id])[index]]:"Positive"}); // Push the values into the pcp
                  } else{
                    Object.assign(data,{[Object.keys(dataFeatures[points[i].id])[index]]:"Negative"}); // Push the values into the pcp
                  }
                } else{
                  Object.assign(data,{[Object.keys(dataFeatures[points[i].id])[index]]:(Object.values(dataFeatures[points[i].id])[index])}); // Push the values into the pcp
                }
              } else{
                if (indices[m] == j){
                //if (m == j){
                  Object.assign(data,{[Object.keys(dataFeatures[points[i].id])[indices[m]]]:parseFloat(Object.values(dataFeatures[points[i].id])[indices[m]]).toFixed(1)}); // Push the values into the pcp
                  //Object.assign(data,{[Object.keys(dataFeatures[points[i].id])[m]]:parseFloat(Object.values(dataFeatures[points[i].id])[m]).toFixed(1)}); // Push the values into the pcp
                //}
                }
              }
            }
          } 
          AllPointsWrapData2.push(data);
      }

      AllPointsWrapData2.sort(function(a, b){
        if(a[CategoryReplaced] < b[CategoryReplaced]) { return -1; }
        if(a[CategoryReplaced] > b[CategoryReplaced]) { return 1; }
        return 0;
    })
  

      if (all_labels[0] == undefined){
        var colorScaleCat = d3.scaleOrdinal().domain(["No Category"]).range(["#C0C0C0"]);
      }
      else{
        if(format[0] == "diabetes"){
          for (var i=0; i<all_labels.length; i++){
            if (all_labels[i] == 1){
              all_labels[i] = "Positive";
            } else{
              all_labels[i] = "Negative";
            }
          }
        }
        var colorScaleCat = d3.scaleOrdinal().domain(all_labels).range(ColorsCategorical);
      }
      if (AllPointsWrapData2.length == wrapData2.length){
        parcoords
        .data(AllPointsWrapData2)
        .alpha(0.35)
        .composite("darken")
        .hideAxis([Category])
        .margin({ top: 20, left: 0, bottom: 10, right: -8 })
        .mode("default")
        .color(function(d){if(format[0] == "diabetes"){if(d[Category] == "Negative"){return colorScaleCat("Positive");}else{return colorScaleCat("Negative");}} else{return colorScaleCat(d[Category]);}})
        .render()
        .createAxes();
  
      parcoords.svg.selectAll("text")
        .style("font", "14px");
      } else{
        parcoords
        .data(AllPointsWrapData2)
        .composite("darken")
        .hideAxis([Category])
        .margin({ top: 20, left: 0, bottom: 10, right: -8 })
        .mode("default")
        .color(function(d){if(format[0] == "diabetes"){if(d[Category] == "Negative"){return colorScaleCat("Positive");}else{return colorScaleCat("Negative");}} else{return colorScaleCat(d[Category]);}})
        .render()
        .highlight(wrapData2)
        .createAxes();
      }
      
    //}

  var ColSizeSelector = document.getElementById("param-neighborHood").value; // This is the mapping of the color/size in beta/KLD

  d3.selectAll("#legend4 > *").remove();

  if (ColSizeSelector == "color") { // If we have beta into color then calculate the color scales

    var max = (d3.max(points,function(d){ return d.beta; }));
    var min = (d3.min(points,function(d){ return d.beta; }));

    var calcStep = (max)/8;

    var costLimiter = document.getElementById("param-costlim").value;

    var maxSize1 = (d3.max(points,function(d){ return d.cost; }));

    points = points.sort(function(a, b) { // Sort them according to importance (darker color!)
      return a.cost - b.cost;
    })
    var temp = parseInt((1-costLimiter)*points.length);
    var minSize1 = points[temp].cost;
    for (var i=temp+1; i<points.length; i++){
      if (minSize1 > points[i].cost){
          minSize1 = points[i].cost;
      }
    }
    
    var rscale1 = d3.scaleLinear()
    .domain([minSize1, maxSize1])
    .range([5,parseInt(12-(1-document.getElementById("param-costlim").value)*7)]);
    var calcStepSize1 = (maxSize1-minSize1);

    var limitdist = document.getElementById("param-lim-value").value;
    limitdist = parseFloat(limitdist).toFixed(1);

    var legendScale1 = d3.scaleLinear()
    .domain(d3.range(minSize1, maxSize1+calcStepSize1, calcStepSize1))
    .range([5*limitdist/2,(parseInt(12-(1-document.getElementById("param-costlim").value)*7))*limitdist/2]);

    var colorScale = d3.scaleSequential()
     .domain([0, max+calcStep])
     .interpolator(d => d3.interpolateViridis(1-d));
      
    points = points.sort(function(a, b) { // Sort them according to importance (darker color!)
      return a.beta - b.beta;
    })
    var labels_beta = [];
    var abbr_labels_beta = [];
    var calcStep = (max)/8;
    labels_beta = d3.range(0, max+calcStep, calcStep);
    for (var i=0; i<9; i++){
      labels_beta[i] = parseInt(labels_beta[i]);
      abbr_labels_beta[i] = abbreviateNumber(labels_beta[i]);
    }
    var svg = d3.select("#legend1");

      svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(10,20)");

      var legend = d3.legendColor()
        .labelFormat(d3.format(",.0f"))
        .cells(9)
        .labels([abbr_labels_beta[0],abbr_labels_beta[1],abbr_labels_beta[2],abbr_labels_beta[3],abbr_labels_beta[4],abbr_labels_beta[5],abbr_labels_beta[6],abbr_labels_beta[7],abbr_labels_beta[8]])
        .title("Density")
        .scale(colorScale);
        
      svg.select(".legendLinear")
        .call(legend);
      
      var svg = d3.select("#legend4");

      svg.append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate(10,20)");

      var SizeRange1 = [];

      if (minSize1 < 0) {
        SizeRange1.push(0.0000)
      } else {
        SizeRange1.push((minSize1).toFixed(4));
      }
      SizeRange1.push(((maxSize1-minSize1)/2).toFixed(4));
      SizeRange1.push((maxSize1).toFixed(4));

      var legendSize1 = d3.legendSize()
        .scale(legendScale1)
        .cells(3)
        .shape('circle')
        .labels([SizeRange1[0],SizeRange1[1],SizeRange1[2]])
        .shapePadding(10)
        .labelOffset(5)
        .title("Remaining Cost")
        .orient('vertical');
        
      svg.select(".legendSize")
        .call(legendSize1);

        var circles = document.getElementsByClassName("swatch");
        for (var i=0; i<circles.length; i++){
          if(circles[i].localName == "circle"){
            circles[i].style.fill = "rgb(128,0,0)";
          }
        }
  } else { // If we have cost into color then calculate the color scales

    var costLimiter = document.getElementById("param-costlim").value;
          
    points = points.sort(function(a, b) { // Sort them according to importance (darker color!)
      return a.cost - b.cost;
    })
    var temp = parseInt((1-costLimiter)*points.length);
    var min = points[temp].cost;
    for (var i=temp+1; i<points.length; i++){
      if (min > points[i].cost){
        if (points[i].cost < 0) {
          min = 0;
        } else {
          min = points[i].cost;
        }
      }
    }

    var max = (d3.max(points,function(d){ return d.cost; }));
    var min = (d3.min(points,function(d){ return d.cost; }));

    var maxSize2 = (d3.max(points,function(d){ return d.beta; }));
    var minSize2 = (d3.min(points,function(d){ return d.beta; }));

    var rscale2 = d3.scaleLinear()
      .domain([0, maxSize2])
      .range([5,12]);
      
      d3.selectAll("#legend1 > *").remove();

      var calcStep = ((max-min)/8);

      var colorScale = d3.scaleSequential()
     .domain([min, max])
     .interpolator(d => d3.interpolateMagma(1-d));

      var labels_cost = [];
      var abbr_labels_cost = [];
      labels_cost = d3.range(min, max+calcStep, calcStep);
      for (var i=0; i<9; i++){
        labels_cost[i] = labels_cost[i].toFixed(5);
        abbr_labels_cost[i] = Math.abs(abbreviateNumber(labels_cost[i]));
      }

      var svg = d3.select("#legend1"); // Add the legend for the beta/cost
      
      svg.append("g")
          .attr("class", "legendLinear")
          .attr("transform", "translate(10,15)");

      var legend = d3.legendColor()
        .labelFormat(d3.format(",.5f"))
        .cells(9)
        .labels([abbr_labels_cost[0],abbr_labels_cost[1],abbr_labels_cost[2],abbr_labels_cost[3],abbr_labels_cost[4],abbr_labels_cost[5],abbr_labels_cost[6],abbr_labels_cost[7],abbr_labels_cost[8]])
        .title("Remaining Cost")
        .scale(colorScale);

      svg.select(".legendLinear")
        .call(legend);

    var calcStepSize2 = parseInt(maxSize2/2);

    var limitdist = document.getElementById("param-lim-value").value;
    limitdist = parseFloat(limitdist).toFixed(1);

    var legendScale2 = d3.scaleLinear()
    .domain(d3.range(0, parseInt(maxSize2), calcStepSize2))
    .range([5*limitdist/2,12*limitdist/2]);

      
      var svg = d3.select("#legend4");

      svg.append("g")
        .attr("class", "legendSize")
        .attr("transform", "translate(10,15)");

      var SizeRange2 = [];
      SizeRange2.push(0);
      var temporalvalue = parseInt(maxSize2/2);
      SizeRange2.push(abbreviateNumber(temporalvalue));
      SizeRange2.push(abbreviateNumber(parseInt(maxSize2)));

      var legendSize2 = d3.legendSize()
        .scale(legendScale2)
        .labelFormat(d3.format(",.0f"))
        .cells(3)
        .shape('circle')
        .labels([SizeRange2[0],SizeRange2[1],SizeRange2[2]])
        .shapePadding(10)
        .labelOffset(5)
        .title("Density")
        .orient('vertical');
        
      svg.select(".legendSize")
        .call(legendSize2);

        var circles = document.getElementsByClassName("swatch");
        for (var i=0; i<circles.length; i++){
          if(circles[i].localName == "circle"){
            circles[i].style.fill = "rgb(0,128,0)";
          }
        }

  }

  
  let tempSort = -1;

  for (var i=0; i<points.length; i++){ // Sort according to dimension on hover on top of a dimension of the correlation barchart.
    if (points[i].DimON != null) {
      tempSort = points[i].DimON.match(/\d+/)[0];
    }
  }

  if (tempSort != -1){
    points = points.sort(function(a, b) {
        return a[tempSort] - b[tempSort];
    })
  }
  var temp = 0;
  let zoom = d3.zoom()
    .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
    .on('zoom', () =>  {
      temp = temp + 1;

      let d3_transform = d3.event.transform;
      zoomHandler(d3_transform);
      if (temp > 2){
        var frustum = new THREE.Frustum();
        var cameraViewProjectionMatrix = new THREE.Matrix4();
        
        // every time the camera or objects change position (or every frame)
        
        camera.updateMatrixWorld(); // make sure the camera matrix is updated
        camera.matrixWorldInverse.getInverse( camera.matrixWorld );
        cameraViewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );
        frustum.setFromMatrix( cameraViewProjectionMatrix );
        
        // frustum is now ready to check all the objects you need
        VisiblePoints = [];
        for (var l = 0; l<scene.children.length-1; l++){
          if (frustum.intersectsObject(scene.children[l])){
            VisiblePoints.push(scene.children[l].geometry.name);
          }
        }
        OverviewtSNE(points);
      }
    });

  view = d3.select(renderer.domElement);

  function setUpZoom() {
    view.call(zoom);    
    let initial_scale = getScaleFromZ(far);
    var initial_transform = d3.zoomIdentity.translate(dimensions/2, dimensionsY/2).scale(initial_scale);    
    zoom.transform(view, initial_transform);
    camera.position.set(0, 0, far);
  }

  setUpZoom();

  var circle_sprite= new THREE.TextureLoader().load( // Add the circle effect
    "./textures/circle-sprite.png"
  )

  clearThree(scene); // Clear previous scenes 

  // Increase/reduce size factor selected by the user
  var limitdist = document.getElementById("param-lim-value").value;
  limitdist = parseFloat(limitdist).toFixed(1);

  let pointsMaterial;
  let factorPlusSize;
  let geometry = new THREE.Geometry();
  for (var i=0; i<points.length; i++) {
    let pointsGeometry = new THREE.Geometry();
    let vertex = new THREE.Vector3((((points[i].x/dimensions)*2) - 1)*dimensions, (((points[i].y/dimensionsY)*2) - 1)*dimensionsY*-1, 0);
    pointsGeometry.vertices.push(vertex);
    pointsGeometry.name = points[i].id;
    geometry.vertices.push(vertex);
    if (points[i].DimON != null) {
      let temp = points[i].DimON.match(/\d+/)[0];
      var maxDim = (d3.max(points,function(d){ if(d.schemaInv == true){return d[temp]}; }));
      var minDim = (d3.min(points,function(d){ if(d.schemaInv == true){return d[temp]}; }));  

      let colorsBarChart = ['#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'];
      var calcStepDim = (maxDim-minDim)/6;
      var colorScale = d3.scaleLinear()
        .domain(d3.range(minDim, maxDim+calcStepDim, calcStepDim))
        .range(colorsBarChart);
      var color = new THREE.Color(colorScale(points[i][temp]));
    } else if (points[i].selected == false && points[i].schemaInv == false){
      var color = new THREE.Color("rgb(211, 211, 211)");
    } else if (points[i].selected == false && points[i].schemaInv == true){
      var color = new THREE.Color("rgb(145, 145, 145)");
    } else if (ColSizeSelector == "color") {
      var color = new THREE.Color(colorScale(points[i].beta));
      //var color = new THREE.Color("rgb(125, 125, 125)");
    }
    else{
        if (points[i].cost < min){
          var color = new THREE.Color("rgb(240,240,240)");
        } else{
          var color = new THREE.Color(colorScale(points[i].cost));
        }
    }
    if (ColSizeSelector == "color") {
      if (points[i].cost < minSize1){
        var sizePoint = 1;
      } else{
        var sizePoint = rscale1(points[i].cost);
      }
      factorPlusSize = limitdist * sizePoint;
      pointsGeometry.colors.push(color);
      pointsMaterial = new THREE.PointsMaterial({
        sizeAttenuation: false,
        size: Number(factorPlusSize.toFixed(1)),
        vertexColors: THREE.VertexColors,
        map: circle_sprite,
        transparent: true
      });
    } else{
      let sizePoint = rscale2(points[i].beta);
      factorPlusSize = limitdist * sizePoint;
      pointsGeometry.colors.push(color);
      pointsMaterial = new THREE.PointsMaterial({
        sizeAttenuation: false,
        size: Number(factorPlusSize.toFixed(1)),
        vertexColors: THREE.VertexColors,
        map: circle_sprite,
        transparent: true
      });
    }
    var particlesDuplic = new THREE.Points(geometry, pointsMaterial);
    var particles = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(particles);
  }
  // This is for the legend
  var temporal = 0;
  for (var j=0; j < points.length; j++){
    if(points[j].DimON != null) {
      temporal = temporal + 1;
      var labels_dim = [];
      var abbr_labels_dim = [];
      labels_dim = d3.range(minDim, maxDim+calcStepDim, calcStepDim);

      for (var i=0; i<7; i++){
        labels_dim[i] = labels_dim[i].toFixed(2);
        abbr_labels_dim[i] = abbreviateNumber(labels_dim[i]);
      }
      d3.select("#legend1").selectAll('*').remove();
      var svg = d3.select("#legend1");

      svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(10,15)");
        
      var legend = d3.legendColor()
        .labelFormat(d3.format(",.0f"))
        .cells(7)
        .labels([abbr_labels_dim[0],abbr_labels_dim[1],abbr_labels_dim[2],abbr_labels_dim[3],abbr_labels_dim[4],abbr_labels_dim[5],abbr_labels_dim[6]])
        .title(points[j].DimON)
        .scale(colorScale);

      svg.select(".legendLinear")
        .call(legend);
      break;
    } 
  }
  for (var j=0; j < points.length; j++){
    if(temporal == 0 && points[j].DimON == null){
      if (ColSizeSelector == "color"){
        d3.select("#legend1").selectAll('*').remove();
        var svg = d3.select("#legend1");
    
        svg.append("g")
          .attr("class", "legendLinear")
          .attr("transform", "translate(10,15)");
    
        var legend = d3.legendColor()
          .labelFormat(d3.format(",.0f"))
          .cells(9)
          .labels([abbr_labels_beta[0],abbr_labels_beta[1],abbr_labels_beta[2],abbr_labels_beta[3],abbr_labels_beta[4],abbr_labels_beta[5],abbr_labels_beta[6],abbr_labels_beta[7],abbr_labels_beta[8]])
          .title("Density")
          .scale(colorScale);
    
        svg.select(".legendLinear")
          .call(legend);
        break;
     } else {
      var max = (d3.max(points,function(d){ return d.cost; }));
      var costLimiter = document.getElementById("param-costlim").value;
          
    points = points.sort(function(a, b) { // Sort them according to importance (darker color!)
      return a.cost - b.cost;
    })
    var temp = parseInt((1-costLimiter)*points.length);
    var min = points[temp].cost;
    for (var i=temp+1; i<points.length; i++){
      if (min > points[i].cost){
        min = points[i].cost;
      }
    }

      var maxSize2 = (d3.max(points,function(d){ return d.beta; }));
        
        d3.selectAll("#legend1 > *").remove();

        var calcStep = (max-min)/6;

                var colorScale = d3.scaleSequential()
              .domain([min, max])
              .interpolator(d => d3.interpolateMagma(1-d));
                      
        points = points.sort(function(a, b) { // Sort them according to importance (darker color!)
          return a.cost - b.cost;
        })
  
        var labels_cost = [];
        var abbr_labels_cost = [];
        labels_cost = d3.range(min, max+calcStep, calcStep);
        for (var i=0; i<7; i++){
          labels_cost[i] = labels_cost[i].toFixed(4);
          abbr_labels_cost[i] = Math.abs(abbreviateNumber(labels_cost[i]));
        }
  
        var svg = d3.select("#legend1"); // Add the legend for the beta/cost
        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(10,15)");
  
        var legend = d3.legendColor()
          .labelFormat(d3.format(",.5f"))
          .cells(7)
          .labels([abbr_labels_cost[0],abbr_labels_cost[1],abbr_labels_cost[2],abbr_labels_cost[3],abbr_labels_cost[4],abbr_labels_cost[5],abbr_labels_cost[6]])
          .title("Remaining Cost")
          .scale(colorScale);
  
        svg.select(".legendLinear")
          .call(legend);
    }
  }
}

function zoomHandler(d3_transform) {
  let scale = d3_transform.k;
  let x = -(d3_transform.x - dimensions/2) / scale;
  let y = (d3_transform.y - dimensionsY/2) / scale;
  let z = getZFromScale(scale);
  camera.position.set(x, y, z);
}

function getScaleFromZ (camera_z_position) {
  let half_fov = fov/2;
  let half_fov_radians = toRadians(half_fov);
  let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
  let fov_height = half_fov_height * 2;
  let scale = dimensionsY / fov_height; // Divide visualization height by height derived from field of view
  return scale;
}

function getZFromScale(scale) {
  let half_fov = fov/2;
  let half_fov_radians = toRadians(half_fov);
  let scale_height = dimensionsY / scale;
  let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));
  return camera_z_position;
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

// Hover and tooltip interaction

raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 10;

view.on("mousemove", () => {
  let [mouseX, mouseY] = d3.mouse(view.node());
  let mouse_position = [mouseX, mouseY];
checkIntersects(mouse_position);
});

function mouseToThree(mouseX, mouseY) {
  return new THREE.Vector3(
    mouseX / dimensions * 2 - 1,
    -(mouseY / dimensionsY) * 2 + 1,
    1
  );
}

function checkIntersects(mouse_position) {
  let mouse_vector = mouseToThree(...mouse_position);
  raycaster.setFromCamera(mouse_vector, camera);
  let intersects = raycaster.intersectObject(particlesDuplic);
  if (intersects[0]) {
    if (ColSizeSelector == "color"){
      points = points.sort(function(a, b) {
      return a.beta - b.beta;
    })
    } else{
        points = points.sort(function(a, b) {
        return a.cost - b.cost;
      })
    }
    let sorted_intersects = sortIntersectsByDistanceToRay(intersects);
    let intersect = sorted_intersects[0];
    let index = intersect.index;
    let datum = points[index];
    highlightPoint(datum);
    showTooltip(mouse_position, datum);
  } else {
    removeHighlights();
    hideTooltip();
  }
}

function sortIntersectsByDistanceToRay(intersects) {
  return _.sortBy(intersects, "distanceToRay");
}

hoverContainer = new THREE.Object3D()
scene.add(hoverContainer);

function highlightPoint(datum) {
  removeHighlights();
  
  let geometry = new THREE.Geometry();

  geometry.vertices.push(
    new THREE.Vector3(
      (((datum.x/dimensions)*2) - 1)*dimensions,
      (((datum.y/dimensionsY)*2) - 1)*dimensionsY*-1,
      0
    )
  );

  if (all_labels[0] == undefined){
    var colorScaleCat = d3.scaleOrdinal().domain(["No Category"]).range(["#C0C0C0"]);
  }
  else{
    if(format[0] == "diabetes"){
      for (var i=0; i<all_labels.length; i++){
        if (all_labels[i] == "Positive"){
          all_labels[i] = 0;
        } else{
          all_labels[i] = 1;
        }
      }
    }
    var colorScaleCat = d3.scaleOrdinal().domain(all_labels).range(ColorsCategorical);

  }
  geometry.colors = [ new THREE.Color(colorScaleCat(datum[Category])) ];

  let material = new THREE.PointsMaterial({
    size: 35,
    sizeAttenuation: false,
    vertexColors: THREE.VertexColors,
    map: circle_sprite,
    transparent: true
  });
  
  let point = new THREE.Points(geometry, material);
  hoverContainer.add(point);
}

function removeHighlights() {
  hoverContainer.remove(...hoverContainer.children);
}

view.on("mouseleave", () => {
  removeHighlights()
});

  // Initial tooltip state
  let tooltip_state = { display: "none" }
  let tooltip_dimensions;
  let tooltip_template = document.createRange().createContextualFragment(`<div id="tooltip" style="display: none; z-index: 2; position: absolute; pointer-events: none; font-size: 13px; width: 240px; text-align: center; line-height: 1; padding: 6px; background: white; font-family: sans-serif;">
    <div id="point_tip" style="padding: 4px; margin-bottom: 4px;"></div>
    <div id="group_tip" style="padding: 4px;"></div>
  </div>`);
  document.body.append(tooltip_template);

  let $tooltip = document.querySelector('#tooltip');
  let $point_tip = document.querySelector('#point_tip');
  let $group_tip = document.querySelector('#group_tip');

  function updateTooltip() {
    if (all_labels[0] == undefined){
      var colorScaleCat = d3.scaleOrdinal().domain(["No Category"]).range(["#C0C0C0"]);
    }
    else{
      var colorScaleCat = d3.scaleOrdinal().domain(all_labels).range(ColorsCategorical);
    }
    $tooltip.style.display = tooltip_state.display;
    $tooltip.style.left = tooltip_state.left + 'px';
    $tooltip.style.top = tooltip_state.top + 'px';
    $point_tip.innerText = tooltip_state[Category];
    $point_tip.style.background = colorScaleCat(tooltip_state.color);
    var tooltipComb = [];
    tooltipComb = "Data set's dimensions: " + "\n";
    if (tooltip_dimensions){
      for (var i=0; i<tooltip_dimensions[0].length; i++){
        if (tooltip_dimensions[0][i][0] == Category){
    
        } else{
          tooltipComb = tooltipComb + tooltip_dimensions[0][i];
          tooltipComb = tooltipComb + "\n";
        }
      }
    } else{
      tooltipComb = "-";
    }
    $group_tip.innerText = tooltipComb;
  }    

  function showTooltip(mouse_position, datum) {
    let tooltip_width = 240;
    let x_offset = tooltip_width + tooltip_width;
    let y_offset = 30;
    tooltip_state.display = "block";
    tooltip_state.left = mouse_position[0] + x_offset;
    tooltip_state.top = mouse_position[1] + y_offset;
    if (all_labels[0] == undefined){
      tooltip_state[Category] = "Point ID: " + datum.id;
      tooltip_state.color = datum.id;
    } else{
      if (format[0] == "diabetes"){
        if (datum[Category] == "1"){
          tooltip_state[Category] = "Positive" + "(Point ID: " + datum.id + ")";
        } else{
          tooltip_state[Category] = "Negative" + " (Point ID: " + datum.id + ")";
        }
      } else{
        tooltip_state[Category] = datum[Category] + " (Point ID: " + datum.id + ")";
      }
      tooltip_state.color = datum[Category];
    }
    tooltip_dimensions = [];
    for (var i=0; i < dataFeatures.length - 1; i++){
      if (datum.id == i){
          tooltip_dimensions.push(Object.entries(dataFeatures[i]));
      }
    }
    updateTooltip();
  }

  function hideTooltip() {
    tooltip_state.display = "none";
    updateTooltip();
  }
}
  
}

function LineBar() {
  // Get the checkbox
  var NBViewOptions = document.getElementById("param-NB-view").value; // Get the threshold value with which the user set's the boundaries of the schema investigation
  NBViewOptions = parseInt(NBViewOptions);
  // Get the output text

  var viewport = getViewport(); // Get the main viewport width height
  var vh = viewport[1] * 0.042;

  if (NBViewOptions == 1){
    var type = 'bar';
  } else if (NBViewOptions == 2){
    var type = 'differenceBR';
  } else if (NBViewOptions == 3){
    var type = 'line';
  } else {
    var type = 'difference';
  }
  var difference = [];
  for (var i=0; i<StoreInitialFindNearestTable.length; i++){
    difference.push(findNearestTable[i] - StoreInitialFindNearestTable[i]);
  }

  if (type == 'difference') {
    var trace = {
      x: kValuesLegend, 
      y: difference, 
      name: 'Delta(preservation)', 
      showlegend:  true,
      mode: 'lines',
      type: 'line',
      marker: {
        color: 'rgb(128,128,0)'
      }
    };
    var LimitXaxis = Number(maxKNN) + 1;
    data = [trace];
    layout = {
      barmode: 'group',autosize: false,
      width: dimensions*0.97,
      height: overallHeight/11.8,
      margin: {
        l: 50,
        r: 30,
        b: 30,
        t: 10,
        pad: 4
      },
      xaxis: {range: [0, LimitXaxis],
        title: 'Num. of neighbors',
        titlefont: {
          size: 12,
          color: 'black'
        }},
      yaxis: {
        title: '+/- Pres.',
        titlefont: {
          size: 12,
          color: 'black'
        }}};

  Plotly.newPlot('knnBarChart', data, layout, {displayModeBar:false}, {staticPlot: true});
  } else if (type == 'differenceBR') {
    var trace1 = {
      x: kValuesLegend, 
      y: difference, 
      name: 'Delta(preservation)', 
      showlegend:  true,
      mode: 'lines',
      type: 'line',
      marker: {
        color: 'rgb(128,128,0)'
      }
    };
    var trace2 = {
      x: kValuesLegend, 
      y: StoreInitialFindNearestTable, 
      name: 'Projection average', 
      type: 'bar',
      marker: {
        color: 'rgb(0,0,0)'
      }
    };
    var trace3 = {
      x: kValuesLegend, 
      y: findNearestTable, 
      name: 'Selected points', 
      type: 'bar',
      marker: {
        color: 'gray'
      }
    };
    var LimitXaxis = Number(maxKNN) + 1;
    data = [trace1, trace2, trace3];
    layout = {
      barmode: 'group',autosize: false,
      width: dimensions*0.97,
      height: overallHeight/11.8,
      margin: {
        l: 50,
        r: 30,
        b: 30,
        t: 10,
        pad: 4
      },
      xaxis: {range: [0, LimitXaxis],
        title: 'Num. of neighbors',
        titlefont: {
          size: 12,
          color: 'black'
        }},
      yaxis: {
        title: '+/- Pres.',
        titlefont: {
          size: 12,
          color: 'black'
        }}};

    Plotly.newPlot('knnBarChart', data, layout, {displayModeBar:false}, {staticPlot: true});
  } else {
    var trace1 = {
      x: kValuesLegend, 
      y: StoreInitialFindNearestTable, 
      name: 'Projection average', 
      mode: 'lines',
      type: type,
      marker: {
        color: 'rgb(0,0,0)'
      }
    };
    var trace2 = {
      x: kValuesLegend, 
      y: findNearestTable, 
      name: 'Selected points', 
      mode: 'lines',
      type: type,
      marker: {
        color: 'gray'
      }
    };
    var LimitXaxis = Number(maxKNN) + 1;
    data = [trace1, trace2];
    layout = {
      barmode: 'group',autosize: false,
      width: dimensions*0.97,
      height: overallHeight/11.8,
      margin: {
        l: 50,
        r: 30,
        b: 30,
        t: 10,
        pad: 4
      },
      xaxis: {range: [0, LimitXaxis],
        title: 'Num. of neighbors',
        titlefont: {
          size: 12,
          color: 'black'
        }},
      yaxis: {
        title: 'Pres., %',
        titlefont: {
          size: 12,
          color: 'black'
        }}};

  Plotly.newPlot('knnBarChart', data, layout, {displayModeBar:false}, {staticPlot: true});
  }
  $("#knnBarChartDetails").html("(Num. of Selected Points: "+howManyPoints+"/"+dataFeatures.length+")");
  // If the checkbox is checked, display the output text
}
 
  function getViewport() { // Return the width and height of the main visualization

    var viewPortWidth;
    var viewPortHeight;
  
    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
      viewPortWidth = window.innerWidth,
      viewPortHeight = window.innerHeight
    }
  
  // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
      viewPortWidth = document.documentElement.clientWidth,
      viewPortHeight = document.documentElement.clientHeight
    }
  
    // older versions of IE
    else {
      viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
      viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }
    
    return [viewPortWidth, viewPortHeight];

 }

 function download(contentP, fileName, contentType) {  // Download the file into the local disk.
  
  var a = document.createElement("a");
  var file = new Blob([contentP], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();

}

var measureSaves = 0; // Discrete id for each file

function SaveAnalysis(){ // Save the analysis into a .txt file 

  // Put their the points, the 2D points, and the parameters (plus the overall cost).
  measureSaves = measureSaves + 1;
  let dataset = document.getElementById("param-dataset").value;
  let perplexity = document.getElementById("param-perplexity-value").value;
  let learningRate = document.getElementById("param-learningrate-value").value;
  let IterValue = document.getElementById("param-maxiter-value").value;
  let parDist = 'euclideanDist';
  let parTrans = 'noTrans';
  let Parameters = [];
  if (dataset == "empty"){
    Parameters.push(new_file.name);
  } else{
    Parameters.push(dataset);
  }
  Parameters.push(perplexity);
  Parameters.push(learningRate);
  Parameters.push(IterValue);
  Parameters.push(parDist);
  Parameters.push(parTrans);
  AllData = [];
  if (cost[0] != undefined){
    if (!returnVal){ // Add here if you want to save more parameters from a previous execution.
      AllData = points.concat(points2d).concat(dist_list).concat(dist_list2d).concat(cost[0].toFixed(3)).concat(Parameters).concat(InitialFormDists).concat(InitialFormDists2D).concat(IterationsList).concat(ArrayWithCostsList);
    } else {
      AllData = points.concat(points2d).concat(cost[0].toFixed(3)).concat(Parameters).concat(IterationsList).concat(ArrayWithCostsList);
    }
  } else{
    if (!returnVal){
      AllData = points.concat(points2d).concat(dist_list).concat(dist_list2d).concat(overallCost).concat(Parameters).concat(InitialFormDists).concat(InitialFormDists2D).concat(IterationsList).concat(ArrayWithCostsList);
    } else {
      AllData = points.concat(points2d).concat(overallCost).concat(Parameters).concat(IterationsList).concat(ArrayWithCostsList);
    }
  }
  download(JSON.stringify(AllData),'Analysis'+measureSaves+'.txt', 'text/plain');

}