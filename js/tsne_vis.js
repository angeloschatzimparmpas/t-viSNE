// t-SNE Visualization and global variables

// This variable is used when a new file is upload by a user.
var new_file; 

// The basic variables in order to execute t-SNE (opt is perplexity and learning rate). 
var tsne; var opt; var step_counter; var max_counter; var runner; 

// These variables are initialized here in order to store the final dataset, the points, the cost, the cost for each iteration, the beta values, the positions, the 2D points positions,
// In addition, there is an array which keeps the initial information of the points (i.e., initial state), the data features (with the label of the category plus the id of the point), the data features without the category (only numbers).
var final_dataset; var points = []; var cost = []; var cost_each; var beta_all = []; var x_position = []; var y_position = []; var points2d = []; var ArrayContainsDataFeatures = []; var ArrayContainsDataFeaturesCleared = []; var InitialStatePoints = []; 

// The distances in the high dimensional space and in the 2D space. All the labels that were found in the selected data set.
var dists; var dists2d; var all_labels;

// These are the dimensions for the Overview view and the Main view
var dim = document.getElementById('tSNEcanvas').offsetWidth; var dimensions = document.getElementById('modtSNEcanvas').offsetWidth;

// Category = the name of the category if it exists. The user has to add an asterisk ("*") mark in order to let the program identify this feature as a label/category name. 
// ColorsCategorical = the categorical colors (maximum value = 10).
var Category; var ColorsCategorical; 

// Schema Investigation 
// svgClick = Click a left mouse click in order to add a point.
// prevRightClick = When right click is pressed prevent any other action. Lock the current schema.
// if flagForSchema is false then send a message to the user that he/she has to: "Please, draw a schema first!");
var svgClick; var prevRightClick; var flagForSchema = false; 

// Save the parameters for the current analysis, save the overallCost, and store in the "input" variable all the points and points2D.
var ParametersSet = []; var overallCost; var input; 

