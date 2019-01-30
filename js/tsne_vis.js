// t-SNE.js object and other global variables

var toggleValue = false; var k; var points = []; var all_fields; var pointsbeta = []; 
// These are the dimensions for the square shape of the main panel\
var dimensions = document.getElementById('modtSNEcanvas').offsetWidth;

// These are the dimensions for the overview panel
var dim = document.getElementById('tSNEcanvas').offsetWidth;

var format; var new_file; var opt; var step_counter; var final_dataset; var max_counter; var dists; var dists2d; var all_labels; var runner; var tsne; var count_canvas = 0; var x_position = []; var y_position = []; var x_position2 = []; var y_position2 = []; var cost_each; var beta_all = [];
var points2d = []; var ArrayContainsDataFeatures = [];

function getfile(file){
  new_file = file;   //uploaded file data
}

// Parse data
var getData = function() {
  // form controls
    var value = document.getElementById("param-dataset").value;

    format = document.getElementById("param-dataset").value.split("."); //get the actual format
    if (format[value.split(".").length-1] == "csv") {
      parseData("./data/"+value);
    }else{
      parseData(new_file, init);
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
                  if (key === 'name'){
                  }else{
                    if(typeof(value) !== 'number' || value === undefined || key === "Version"){ //add more limitations if needed!
                      delete el[key];
                    }else{
                      el[counter] = el[key];
                      delete el[key];
                      counter = counter + 1;
                    }
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

function setToggle(toggleVal){
  toggleValue = toggleVal;
}


// function that executes after data is successfully loaded
function init(data, results_all, fields) {
    step_counter = 0;
    max_counter = document.getElementById("param-maxiter-value").value;
    opt = {};
    var fields;
    fields.push("beta");
    fields.push("cost");
    all_fields = fields;
    opt.epsilon = document.getElementById("param-learningrate-value").value; // epsilon is learning rate (10 = default)
    opt.perplexity = document.getElementById("param-perplexity-value").value; // roughly how many neighbors each point influences (30 = default)
    tsne = new tsnejs.tSNE(opt);
    final_dataset = data;
    dataFeatures = results_all;
 
    for (let k = 0; k < dataFeatures.length; k++){
      ArrayContainsDataFeatures.push(Object.values(dataFeatures[k]).concat(k));
    }
    dists = computeDistances(data, document.getElementById("param-distance").value, document.getElementById("param-transform").value);
    tsne.initDataDist(dists);
    all_labels = [];
    for(var i = 0; i < data.length; i++) {
      if (final_dataset[i]["name"] != "" || final_dataset[i]["name"] != "undefined"){
        all_labels[i] = final_dataset[i]["name"];
      }
      else{
        all_labels[i];
      }
    }
    for(var i = 0; i < final_dataset.length; i++) {final_dataset[i].beta = tsne.beta[i]; beta_all[i] = tsne.beta[i];}
    runner = setInterval(step, 0);
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
function updateEmbedding() {
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
          points[i] = {id: i, x: x_position[i], y: y_position[i], beta: final_dataset[i].beta, cost: final_dataset[i].cost, selected: true};
          points2d[i] = {id: i, x: x_position[i], y: y_position[i], selected: true};
          points[i] = extend(points[i], dataFeatures[i]);
      }
    function extend(obj, src) {
    for (var key in src) {
        if (src.hasOwnProperty(key)) obj[key] = src[key];
    }
      return obj;
    }
      if (step_counter == 1 || step_counter == max_counter){
        ShepardHeatMap();
      }
          OverviewtSNE(points);
          BetatSNE(points);
          //CosttSNE(points);
}

function ShepardHeatMap () {
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
  var colors = ["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"];
  let calcStep = (maxNum-minNum)/colors.length;
  var colorScale = d3.scaleLinear()
      .domain(d3.range(0, maxNum+calcStep,calcStep))
      .range(colors);
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .style("visibility","visible")
              .offset([-20, 0])
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
    .attr("transform", "translate(0,10)");

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
  var cost = tsne.step();
  cost_each = cost[1];
  for(var i = 0; i < final_dataset.length; i++) final_dataset[i].cost = cost_each[i];
  $("#cost").html("Number of Iteration: " + tsne.iter + ", Overall Cost: " + cost[0].toFixed(3));
    }
    else {
        clearInterval(runner);
    }
    updateEmbedding();
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

function OverviewtSNE(points){
  if (step_counter == 1){
    d3.select("#OverviewtSNE").select("g").remove();
    d3.select("#correlation").select("g").remove();
    d3.selectAll("#modtSNEcanvas_svg > *").remove(); 
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
  }
  var canvas = document.getElementById('tSNEcanvas');
  gl = canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  if (all_labels[0] == undefined){
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(["No Category"]).range(["#0000ff"]);
  }
  else{
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(all_labels);
  }
  if (step_counter == 1){
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
  }
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
      let colval = d3.rgb(colorScale(points[i].name));
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
    'attribute vec3 limitdist;'+
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
  OverviewtSNE(repoints);
  BetatSNE(repoints);
  //CosttSNE(repoints);
}

function handleLassoEnd(lassoPolygon) {
  var countLassoFalse = 0;

  if (toggleValue == false){
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
    redraw(points);
  } else{
    click();
  }
 
}

// reset selected points when starting a new polygon
function handleLassoStart(lassoPolygon) {
  if (toggleValue == true){
  } else{
    for (var i = 0 ; i < points.length ; i ++) {
    points[i].selected = true;
    points2d[i].selected = true;
  }

  redraw(points);
  }
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

function click(){

    let svgClick = d3.select('#modtSNEcanvas_svg');

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
      var coords = d3.mouse(this);
      drawCircle(coords[0], coords[1], 4);
  });

  //if (Arrayx.length == 1){
  //}
  svgClick.on("contextmenu", function (d) {

            // Prevent the default mouse action. Allow right click to be used for the confirmation of our schema.
            d3.event.preventDefault();

            var line = d3.line().curve(d3.curveCardinal);

            for (var k = 0; k < Arrayx.length ; k++){
              Arrayxy[k] = [Arrayx[k], Arrayy[k]];
            }

            for (var loop = 0; loop < points.length ; loop++){
                allTransformPoints[loop] = [points[loop].x, points[loop].y, points[loop].id, points[loop].beta, points[loop].cost, points[loop].selected];
            }
          
            for (var k = 0; k < Arrayxy.length - 1; k++){
              path = svgClick.append("path")
              .datum(Arrayxy.slice(k, k+2))
              .attr("class", "SchemaCheck")
              .attr("d", line);
            }

            var line = svgClick.append("line");

            paths = svgClick.selectAll("path").filter(".SchemaCheck");

            var correlLimit = document.getElementById("param-corr-value").value;
            correlLimit = parseInt(correlLimit);
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
        
            for (var i=0; i<arraysCleared.length; i++) {
              if (arraysCleared[i][5] < correlLimit) {
                ArrayLimit.push(arraysCleared[i]);
              }
            }
            
            //console.log("ArrayLimit"+ArrayLimit);
            var temparray = [];
            var count = new Array(paths.nodes().length).fill(0);
            for (var m=0; m < paths.nodes().length; m++) {
              for (var i=0; i<ArrayLimit.length; i++) {
                if (ArrayLimit[i][2] == m){
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
              Order.push(arraysConnected[temp][6]);
            }
            
            for (var i = 0; i < points.length; i++){
              points[i].selected = false;
              for (var j = 0; j < ArrayLimit.length; j++){
                if (ArrayLimit[j][6] == points[i].id){
                  points[i].selected = true;
                }
              }
            }
            redraw(points);

            ArrayContainsDataFeatures = mapOrder(ArrayContainsDataFeatures, Order, 5);

            for (var i = 0; i < ArrayContainsDataFeatures.length; i++){
              for (var j = 0; j < arraysConnected.length; j++){
                if (ArrayContainsDataFeatures[i][5] == arraysConnected[j][6]){
                  ArrayContainsDataFeaturesLimit.push(ArrayContainsDataFeatures[i]);
                }
              }
            }
            
            for (var loop = 0; loop < ArrayContainsDataFeaturesLimit.length; loop++) {
              ArrayContainsDataFeaturesLimit[loop].push(loop);
            }

            for (var k = 0; k < Arrayxy.length - 1 ; k++){
              d3.select('#modtSNEcanvas_svg').append('line')
              .attr("x1", Arrayxy[k][0])
              .attr("y1", Arrayxy[k][1])
              .attr("x2", Arrayxy[k+1][0])
              .attr("y2", Arrayxy[k+1][1])
              .style("stroke","black")
              .style("stroke-width",2);
            } 

            var SignStore = [];
            const arrayColumn = (arr, n) => arr.map(x => x[n]);
            for (var temp = 0; temp < ArrayContainsDataFeaturesLimit[0].length - 2; temp++) {
              var tempData = new Array(
                arrayColumn(ArrayContainsDataFeaturesLimit, temp),
                arrayColumn(ArrayContainsDataFeaturesLimit, ArrayContainsDataFeaturesLimit[0].length - 1)
              );
              if (isNaN(pearsonCorrelation(tempData, 0, 1))) {
              } else{
                SignStore.push([temp, pearsonCorrelation(tempData, 0, 1)]);
                correlationResults.push(["Dimension "+temp, Math.abs(pearsonCorrelation(tempData, 0, 1))]);
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
                  //correlationResults[j][1] = correlationResults[j][1].toFixed(2)*(-1);
                }
                if (SignStore[i][1] == correlationResults[j][1]) {
                  correlationResults[j][1] = parseInt(correlationResults[j][1] * 100);
                }
              }
            }
            
          /////////////////////////////////////////////////////////////
          ///////////////// Set-up SVG and wrappers ///////////////////
          /////////////////////////////////////////////////////////////
    
            //Added only for the mouse wheel
          var zoomer = d3v3.behavior.zoom()
             .on("zoom", null);

          var main_margin = {top: 0, right: 10, bottom: 30, left: 100},
              main_width = 500 - main_margin.left - main_margin.right,
              main_height = 400 - main_margin.top - main_margin.bottom;
      
          var mini_margin = {top: 0, right: 10, bottom: 30, left: 10},
              mini_height = 400 - mini_margin.top - mini_margin.bottom;
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
          var brushExtent = parseInt(Math.max( 2, Math.min( 20, Math.round(correlationResults.length*0.2 ) ) ));
          //What should the first extent of the brush become - a bit arbitrary this
          //var brushExtent = Math.max( 1, Math.min( 20, Math.round(correlationResults.length*0.2) ) );
          //  console.log(brushExtent);
          brush = d3v3.svg.brush()
            .y(mini_yScale)
            .extent([mini_yScale(correlationResults[0][0]), mini_yScale(correlationResults[brushExtent][0])])
            .on("brush", brushmove)

          //Set up the visual part of the brush
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
          createGradient("gradient-main", "65%");
          createGradient("gradient-mini", "14%");
      
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
            .data(correlationResults, function(d) { return d[2]; });

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
        }
      });
            
}

//Function runs on a brush move - to update the big bar chart
function updateBarChart() {

  /////////////////////////////////////////////////////////////
  ////////// Update the bars of the main bar chart ////////////
  /////////////////////////////////////////////////////////////

  var bar = d3v3.select(".mainGroup").selectAll(".bar")
      .data(correlationResults, function(d) { return d[2]; })
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
    .attr("height", main_yScale.rangeBand());

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

  var colorsBarChart = ['#7f3b08','#b35806','#e08214','#fdb863','#fee0b6','#d8daeb','#b2abd2','#8073ac','#542788','#2d004b']

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
    //console.log(best);
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
      console.log( d3.event.pageX, d3.event.pageY ) // log the mouse x,y position
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

function BetatSNE(points){
  
  if(step_counter == max_counter || step_counter == 1){
    if (step_counter == 1){
      d3.select("#modtSNEcanvas_svg").select("g").remove();
    }else{
      if (toggleValue == false){ 
        interactionSvg = d3.select("#modtSNEcanvas_svg")
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
     }
  }
  var canvas = document.getElementById('modtSNEcanvas');
  var gl = canvas.getContext('webgl');
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  max = (d3.max(final_dataset,function(d){ return d.beta; }));
  min = (d3.min(final_dataset,function(d){ return d.beta; }));
    // colors
    let colorbrewer = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"];
    let calcStep = (max-min)/7;
    let colorScale = d3.scaleLinear()
  .domain(d3.range(0, max+calcStep, calcStep))
  .range(colorbrewer);

  points = points.sort(function(a, b) {
    return a.beta - b.beta;
  })

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
var labels_beta = [];
var abbr_labels_beta = [];
labels_beta = d3.range(0, max+calcStep, calcStep);
for (var i=0; i<9; i++){
  labels_beta[i] = parseInt(labels_beta[i]);
  abbr_labels_beta[i] = abbreviateNumber(labels_beta[i]);
}
  if(step_counter == 1){
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
  }

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
      let colval = d3.rgb(colorScale(points[i].beta));
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


  // Increase/reduce size factor selected by the user
  var limitdist = document.getElementById("param-lim-value").value;
  limitdist = parseFloat(limitdist).toFixed(1);

  // vertex shader source code
  var vertCode = 'attribute vec3 coordinates;'+
    'attribute vec3 color;'+
    'varying vec3 vColor;'+
    'void main(void) {' +
       ' gl_Position = vec4(coordinates, 1.0);' +
       'vColor = color;'+
       'gl_PointSize = ' + limitdist + ';'+
    '}';

  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  // fragment shader source code
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
    gl_FragColor.rgb *= gl_FragColor.a;
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

  gl.enable( gl.BLEND );
  gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

  gl.disable(gl.DEPTH_TEST);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  resize(gl.canvas);

   gl.viewport(0, 0, dimensions, dimensions);
  //Draw the triangle
  gl.drawArrays(gl.POINTS, 0, points.length);

  selectedPoints = [];
  selectedPoints2d = [];
  var findNearestTable = [];
  for (let m=0; m<points.length; m++){
   if (points[m].selected == true){
      selectedPoints.push(points[m]);
      selectedPoints2d.push(points2d[m]);
   }
  }
  /*
  for (k=2; k < 9; k++){
       var findNearest = kNearestNeighbors(k, selectedPoints,points2d);
       if (isNaN(findNearest)){
        findNearest = 0; 
       }
       findNearestTable.push(findNearest * 65);
  }

  var barPadding = 5;
  if (step_counter != 1){
      d3.select("#knnBarChart").selectAll("rect").remove();
    }

  var svg = d3.select('#knnBarChart')
    .attr("class", "bar-chart");

  var barWidth = (svgWidth / findNearestTable.length);
  var knnBarChartSVG = svg.selectAll("rect")
    .data(findNearestTable)
    .enter()
    .append("rect")
    .attr("y", function(d) {
        return Math.round(svgHeight - d)
    })
    .attr("height", function(d) {
        return d;
    })
    .attr("width", barWidth - barPadding)
    .attr("transform", function (d, i) {
         var translate = [barWidth * i, 0];
         return "translate("+ translate +")";
    });*/
}


/*
function CosttSNE(points){
  var canvas = document.getElementById('pointCostcanvas');
  var gl = canvas.getContext('experimental-webgl');
  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  max = (d3.max(final_dataset,function(d){ return d.cost; }));
  min = (d3.min(final_dataset,function(d){ return d.cost; }));
  // colors
  let colorbrewer = ["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"];
  let calcStep = (max-min)/9;
  let colorScale = d3.scaleLinear()
    .domain(d3.range(min, max, calcStep))
    .range(colorbrewer);

    points = points.sort(function(a, b) {
      return a.cost - b.cost;
    })
  var svg = d3.select("#legend2");

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(197,20)");

  var legend = d3.legendColor()
    .labelFormat(d3.format(".4f"))
    .cells(9)
    .title("KLD(P||Q)")
    .scale(colorScale);

  svg.select(".legendLinear")
    .call(legend);

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
      let colval = d3.rgb(colorScale(points[i].cost));
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



  var limitdist = document.getElementById("param-lim-value").value;
  limitdist = parseFloat(limitdist).toFixed(1);

  // vertex shader source code
  var vertCode = 'attribute vec3 coordinates;'+
    'attribute vec3 color;'+
    'varying vec3 vColor;'+
    'void main(void) {' +
       ' gl_Position = vec4(coordinates, 1.0);' +
       'vColor = color;'+
       'gl_PointSize = ' + limitdist + ';'+
    '}';

  // Create a vertex shader object
  var vertShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertShader, vertCode);

  // Compile the vertex shader
  gl.compileShader(vertShader);

  // fragment shader source code
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
  gl_FragColor.rgb *= gl_FragColor.a;
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

  gl.enable( gl.BLEND );
  gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

  resize(gl.canvas);

   gl.viewport(0, 0, dimensions, dimensions);

  // Clear the color buffer bit
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Draw the triangle
  gl.drawArrays(gl.POINTS, 0, points.length);

}
*/

// This function calls KNN and draw a bar chart.
function knnBarChart(){

}

// This function draws the lines for the best distributions.
function schemaCompare(){
  
}