// This function is executed when the factory button is pressed in order to bring the visualization in the initial state.
function FactoryReset(){
  flagForSchema = false;
  d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
  d3.selectAll("#SvgAnnotator > *").remove();
  d3.select("#data").select("input").remove(); // Remove the selection field. 
  Arrayx = [];
  Arrayy = [];
  XYDistId = [];
  Arrayxy = [];
  DistanceDrawing1D = [];
  allTransformPoints = [];
  p;
  pFinal = [];
  paths;
  path;
  ArrayLimit = [];
  minimum;
  correlationResults = [];
  ArrayContainsDataFeaturesLimit = [];
  prevRightClick = false;
  for (var i=0; i < InitialStatePoints.length; i++){
    InitialStatePoints[i].selected = true;
    InitialStatePoints[i].starplot = false;
  }
  redraw(InitialStatePoints);

  d3.selectAll("#correlation > *").remove(); 
  d3.selectAll("#modtSNEcanvas_svg > *").remove();
  d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
  d3.selectAll("#SvgAnnotator > *").remove(); 
  d3.selectAll("#sheparheat > *").remove(); 
  d3.selectAll("#knnBarChart > *").remove(); 

  var oldcanvOver = document.getElementById('tSNEcanvas');
  var contxOver = oldcanvOver.getContext('experimental-webgl');
  contxOver.clear(contxOver.COLOR_BUFFER_BIT);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  d3.selectAll("#legend1 > *").remove();
  d3.selectAll("#legend3 > *").remove();
  d3.selectAll("#legend4 > *").remove();

  lassoEnable();

  Arrayx = [];
  Arrayy = [];
  XYDistId = [];
  Arrayxy = [];
  DistanceDrawing1D = [];
  allTransformPoints = [];
  p;
  pFinal = [];
  paths;
  path;
  ArrayLimit = [];
  minimum;
  correlationResults = [];
  ArrayContainsDataFeaturesLimit = [];

  document.getElementById("param-dataset").value = "iris.csv";
  document.getElementById('file-input').value = "";
  document.getElementById("ExecuteBut").innerHTML = "Execute new t-SNE analysis";
  
  $("#cost").html("");
  $("#datasetDetails").html("");
  $("#kNNDetails").html("");

  document.getElementById("param-perplexity-value").value = 30;
  document.getElementById("param-learningrate-value").value = 10;
  document.getElementById("param-maxiter-value").value = 500;
  document.getElementById("param-lim-value").value = 2;
  document.getElementById("param-corr-value").value = 150;
  document.getElementById("param-neighborHood").value = "color";
  document.getElementById('selectionLabel').innerHTML = 'Size';
  document.getElementById("param-distance").value = "euclideanDist";
  document.getElementById("param-transform").value = "noTrans";
  
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

// Parse the data set
var getData = function() {

        let format; 
        let value;

        if (typeof window.FileReader !== 'function') {
          alert("The file API isn't supported on this browser yet.");
        }
        
        input = document.getElementById("file-input");
        if (!input) {
          alert("Um, couldn't find the fileinput element.");
        } else if (!input.files) {
          alert("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!input.files[0]) {
          value = document.getElementById("param-dataset").value; // get the value of the data set
          format = document.getElementById("param-dataset").value.split("."); //get the format

          if (format[value.split(".").length-1] == "csv") {
            parseData("./data/"+value);
          }else{
            parseData(new_file, init);
          }
        }
        else {
        fetchVal(function(lines){
          AnalaysisResults = JSON.parse(lines); 
          length = (AnalaysisResults.length - 7) / 2;
          ParametersSet = AnalaysisResults.slice(length*2+1, length*2+7);
          value = document.getElementById("param-dataset").value = ParametersSet[0];
          format = document.getElementById("param-dataset").value.split("."); //get the actual format
          if (format[value.split(".").length-1] == "csv") {
            parseData("./data/"+value);
          }else{
            parseData(new_file, init);
          }
         
      });
      }
};

function parseData(url) {
    Papa.parse(url, { //for csv file!
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
                    if(typeof(value) !== 'number' || value === undefined || key === "Version"){ //add more limitations if needed!
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
        Papa.parse(url, { //for csv file!
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(data) {
              doStuff(data.data);
            }
          });
          function doStuff(results_all){
            init(results.data, results_all, results.meta.fields);
          }
        }
    });
}

function setContinue(){
  d3v3.select("#SvgAnnotator").style("z-index", 1);
}

var ringNotes = [];
var gAnnotationsAll = [];
var AnnotationsAll = [];
var draggable = [];

function setReset(){
  d3.selectAll("#correlation > *").remove(); 
  d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
  lassoEnable();
  flagForSchema = false;
  d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
  d3.selectAll("#SvgAnnotator > *").remove(); 
  Arrayx = [];
  Arrayy = [];
  XYDistId = [];
  Arrayxy = [];
  DistanceDrawing1D = [];
  allTransformPoints = [];
  p;
  pFinal = [];
  paths;
  path;
  ArrayLimit = [];
  minimum;
  correlationResults = [];
  ArrayContainsDataFeaturesLimit = [];
  prevRightClick = false;
  for (var i=0; i < InitialStatePoints.length; i++){
    InitialStatePoints[i].selected = true;
    InitialStatePoints[i].starplot = false;
  }
  redraw(InitialStatePoints);
}

function setReInitialize(){
  if (document.getElementById('selectionLabel').innerHTML == 'Size'){
    document.getElementById('selectionLabel').innerHTML = 'Color';
  } else{
    document.getElementById('selectionLabel').innerHTML = 'Size';
  }

  for (var i=0; i < InitialStatePoints.length; i++){
    InitialStatePoints[i].selected = true;
  }
  redraw(InitialStatePoints);
}

function setLayerProj(){
  d3.select("#modtSNEcanvas").style("z-index", 2);
  d3.select("#modtSNEcanvas_svg").style("z-index", 1);
  d3.select("#modtSNEcanvas_svg_Schema").style("z-index", 1);
}

function setLayerComp(){
  d3.select("#modtSNEcanvas_svg").style("z-index", 2);
  d3.select("#modtSNEcanvas_svg_Schema").style("z-index", 1);
  d3.select("#modtSNEcanvas").style("z-index", 1);
  if (points.length){
    lassoEnable();
  }
}

function setLayerSche(){
  d3.select("#modtSNEcanvas_svg_Schema").style("z-index", 2);
  d3.select("#modtSNEcanvas").style("z-index", 1);
  d3.select("#modtSNEcanvas_svg").style("z-index", 1);
  let c = 0;
  for (var i=0; i < points.length; i++){
    points[i].selected = true;
    if (points[i].starplot == true){
      c = c + 1;
      if (c == 1){
        alert("The starplot visualization will be lost!");
      }
      points[i].starplot = false;
    }
  }
  redraw(points);
  click();
}

function lassoEnable(){

  var interactionSvg = d3.select("#modtSNEcanvas_svg")
  .attr("width", dimensions)
  .attr("height", dimensions)
  .style('position', 'absolute')
  .style('top', 0)
  .style('left', 0);

  var lassoInstance = lasso()
    .on('end', handleLassoEnd)
    .on('start', handleLassoStart);

  interactionSvg.call(lassoInstance);  

}


function setAnnotator(){

  var viewport2 = getViewport();
  var vw2 = viewport2[0];
  var vh2 = viewport2[1];
  var textarea = document.getElementById("comment").value;

  var annotations = [
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

  var ringNote = d3v3.ringNote()
  .draggable(true);

  var svgAnnotator = d3v3.select("#SvgAnnotator")
  .attr("width", vw2 * 0.5)
  .attr("height", vh2 * 0.888)
  .style("z-index", 3);

  var gAnnotations = svgAnnotator.append("g")
  .attr("class", "annotations")
  .call(ringNote, annotations);

  // Styling individual annotations based on bound data
  gAnnotations.selectAll(".annotation circle")
  .classed("shaded", function(d) { return d.shaded; });


  ringNotes.push(ringNote);
  gAnnotationsAll.push(gAnnotations);
  AnnotationsAll.push(annotations);
  draggable.push(true);
}


  // Hide or show the controls
  d3.select("#controls")
  .on("change", function() {
    if(ringNotes[0]){
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
      alert("Cannot hide the annotators' controls because, currently, there are no annotations into the visual representation.")
    }
  });

    // Three.js render loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    var MainCanvas;
    var Child;
    var renderer;
    var fov = 21;
    var near = 10;
    var far = 7000;
    var camera;
    var scene;

    MainCanvas = document.getElementById('modtSNEcanvas');
    Child = document.getElementById('modtSNEDiv');


    // Add canvas
    renderer = new THREE.WebGLRenderer({ canvas: MainCanvas });
    renderer.setSize(dimensions, dimensions);
    Child.append(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Set up camera and scene
    camera = new THREE.PerspectiveCamera(
      fov,
      dimensions / dimensions,
      near,
      far 
    );
    animate();

    var Arrayx = [];
    var Arrayy = [];
    var XYDistId = [];
    var Arrayxy = [];
    var DistanceDrawing1D = [];
    var allTransformPoints = [];
    var p;
    var pFinal = [];
    var paths;
    var path;
    var ArrayLimit = [];
    var minimum;
    var correlationResults = [];
    var ArrayContainsDataFeaturesLimit = [];




// function that executes after data is successfully loaded
function init(data, results_all, fields) {

    d3.selectAll("#correlation > *").remove(); 
    d3.selectAll("#modtSNEcanvas_svg > *").remove();
    d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
    d3.selectAll("#SvgAnnotator > *").remove(); 
    d3.selectAll("#sheparheat > *").remove(); 
    d3.selectAll("#knnBarChart > *").remove(); 

    var oldcanvOver = document.getElementById('tSNEcanvas');
    var contxOver = oldcanvOver.getContext('experimental-webgl');
    contxOver.clear(contxOver.COLOR_BUFFER_BIT);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    d3.selectAll("#legend1 > *").remove();
    d3.selectAll("#legend3 > *").remove();
    d3.selectAll("#legend4 > *").remove();

    lassoEnable();

    Arrayx = [];
    Arrayy = [];
    XYDistId = [];
    Arrayxy = [];
    DistanceDrawing1D = [];
    allTransformPoints = [];
    p;
    pFinal = [];
    paths;
    path;
    ArrayLimit = [];
    minimum;
    correlationResults = [];
    ArrayContainsDataFeaturesLimit = [];

    prevRightClick = false;
    step_counter = 0;
    max_counter = document.getElementById("param-maxiter-value").value;
    opt = {};
    var fields;
    fields.push("beta");
    fields.push("cost");
    opt.epsilon = document.getElementById("param-learningrate-value").value; // epsilon is learning rate (10 = default)
    opt.perplexity = document.getElementById("param-perplexity-value").value; // roughly how many neighbors each point influences (30 = default)
    tsne = new tsnejs.tSNE(opt);
    final_dataset = data;
    dataFeatures = results_all;
    var object;

    all_labels = [];
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

    for (let k = 0; k < dataFeatures.length; k++){
      ArrayContainsDataFeatures.push(Object.values(dataFeatures[k]).concat(k));
      object = [];
      for (let j = 0; j < Object.keys(dataFeatures[k]).length; j++){
        if(typeof(Object.values(dataFeatures[k])[j]) == "number" && Object.keys(dataFeatures[k])[j] != Category){
          object.push(Object.values(dataFeatures[k])[j]);
        }
      }
      ArrayContainsDataFeaturesCleared.push(object);
    }
    
    var valCategExists = 0;
    for (var i=0; i<Object.keys(dataFeatures[0]).length; i++){
      if (Object.keys(dataFeatures[0])[i] == Category){
        valCategExists = valCategExists + 1;
      }
    }
    $("#datasetDetails").html("Number of Dimensions: " + (Object.keys(dataFeatures[0]).length - valCategExists) + ", Number of Samples: " + final_dataset.length);
    dists = computeDistances(data, document.getElementById("param-distance").value, document.getElementById("param-transform").value);
    tsne.initDataDist(dists);

    for(var i = 0; i < dataFeatures.length; i++) {
      if (dataFeatures[i][Category] != "" || dataFeatures[i][Category] != "undefined"){
        all_labels[i] = dataFeatures[i][Category];
      }
      else{
        all_labels[i];
      }
    }
    for(var i = 0; i < final_dataset.length; i++) {final_dataset[i].beta = tsne.beta[i]; beta_all[i] = tsne.beta[i];}

    if (typeof window.FileReader !== 'function') {
      alert("The file API isn't supported on this browser yet.");
    }
    
    input = document.getElementById("file-input");
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      AnalaysisResults = [];
      runner = setInterval(step, 0);
    }
    else {
      fetchVal(function(lines){
        AnalaysisResults = JSON.parse(lines); 
        updateEmbedding(AnalaysisResults);
    });
    }
}

// initialize distance matrix
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

// calculate euclidean distance
function euclideanDist(data) {
    dist = initDist(data);
    for(var i = 0; i < data.length; i++) {
      for(var j = i + 1; j < data.length; j++) {
        for(var d in data[0]) {
          if(d != "name") {
        dist[i][j] += Math.pow(data[i][d] - data[j][d], 2);
          }
        }
        dist[i][j] = Math.sqrt(dist[i][j]);
        dist[j][i] = dist[i][j];
      }
    }
    return dist;
}

// calculate jaccard dist
function jaccardDist(data) {
    dist = initDist(data);
    for(var i = 0; i < data.length; i++) {
  for(var j = i + 1; j < data.length; j++) {
            for(var d in data[0]) {
    if(d != "name") {
        x = data[i][d];
        y = data[j][d];
        if(x == y) {
      dist[i][j] += 1;
        }
    }
            }
            dist[j][i] = dist[i][j];
  }
    }
    return dist;
}

// normalize distances to prevent numerical issues
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

function noTrans(data) {
    return data;
}

// Log transform
function logTrans(data) {
    for(var i = 0; i < data.length; i++) {
        for(var d in data[0]) {
      if(d != "name") {
    X = data[i][d];
    data[i][d] = Math.log10(X + 1);
      }
  }
    }
    return data;
}

// asinh transform
function asinhTrans(data) {
    for(var i = 0; i < data.length; i++) {
        for(var d in data[0]) {
       if(d != "name") {
    X = data[i][d];
    data[i][d] = Math.log(X + Math.sqrt(X * X + 1));
      }
  }
    }
    return data;
}
// binarize
function binTrans(data) {
    for(var i = 0; i < data.length; i++) {
        for(var d in data[0]) {
      if(d != "name") {
    X = data[i][d];
    if(X > 0) data[i][d] = 1;
    if(X < 0) data[i][d] = 0;
      }
  }
    }
    return data;
}

function computeDistances(data, distFunc, transFunc) {
    dist = eval(distFunc)(eval(transFunc)(data));
    dist = normDist(data, dist);
    return dist;
}

// function that updates embedding
function updateEmbedding(AnalaysisResults) {
  if (AnalaysisResults == ""){
    var Y = tsne.getSolution(); // here we get the solution from the actual t-sne 
    var xExt = d3.extent(Y, d => d[0]);
    var yExt = d3.extent(Y, d => d[1]);
    var maxExt = [Math.min(xExt[0], yExt[0]), Math.max(xExt[1], yExt[1])];

    var x = d3.scaleLinear()
            .domain(maxExt)
            .range([10, +dimensions-10]);

    var y = d3.scaleLinear()
            .domain(maxExt)
            .range([10, +dimensions-10]);
      for(var i = 0; i < final_dataset.length; i++) {

        x_position[i] = x(Y[i][0]);
        y_position[i] = y(Y[i][1]);
            points[i] = {id: i, x: x_position[i], y: y_position[i], beta: final_dataset[i].beta, cost: final_dataset[i].cost, selected: true, DimON: null, starplot: false};
            points2d[i] = {id: i, x: x_position[i], y: y_position[i], selected: true};
            points[i] = extend(points[i], ArrayContainsDataFeaturesCleared[i]);
            points[i] = extend(points[i], dataFeatures[i]);
        }
    } else{
      points = AnalaysisResults.slice(0,dataFeatures.length);
      points2d = AnalaysisResults.slice(dataFeatures.length,2*dataFeatures.length);
      overallCost = AnalaysisResults.slice(dataFeatures.length*2,dataFeatures.length*2+1);
      ParametersSet = AnalaysisResults.slice(dataFeatures.length*2+1, dataFeatures.length*2+7);
      $("#cost").html("Number of Iteration: " + ParametersSet[3] + ", Overall Cost: " + overallCost);
      $('#param-perplexity-value').text(ParametersSet[1]);
      $('#param-learningrate-value').text(ParametersSet[2]);
      $('#param-maxiter-value').text(ParametersSet[3]);
      document.getElementById("param-distance").value = ParametersSet[4];
      document.getElementById("param-transform").value = ParametersSet[5];
    }
    InitialStatePoints = points;
    function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
      return obj;
    }
        ShepardHeatMap();
        OverviewtSNE(points);
        BetatSNE(points);
}

function ShepardHeatMap () {
  d3.selectAll("#sheparheat > *").remove();
  var margin = { top: 35, right: 15, bottom: 15, left: 35 },
  dim2 = Math.min(parseInt(d3.select("#sheparheat").style("width")), parseInt(d3.select("#sheparheat").style("height")))
  width = dim2- margin.left - margin.right,
  height = dim2 - margin.top - margin.bottom,
  buckets = 10,
  gridSize = width / buckets,
  dim_1 = ["0.0", "0.2", "0.4", "0.6", "0.8", "1.0"],
  dim_2 = ["0.0", "0.4", "0.6", "1.0"]

  // Create the svg canvas
      var svg = d3.select("#sheparheat")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
dists2d = computeDistances(points2d, document.getElementById("param-distance").value, document.getElementById("param-transform").value);

var dist_list2d = [];
var dist_list = [];
  for (var j=0; j<dists2d.length; j++){
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
dist_list2d = dist_list2d.sort();
dist_list = dist_list.sort();
dist_list2d = dist_list2d.filter(function(val){ return val!==undefined; });
dist_list = dist_list.filter(function(val){ return val!==undefined; });
d3.tsv("./modules/heat.tsv").then(function(data) {

  data.forEach(function(d) {
      d.dim1 = +d.dim1;
      d.dim2 = +d.dim2;
      d.value = 0;
  });

  var counter = 0;
  var counnum = [];
  var temp_loop = 0;
  for (var l=0; l<100; l++) {counnum[l] = 0};
  var dist_list_all = [];
  dist_list_all =[dist_list, dist_list2d];
  for (var l=0; l<100; l++){
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
    data[m].value = counnum[m];
  }

  var maxNum = Math.round(d3.max(data,function(d){ return d.value; }));
  var minNum = Math.round(d3.min(data,function(d){ return d.value; }));
  var colors = ['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000'];
  let calcStep = (maxNum-minNum)/colors.length;
  var colorScale = d3.scaleLinear()
      .domain(d3.range(0, maxNum+calcStep,calcStep))
      .range(colors);
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .style("visibility","visible")
              .offset([-10, 36.5])
              .html(function(d) {
                return "Value:  <span style='color:red'>" + Math.round(d.value);
              });

  tip(svg.append("g"));

  var dim1Labels = svg.selectAll(".dim1Label")
      .data(dim_1)
      .enter().append("text")
        .text(function (d) { return d; })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize * 2; })
        .style("text-anchor", "end")
        .style("font-size", "10px")
        .attr("transform", "translate(-6," + gridSize / 4 + ")")
        .attr("class","mono");

  var title = svg.append("text")
                  .attr("class", "mono")
                  .attr("x", -(gridSize * 7))
                  .attr("y", -26)
                  .style("font-size", "12px")
                  .attr("transform", "rotate(-90)")
                  .attr("class","mono")
                  .text("Input Distance");


  var title = svg.append("text")
                  .attr("class", "mono")
                  .attr("x", gridSize * 3 )
                  .attr("y", -26)
                  .style("font-size", "12px")
                  .text("Output Distance");

  var dim2Labels = svg.selectAll(".dim2Label")
      .data(dim_2)
      .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize * 3.2; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("transform", "translate(" + gridSize / 4 + ", -6)")
        .attr("class","mono");

  var heatMap = svg.selectAll(".dim2")
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

  var heatleg = d3.select("#legend4");

  heatleg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(0,14)");

  var legend = d3.legendColor()
    .labelFormat(d3.format(",.0f"))
    .cells(9)
    .title("Number of Points")
    .scale(colorScale);

  heatleg.select(".legendLinear")
    .call(legend);
      });
}

// perform single t-SNE iteration
function step() {
      step_counter++;
      if(step_counter <= max_counter) {
          cost = tsne.step();
          cost_each = cost[1];
          for(var i = 0; i < final_dataset.length; i++) final_dataset[i].cost = cost_each[i];
          $("#cost").html("Number of Iteration: " + tsne.iter + ", Overall Cost: " + cost[0].toFixed(3));
        }
        else {
            clearInterval(runner);
        }
        if (step_counter == max_counter){
          updateEmbedding(AnalaysisResults);
        }
}

function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {

    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}

function OverviewtSNE(points){
   
  var canvas = document.getElementById('tSNEcanvas');
  gl = canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  ColorsCategorical = ['#a6cee3','#fb9a99','#b2df8a','#33a02c','#1f78b4','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

  if (all_labels[0] == undefined){
    var colorScale = d3.scaleOrdinal().domain(["No Category"]).range(["#C0C0C0"]);
  }
  else{
    var colorScale = d3.scaleOrdinal().domain(all_labels).range(ColorsCategorical);
  }
    d3.select("#legend3").select("svg").remove();
    var svg = d3.select("#legend3").append("svg");

    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(8,5)");

    var legendOrdinal = d3.legendColor()
      .shape("path", d3.legendSize(100))
      .shapePadding(15)
      .scale(colorScale);

    svg.select(".legendOrdinal")
      .call(legendOrdinal);

  let vertices = [];
  let colors = [];

  for (var i=0; i<points.length; i++){
    let singleObj = {};
    // convert the position from pixels to 0.0 to 1.0
   let zeroToOne = points[i].x / dimensions;
   let zeroToOne2 = points[i].y / dimensions;

   // convert from 0->1 to 0->2
   let zeroToTwo = zeroToOne * 2.0;
   let zeroToTwo2 = zeroToOne2 * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   let clipSpace = zeroToTwo - 1.0;
   let clipSpace2 = zeroToTwo2 - 1.0;
    singleObj = clipSpace;
    vertices.push(singleObj);
    singleObj = clipSpace2 * -1;
    vertices.push(singleObj);
    singleObj = 0.0;
    vertices.push(singleObj);
  }
  for (var i=0; i<points.length; i++){
    let singleCol = {};
    if (points[i].selected == false){
      let colval = d3.rgb(211,211,211);
      singleCol = colval.r/255;
      colors.push(singleCol);
      singleCol = colval.g/255;
      colors.push(singleCol);
      singleCol = colval.b/255;
      colors.push(singleCol);
    }else{
      let colval = d3.rgb(colorScale(points[i][Category]));
      singleCol = colval.r/255;
      colors.push(singleCol);
      singleCol = colval.g/255;
      colors.push(singleCol);
      singleCol = colval.b/255;
      colors.push(singleCol);
    }
  }
  // Create an empty buffer object and store vertex data
  var vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Create an empty buffer object and store color data
  var color_buffer = gl.createBuffer ();
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // vertex shader source code
  var vertCode = 'attribute vec3 coordinates;'+
    'attribute vec3 color;'+
    'varying vec3 vColor;'+
    'void main(void) {' +
       ' gl_Position = vec4(coordinates, 1.0);' +
       'vColor = color;'+
       'gl_PointSize = 3.5;'+
    '}';

  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

    var fragCode = `
    #ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
    #endif

    precision mediump float;
    varying  vec3 vColor;

    void main()
    {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
    #ifdef GL_OES_standard_derivatives
        delta = fwidth(r);
        alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
    #endif

    gl_FragColor = vec4(vColor, alpha);
    }`;
    gl.getExtension('OES_standard_derivatives');
  // Create fragment shader object
  var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

  // Attach fragment shader source code
  gl.shaderSource(fragShader, fragCode);

  // Compile the fragmentt shader
  gl.compileShader(fragShader);

  // Create a shader program object to
  // store the combined shader program
  var shaderProgram = gl.createProgram();

  // Attach a vertex shader
  gl.attachShader(shaderProgram, vertShader);

  // Attach a fragment shader
  gl.attachShader(shaderProgram, fragShader);

  // Link both the programs
  gl.linkProgram(shaderProgram);

  // Use the combined shader program object
  gl.useProgram(shaderProgram);



  // Bind vertex buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

  // Get the attribute location
  var coord = gl.getAttribLocation(shaderProgram, "coordinates");

  // point an attribute to the currently bound VBO
  gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);

  // Enable the attribute
  gl.enableVertexAttribArray(coord);

  // bind the color buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);

  // get the attribute location
  var color = gl.getAttribLocation(shaderProgram, "color");

  // point attribute to the volor buffer object
  gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;

  // enable the color attribute
  gl.enableVertexAttribArray(color);


  // Clear the canvas
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // Enable the depth test
  gl.disable(gl.DEPTH_TEST);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  resize(gl.canvas);

   gl.viewport(0, 0, dim, dim);

  //Draw the triangle
  gl.drawArrays(gl.POINTS, 0, points.length);

}

function redraw(repoints){
 // OverviewtSNE(repoints);
  BetatSNE(repoints);
}

function handleLassoEnd(lassoPolygon) {
  var countLassoFalse = 0;
      for (var i = 0 ; i < points.length ; i ++) {

        x = points[i].x;
        y = points[i].y;
        if (d3.polygonContains(lassoPolygon, [x, y])){
            points[i].selected = true;
            points2d[i].selected = true;
        } else{
          countLassoFalse = countLassoFalse + 1;
          points[i].selected = false;
          points2d[i].selected = true;
        }
    }
    if (countLassoFalse == points.length){
      for (var i = 0 ; i < points.length ; i ++) {
        points[i].selected = true;
        points2d[i].selected = true;
      }
    }
    if (points.length - countLassoFalse <= 10 && points.length - countLassoFalse != 0){
      for (var i = 0 ; i < points.length ; i ++) {
        if (points[i].selected == true){
          points[i].starplot = true;
        }
      }
    } else{
      for (var i = 0 ; i < points.length ; i ++) {
        points[i].starplot = false;
      }
    }
    redraw(points);
 
}

// reset selected points when starting a new polygon
function handleLassoStart(lassoPolygon) {

    for (var i = 0 ; i < points.length ; i ++) {
      points[i].selected = true;
      points[i].starplot = false;
      points2d[i].selected = true;
    }

  redraw(points);
}


var svg,
    defs,
    gBrush,
    brush,
    main_xScale,
    mini_xScale,
    main_yScale,
    mini_yScale,
    main_xAxis,
    main_yAxis,
    mini_width,
    textScale;

            //Added only for the mouse wheel
            var zoomer = d3v3.behavior.zoom()
            .on("zoom", null);

         var main_margin = {top: 8, right: 10, bottom: 30, left: 100},
             main_width = 500 - main_margin.left - main_margin.right,
             main_height = 320 - main_margin.top - main_margin.bottom;
     
         var mini_margin = {top: 8, right: 10, bottom: 30, left: 10},
             mini_height = 320 - mini_margin.top - mini_margin.bottom;
             mini_width = 100 - mini_margin.left - mini_margin.right;
     
         svg = d3v3.select("#correlation").attr("class", "svgWrapper")
             .attr("width", main_width + main_margin.left + main_margin.right + mini_width + mini_margin.left + mini_margin.right)
             .attr("height", main_height + main_margin.top + main_margin.bottom)
             .call(zoomer)
             .on("wheel.zoom", scroll)
             .on("mousedown.zoom", null)
             .on("touchstart.zoom", null)
             .on("touchmove.zoom", null)
             .on("touchend.zoom", null);

function click(){
  
    svgClick = d3.select('#modtSNEcanvas_svg_Schema');

    function drawCircle(x, y, size) {
      svgClick.append("circle")
            .attr('class', 'click-circle')
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size); 
        Arrayx.push(x);
        Arrayy.push(y); 
    }
    svgClick.on('click', function() {
      if (prevRightClick == false){
        var coords = d3.mouse(this);
        drawCircle(coords[0], coords[1], 3);
      }
      for (var k = 0; k < Arrayx.length ; k++){
        Arrayxy[k] = [Arrayx[k], Arrayy[k]];
      }

      for (var k = 0; k < Arrayxy.length - 1 ; k++){
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

            if (prevRightClick == true){

            } else {

              var line = d3.line().curve(d3.curveCardinal);

              for (var k = 0; k < Arrayxy.length - 1; k++){
                path = svgClick.append("path")
                .datum(Arrayxy.slice(k, k+2))
                .attr("class", "SchemaCheck")
                .attr("d", line);
              }
              // Prevent the default mouse action. Allow right click to be used for the confirmation of our schema.
              d3.event.preventDefault();

              flagForSchema = true;
              CalculateCorrel();
            }
      });
}

function CalculateCorrel(){

  if (flagForSchema == false){
    alert("Please, draw a schema first!");
  } else{
  var correlLimit = document.getElementById("param-corr-value").value;
  correlLimit = parseInt(correlLimit);

    allTransformPoints = [];
    for (var loop = 0; loop < points.length ; loop++){
        allTransformPoints[loop] = [points[loop].x, points[loop].y, points[loop].id, points[loop].beta, points[loop].cost, points[loop].selected];
    }

    var line = svgClick.append("line");

    paths = svgClick.selectAll("path").filter(".SchemaCheck");
    XYDistId = [];
    if (paths.nodes().length == 0){
      alert("Please, provide one more point in order to create a line (i.e., path)!")
    } else{
      for (var m = 0; m < paths.nodes().length; m++) {
      for (var j = 0; j < allTransformPoints.length; j++){
        p = closestPoint(paths.nodes()[m], allTransformPoints[j]);
        XYDistId.push(p);
      }
    }

      for (var j = 0; j < allTransformPoints.length; j++){
        for (var m = 0; m < paths.nodes().length; m++) {
        if (m == 0){
          minimum = XYDistId[j].distance;
        }
        else if (minimum > XYDistId[(m * allTransformPoints.length) + j].distance) {
          minimum = XYDistId[(m * allTransformPoints.length) + j].distance;
        }
      }

      for (var l = 0; l < paths.nodes().length ; l++) {
        if (XYDistId[(l * allTransformPoints.length) + j].distance == minimum){
          allTransformPoints[j].bucketID = l;
        }
      }
    }

    var arrays = [], size = allTransformPoints.length;
    while (XYDistId.length > 0) {
        arrays.push(XYDistId.splice(0, size));
    }

    var arraysCleared = [];
    for (var j = 0; j < allTransformPoints.length; j++){
      for (var m=0; m < arrays.length; m++) {
        if (allTransformPoints[j].bucketID == m){
          arraysCleared.push(arrays[m][j].concat(allTransformPoints[j].bucketID, Arrayxy[m], arrays[m][j].distance, arrays[m][j].id));
        }
      }
    }

    ArrayLimit = [];
    for (var i=0; i<arraysCleared.length; i++) {
      if (arraysCleared[i][arraysCleared[0].length-2] < correlLimit) {
        ArrayLimit.push(arraysCleared[i]);
      }
    }

    var temparray = [];
    var count = new Array(paths.nodes().length).fill(0);
    for (var m=0; m < paths.nodes().length; m++) {
      for (var i=0; i<ArrayLimit.length; i++) {
        if (ArrayLimit[i][ArrayLimit[0].length-5] == m){
            count[m] = count[m] + 1;
          temparray.push(ArrayLimit[i]);
        }
        // do whatever
      }
    }
    var arraysSplitted = [];
      for (var m=0; m < paths.nodes().length; m++) {
            arraysSplitted.push(temparray.splice(0, count[m]));
    }



    for (var m=0; m < paths.nodes().length; m++) {
      arraysSplitted[m] = arraysSplitted[m].sort(function(a, b){
              var dist = (a[0]-a[3]) * (a[0]-a[3]) + (a[1]-a[4]) * (a[1]-a[4]);
              var distAgain = (b[0]-b[3]) * (b[0]-b[3]) + (b[1]-b[4]) * (b[1]-b[4]);
              // Compare the 2 dates
              if(dist < distAgain) return -1;
              if(distAgain > dist) return 1;
              return 0;
      });
    }

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
      Order.push(arraysConnected[temp][arraysConnected[0].length-1]);
    }

    for (var i = 0; i < points.length; i++){
      points[i].selected = false;
      for (var j = 0; j < ArrayLimit.length; j++){
        if (ArrayLimit[j][ArrayLimit[0].length-1] == points[i].id){
          points[i].selected = true;
        }
      }
    }
    redraw(points);
    for (let k = 0; k < dataFeatures.length; k++){
      ArrayContainsDataFeaturesCleared.push(ArrayContainsDataFeaturesCleared[k].concat(k));
    }

    ArrayContainsDataFeaturesCleared = mapOrder(ArrayContainsDataFeaturesCleared, Order, arraysConnected[0].length-2);

    ArrayContainsDataFeaturesLimit = [];
    for (var i = 0; i < ArrayContainsDataFeaturesCleared.length; i++){
      for (var j = 0; j < arraysConnected.length; j++){
        if (ArrayContainsDataFeaturesCleared[i][ArrayContainsDataFeaturesCleared[0].length-1] == arraysConnected[j][arraysConnected[0].length-1]){
          ArrayContainsDataFeaturesLimit.push(ArrayContainsDataFeaturesCleared[i]);
        } 
      }
    }
   
    if (ArrayContainsDataFeaturesLimit.length == 0){
      d3.selectAll("#correlation > *").remove(); 
      d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
      flagForSchema = false;
      d3.selectAll("#modtSNEcanvas_svg_Schema > *").remove(); 
      Arrayx = [];
      Arrayy = [];
      XYDistId = [];
      Arrayxy = [];
      DistanceDrawing1D = [];
      allTransformPoints = [];
      p;
      pFinal = [];
      paths;
      path;
      ArrayLimit = [];
      minimum;
      correlationResults = [];
      ArrayContainsDataFeaturesLimit = [];
      prevRightClick = false;
      for (var i=0; i < InitialStatePoints.length; i++){
        InitialStatePoints[i].selected = true;
        InitialStatePoints[i].starplot = false;
      }
      alert("No points selected! Please, try to increase the correlation threshold.");
      redraw(InitialStatePoints);
    } else {
      for (var loop = 0; loop < ArrayContainsDataFeaturesLimit.length; loop++) {
        ArrayContainsDataFeaturesLimit[loop].push(loop);
      }
  
      var SignStore = [];
      correlationResults = [];
      const arrayColumn = (arr, n) => arr.map(x => x[n]);
      for (var temp = 0; temp < ArrayContainsDataFeaturesLimit[0].length - 2; temp++) {
        var tempData = new Array(
          arrayColumn(ArrayContainsDataFeaturesLimit, temp),
          arrayColumn(ArrayContainsDataFeaturesLimit, ArrayContainsDataFeaturesLimit[0].length - 1)
        );
        if (isNaN(pearsonCorrelation(tempData, 0, 1))) {
        } else{
          SignStore.push([temp, pearsonCorrelation(tempData, 0, 1)]);
          correlationResults.push([Object.keys(dataFeatures[0])[temp] + " (" + temp + ")", Math.abs(pearsonCorrelation(tempData, 0, 1))]);
        }
      }
      correlationResults = correlationResults.sort(
        function(a,b) {
        if (a[1] == b[1])
        return a[0] < b[0] ? -1 : 1;
        return a[1] < b[1] ? 1 : -1;
        }
      );
  
      for (var j = 0; j < correlationResults.length; j++) {
        for (var i = 0; i < SignStore.length; i++) {
          if (SignStore[i][1]*(-1) == correlationResults[j][1]) {
            correlationResults[j][1] = parseInt(correlationResults[j][1] * 100) * (-1);
            correlationResults[j].push(j);
          }
          if (SignStore[i][1] == correlationResults[j][1]) {
            correlationResults[j][1] = parseInt(correlationResults[j][1] * 100);
            correlationResults[j].push(j);
          }
        }
      }
    }
    drawBarChart();
    }
  }
}

function drawBarChart(){
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
          .attr("class","mainGroup")

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
      main_xScale.domain([-100, 100]);
      mini_xScale.domain([-100, 100]);     
      main_yScale.domain(correlationResults.map(function(d) { return d[0]; }));
      mini_yScale.domain(correlationResults.map(function(d) { return d[0]; }));
      
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
      var brushExtent = parseInt(Math.max( 1, Math.min( 20, Math.round(correlationResults.length * 0.75) ) ));

      brush = d3v3.svg.brush()
        .y(mini_yScale)
        .extent([mini_yScale(correlationResults[0][0]), mini_yScale(correlationResults[brushExtent][0])])
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
        .data(correlationResults, function(d) { return +d[2]; });

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
      .data(correlationResults, function(d) { return +d[2]; })
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
    .on("mouseout", function(d){ 
      points.forEach(function (p) {
        p.DimON = null
      })
      BetatSNE(points);
      svg.select('.tooltip').style('display', 'none'); 
    })
    .on("mousemove", function(d) {
      points.forEach(function (p) {
        if (p.selected == true) {
          p.DimON = d[0];
        }
      })
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
  main_yScale.domain(correlationResults.map(function(d) { return d[0]; }));
  main_yScale.rangeBands( [ main_yZoom(originalRange[0]), main_yZoom(originalRange[1]) ], 0.4, 0);

  //Update the y axis of the big chart
  d3v3.select(".mainGroup")
    .select(".y.axis")
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

  var colorsBarChart = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061'];

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

function mapOrder(array, order, key) {
  
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



// Points are represented as objects with x and y attributes.



 /* var svg = d3.select('#modtSNEcanvas_svgClick').append('svg')
    .attr('width', width)
    .attr('height', height)
    .on('mousemove', function() {
      x = d3.event.pageX;
      y = d3.event.pageY;
    });


  var interactionSvgClick = d3.select("#modtSNEcanvas_svgClick").append("circle")
        .attr("transform", "translate(" + x + "," + y + ")")
        .attr("r", "3")
        .attr("class", "dot")
        .style('position', 'absolute')
        .style("cursor", "pointer");*/
      //.call(drag);
}
/*
// Define drag behavior
var drag = d3.drag()
    .on("drag", dragmove);

function dragmove(d) {
  var x = d3.event.x;
  var y = d3.event.y;
  d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
}
*/

function abbreviateNumber(value) {
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

function clearThree(obj){
  while(obj.children.length > 0){ 
    clearThree(obj.children[0])
    obj.remove(obj.children[0]);
  }
  if(obj.geometry) obj.geometry.dispose()
  if(obj.material) obj.material.dispose()
  if(obj.texture) obj.texture.dispose()
}   


var viewport3 = getViewport();
var vw3 = viewport3[0] * 0.2;
var margin = {top: 40, right: 100, bottom: 40, left: 190},
width = Math.min(vw3, window.innerWidth - 10) - margin.left - margin.right,
height = Math.min(width, window.innerHeight - margin.top - margin.bottom);

  var wrapData = [];

  ////////////////////////////////////////////////////////////// 
  //////////////////// Draw the Chart ////////////////////////// 
  ////////////////////////////////////////////////////////////// 

    
  var radarChartOptions = {
    w: width,
    h: height,
    margin: margin,
    maxValue: 100,
    roundStrokes: true
  };
  var colors;
  var IDS = [];
  //Call function to draw the Radar chart
  RadarChart("#starPlot", wrapData, colors, IDS, radarChartOptions);

function BetatSNE(points){

if (points.length) {
    selectedPoints = [];
    var findNearestTable = [];
    for (let m=0; m<points.length; m++){
    if (points[m].selected == true){
        selectedPoints.push(points[m]);
    }
    }

    if (selectedPoints.length != 0){
      var distsFull = dists;
      var dists2dFull = dists2d;

      for (var i=0; i<dists.length; i++){
        for (var j=0; j<dists.length; j++){
          if(dists[i][j] != null) {
            distsFull[j][i] = dists[i][j];
            dists2dFull[j][i] = dists2d[i][j];
          }
        }
      }

      var indexOrder = [];
      var indexOrder2d = [];
      var indices = new Array(selectedPoints.length);
      var indices2d = new Array(selectedPoints.length);

      var findNearest;
      var counter1;
      var counter2;

      var temp = [];
      var temp2 = [];

      var viewport = getViewport();
      var vw = viewport[0] * 0.5;
      var vh = viewport[1] * 0.042;
      var factor = Math.log10(points.length) * 4;
      if (factor == 0){
        factor = 1;
      }
      var maxKNN = Math.ceil(points.length / factor);

      selectedPoints.sort(function(a, b) {
        return parseFloat(a.id) - parseFloat(b.id);
      });
    
      $("#kNNDetails").html("Purity of the cluster was checked for k values starting from " + (1) + " to " + maxKNN + ".");

      for (k=maxKNN; k>1; k--){

        findNearest = 0;
        var indexOrderSliced = [];
        var indexOrderSliced2d = [];
        var count1 = new Array(selectedPoints.length).fill(0);
        var count2 = new Array(selectedPoints.length).fill(0);
        counter1 = 0;
        counter2 = 0;

        for (var i=0; i<selectedPoints.length; i++){

          temp[i] = 0;
          temp2[i] = 0;

          if (k == maxKNN){

              // temporary array holds objects with position and sort-value
              indices[i] = dists[i].map(function(el, i) {
                  return [ i, el ];
              })
              var index = indices[i].indexOf(selectedPoints[i].id);
              if (index > -1) {
                indices[i].splice(index, 1);
              }
              // sorting the mapped array containing the reduced values
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

              // temporary array holds objects with position and sort-value
              indices2d[i] = dists2d[i].map(function(el, i) {
                  return [ i, el ];
              })
              var index2d = indices2d[i].indexOf(selectedPoints[i].id);
              if (index2d > -1) {
                indices2d[i].splice(index2d, 1);
              }
              
              // sorting the mapped array containing the reduced values
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
            if (indexOrderSliced[i].includes(indexOrderSliced2d[i][m])){
              count1[i] = count1[i] + 1;
              temp[i] = temp[i] + 1;
            }
            if(indexOrderSliced[i][m] == indexOrderSliced2d[i][m]){
              count2[i] = count2[i] + 1;
              temp2[i] = temp2[i] + 1;

            }
          }  

          if (count1[i] != 0){
            counter1 = (count1[i] / temp[i]) + counter1;
          }
          if (count2[i] != 0){
            counter2 = (count2[i] / temp2[i]) + counter2;
          }

        }

          sumUnion = counter1 / selectedPoints.length;
          sumIntersection = counter2 / selectedPoints.length;
          if (sumUnion == 0){
            findNearest = 0;
          } else{
            findNearest = sumIntersection / sumUnion;
          }

          if (isNaN(findNearest)){
            findNearest = 0; 
          }
          findNearestTable.push(findNearest * vh * 2);
      }
      findNearestTable.reverse();

      var barPadding = 5;
          d3v3.select("#knnBarChart").selectAll("rect").remove();

      var svg2 = d3v3.select('#knnBarChart')
        .attr("class", "bar-chart");

        
      var barWidth = (vw / findNearestTable.length);

      var knnBarChartSVG = svg2.selectAll("rect")
        .data(findNearestTable)
        .enter()
        .append("rect")
        .attr("y", function(d) {
            return Math.round(vh*2 - d)
        })
        .attr("height", function(d) {
          return d;
        })
        .attr("width", barWidth - barPadding)
        .attr("transform", function (d, i) {
            var translate = [barWidth * i, 0];
            return "translate("+ translate +")";
        });
      }

      d3.select("#starPlot").selectAll('g').remove();
      var coun = 0;
      for (var i=0; i < selectedPoints.length; i++){
        if (selectedPoints[i].starplot == true){
          coun = coun + 1;
        } 
      }

      if(selectedPoints.length <= 10 && coun > 0){
    
        var FeatureWise = [];
    
        for (var j=0; j<Object.values(dataFeatures[0]).length; j++){
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

        var vectors = PCA.getEigenVectors(ArrayContainsDataFeaturesCleared);
        var PCAResults = PCA.computeAdjustedData(ArrayContainsDataFeaturesCleared,vectors[0]);
        var PCASelVec = [];
        PCASelVec = PCAResults.selectedVectors[0];

        var len = PCASelVec.length;
        var indices = new Array(len);
        for (var i = 0; i < len; ++i) indices[i] = i;
        indices = indices.sort(function (a, b) { return PCASelVec[a] < PCASelVec[b] ? -1 : PCASelVec[a] > PCASelVec[b] ? 1 : 0; });
        //const list = dataFeatures.sort((a,b) => a.index - b.index).map((dataFeatures, index, array) => dataFeatures[Category])

        var wrapData = [];
        var IDS = [];
        for (var i=0; i<selectedPoints.length; i++){
          var data = [];
          for (var j=0; j< Object.keys(dataFeatures[selectedPoints[i].id]).length; j++){
            if (!isNaN(Object.values(dataFeatures[selectedPoints[i].id])[j])){
                    for (m=0; m < len; m++){
                      if (indices[m] == j){
                        if (Object.keys(dataFeatures[selectedPoints[i].id])[m] == Category) {
                        } else{
                          data.push({axis:Object.keys(dataFeatures[selectedPoints[i].id])[m],value:Math.abs((Object.values(dataFeatures[selectedPoints[i].id])[m] - min[m])/(max[m] - min[m]))});
                        }
                      }
                    }
              }
            }
          wrapData.push(data);
          IDS.push(selectedPoints[i].id);
        } 

          ////////////////////////////////////////////////////////////// 
          //////////////////// Draw the Chart ////////////////////////// 
          ////////////////////////////////////////////////////////////// 
          var colors = ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd'];
          var colorScl = d3v3.scale.ordinal()
            .domain(IDS)
            .range(colors);

          var radarChartOptions = {
            w: width,
            h: height,
            margin: margin,
            levels: 10,
            roundStrokes: true,
          };
          //Call function to draw the Radar chart
          RadarChart("#starPlot", wrapData, colorScl, IDS, radarChartOptions);
    }

    
  var ColSizeSelector = document.getElementById("param-neighborHood").value;

  if (ColSizeSelector == "color") {
    var max = (d3.max(points,function(d){ return d.beta; }));
    var min = (d3.min(points,function(d){ return d.beta; }));
    // colors
    var colorbrewer = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"];
    var calcStep = (max-min)/7;
    var colorScale = d3.scaleLinear()
      .domain(d3.range(0, max+calcStep, calcStep))
      .range(colorbrewer);

    var maxSize1 = (d3.max(points,function(d){ return d.cost; }));
    var minSize1 = (d3.min(points,function(d){ return d.cost; }));
    var rscale1 = d3.scaleLinear()
      .domain([minSize1, maxSize1])
      .range([5,12]);

    var colorScale = d3.scaleLinear()
      .domain(d3.range(0, max+calcStep, calcStep))
      .range(colorbrewer);
    points = points.sort(function(a, b) {
      return a.beta - b.beta;
    })
    var labels_beta = [];
    var abbr_labels_beta = [];
    labels_beta = d3.range(0, max+calcStep, calcStep);
    for (var i=0; i<9; i++){
      labels_beta[i] = parseInt(labels_beta[i]);
      abbr_labels_beta[i] = abbreviateNumber(labels_beta[i]);
    }
    var svg = d3.select("#legend1");

      svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(10,15)");

      var legend = d3.legendColor()
        .labelFormat(d3.format(",.0f"))
        .cells(9)
        .labels([abbr_labels_beta[0],abbr_labels_beta[1],abbr_labels_beta[2],abbr_labels_beta[3],abbr_labels_beta[4],abbr_labels_beta[5],abbr_labels_beta[6],abbr_labels_beta[7],abbr_labels_beta[8]])
        .title("1 / sigma")
        .scale(colorScale);
        
      svg.select(".legendLinear")
        .call(legend);
  } else {
  var max = (d3.max(points,function(d){ return d.cost; }));
  var min = (d3.min(points,function(d){ return d.cost; }));

  var maxSize2 = (d3.max(points,function(d){ return d.beta; }));
  var minSize2 = (d3.min(points,function(d){ return d.beta; }));
  var rscale2 = d3.scaleLinear()
    .domain([minSize2, maxSize2])
    .range([5,12]);

  var colorbrewer = ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"];
  var calcStep = (max-min)/9;
  var colorScale = d3.scaleLinear()
    .domain(d3.range(min, max, calcStep))
    .range(colorbrewer);

    points = points.sort(function(a, b) {
      return a.cost - b.cost;
    })

    var labels_cost = [];
    var abbr_labels_cost = [];
    labels_cost = d3.range(min, max, calcStep);
    for (var i=0; i<9; i++){
      labels_cost[i] = labels_cost[i].toFixed(5);
      abbr_labels_cost[i] = abbreviateNumber(labels_cost[i]);
    }

    var svg = d3.select("#legend1");

    svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(10,15)");

    var legend = d3.legendColor()
      .labelFormat(d3.format(",.5f"))
      .cells(9)
      .labels([abbr_labels_cost[0],abbr_labels_cost[1],abbr_labels_cost[2],abbr_labels_cost[3],abbr_labels_cost[4],abbr_labels_cost[5],abbr_labels_cost[6],abbr_labels_cost[7],abbr_labels_cost[8]])
      .title("KLD(P||Q)")
      .scale(colorScale);

    svg.select(".legendLinear")
      .call(legend);
  }

  window.addEventListener('resize', () => {
    dimensions = window.innerWidth;
    dimensions = window.innerHeight;

    renderer.setSize(dimensions, dimensions);
    camera.aspect = dimensions / dimensions;
    camera.updateProjectionMatrix();
  })

  let zoom = d3.zoom()
    .scaleExtent([getScaleFromZ(far), getScaleFromZ(near)])
    .on('zoom', () =>  {
      let d3_transform = d3.event.transform;
      zoomHandler(d3_transform);
    });

  view = d3.select(renderer.domElement);

  function setUpZoom() {
    view.call(zoom);    
    let initial_scale = getScaleFromZ(far);
    var initial_transform = d3.zoomIdentity.translate(dimensions/2, dimensions/2).scale(initial_scale);    
    zoom.transform(view, initial_transform);
    camera.position.set(0, 0, far);
  }

  //if(step_counter == max_counter){
  setUpZoom();
  //}

  var circle_sprite= new THREE.TextureLoader().load(
    "./textures/circle-sprite.png"
  )



  clearThree(scene);

  // Increase/reduce size factor selected by the user
  var limitdist = document.getElementById("param-lim-value").value;
  limitdist = parseFloat(limitdist).toFixed(1);

  let pointsMaterial;
  let factorPlusSize;
  let geometry = new THREE.Geometry();
  for (var i=0; i<points.length; i++) {
    let pointsGeometry = new THREE.Geometry();
    let vertex = new THREE.Vector3((((points[i].x/dimensions)*2) - 1)*dimensions, (((points[i].y/dimensions)*2) - 1)*dimensions*-1, 0);
    pointsGeometry.vertices.push(vertex);
    geometry.vertices.push(vertex);
    if (points[i].selected == false){
      var color = new THREE.Color("rgb(211, 211, 211)");
    } else if (points[i].DimON != null) {

      let temp = points[i].DimON.match(/\d+/)[0];

      var maxDim = (d3.max(points,function(d){ if(d.selected == true){return d[temp]}; }));
      var minDim = (d3.min(points,function(d){ if(d.selected == true){return d[temp]}; }));  

      let colorsBarChart = ['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d'];
      var calcStepDim = (maxDim-minDim)/8;
      var colorScale = d3.scaleLinear()
        .domain(d3.range(minDim, maxDim+calcStepDim, calcStepDim))
        .range(colorsBarChart);
      var color = new THREE.Color(colorScale(points[i][temp]));
        
    } else if(points[i].starplot == true){
      var color = new THREE.Color(colorScl(points[i].id));
    } else if (ColSizeSelector == "color") {
      var color = new THREE.Color(colorScale(points[i].beta));
    }
    else{
      var color = new THREE.Color(colorScale(points[i].cost));
    }
    if (ColSizeSelector == "color") {
      let sizePoint = rscale1(points[i].cost);
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

  let tempSort = -1;

  for (var i=0; i<points.length; i++){
  if (points[i].DimON != null) {
    tempSort = points[i].DimON.match(/\d+/)[0];
  }
  }

  if (tempSort != -1){
  points = points.sort(function(a, b) {
      return a[tempSort] - b[tempSort];
  })
  }

  var temporal = 0;
  for (var j=0; j < points.length; j++){
  if(points[j].DimON != null) {
        temporal = temporal + 1;
        var labels_dim = [];
        var abbr_labels_dim = [];
        labels_dim = d3.range(minDim, maxDim+calcStepDim, calcStepDim);

        for (var i=0; i<9; i++){
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
          .cells(9)
          .labels([abbr_labels_dim[0],abbr_labels_dim[1],abbr_labels_dim[2],abbr_labels_dim[3],abbr_labels_dim[4],abbr_labels_dim[5],abbr_labels_dim[6],abbr_labels_dim[7],abbr_labels_dim[8]])
          .title(points[j].DimON)
          .scale(colorScale);

        svg.select(".legendLinear")
          .call(legend);
        break;
      } 
  }
  // This is for the legend
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
          .title("1 / sigma")
          .scale(colorScale);
    
        svg.select(".legendLinear")
          .call(legend);
        break;
      } else {
        d3.select("#legend1").selectAll('*').remove();
        var svg = d3.select("#legend1");

        svg.append("g")
          .attr("class", "legendLinear")
          .attr("transform", "translate(10,15)");

        var legend = d3.legendColor()
          .labelFormat(d3.format(".4f"))
          .cells(9)
          .labels([abbr_labels_cost[0],abbr_labels_cost[1],abbr_labels_cost[2],abbr_labels_cost[3],abbr_labels_cost[4],abbr_labels_cost[5],abbr_labels_cost[6],abbr_labels_cost[7],abbr_labels_cost[8]])
          .title("KLD(P||Q)")
          .scale(colorScale);

        svg.select(".legendLinear")
          .call(legend);
        break;
      }
    }
  }

  function zoomHandler(d3_transform) {
    let scale = d3_transform.k;
    let x = -(d3_transform.x - dimensions/2) / scale;
    let y = (d3_transform.y - dimensions/2) / scale;
    let z = getZFromScale(scale);
    camera.position.set(x, y, z);
  }

  function getScaleFromZ (camera_z_position) {
    let half_fov = fov/2;
    let half_fov_radians = toRadians(half_fov);
    let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
    let fov_height = half_fov_height * 2;
    let scale = dimensions / fov_height; // Divide visualization height by height derived from field of view
    return scale;
  }

  function getZFromScale(scale) {
    let half_fov = fov/2;
    let half_fov_radians = toRadians(half_fov);
    let scale_height = dimensions / scale;
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
      -(mouseY / dimensions) * 2 + 1,
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
        (((datum.y/dimensions)*2) - 1)*dimensions*-1,
        0
      )
    );

    if (all_labels[0] == undefined){
      var colorScaleCat = d3.scaleOrdinal().domain(["No Category"]).range(["#C0C0C0"]);
    }
    else{
      var colorScaleCat = d3.scaleOrdinal().domain(all_labels).range(ColorsCategorical);
    }

    geometry.colors = [ new THREE.Color(colorScaleCat(datum[Category])) ];

    let material = new THREE.PointsMaterial({
      size: 26,
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
      tooltipComb = "Data set's features: " + "\n";
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
        tooltip_state[Category] = datum[Category] + " (Point ID: " + datum.id + ")";
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

  function getViewport() {

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

 function download(contentP, Parameters, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([contentP], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

var measureSaves = 0;

function SaveAnalysis(){
  measureSaves = measureSaves + 1;
  let dataset = document.getElementById("param-dataset").value;
  let perplexity = document.getElementById("param-perplexity-value").value;
  let learningRate = document.getElementById("param-learningrate-value").value;
  let IterValue = document.getElementById("param-maxiter-value").value;
  let parDist = document.getElementById("param-distance").value;
  let parTrans = document.getElementById("param-transform").value;
  let Parameters = [];
  Parameters.push(dataset);
  Parameters.push(perplexity);
  Parameters.push(learningRate);
  Parameters.push(IterValue);
  Parameters.push(parDist);
  Parameters.push(parTrans);
  AllData = [];
  if (cost[0] != undefined){
    AllData = points.concat(points2d).concat(cost[0].toFixed(3)).concat(Parameters);
  } else{
    AllData = points.concat(points2d).concat(overallCost).concat(Parameters);
  }

  download(JSON.stringify(AllData), JSON.stringify(Parameters),'Analysis'+measureSaves+'.txt', 'text/plain');
}