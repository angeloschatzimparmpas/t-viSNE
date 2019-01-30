/*
 * Copyright (C) 2015 Jose F. Maldonado
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Verify if the namespace is not already defined.
if(typeof SaVaGe !== 'object') SaVaGe = {};

/**
 * Creates a SVG element representing a toggle switch.
 * 
 * The parameter must be an object with the following attributes:
 * 'container' (a selector of the element where the element must be appended),
 * 'value' (a boolean indicating the initial value of the switch, by default 'false'),
 * 'height' (a number indicating the height, in pixels, of the element, by default 50),
 * 'width' (a number indicating the width, in pixels, of the element, by default 80),
 * 'radius' (a number indicating the radius of the lever),
 * 'border' (a number indicating the width, in pixels, the distance between the element background and the switch's button, by default 5),
 * 'duration' (a number indicating the number of milliseconds that the toggle animation must last, by default 250),
 * 'colors' (an object with the attributes 'backLeft', 'foreLeft', 'backRight' and 'foreRight' indicating the colors of the element in each state) and
 * 'onChange' (a callback function which is invoked every time that the element is clicked).
 * 
 * The object returned by this function contains the methods:
 * 'svg', and instance of the SVG object created with D3.js,
 * 'getValue()', for get the current state of the switch,
 * 'serValue(newVal)', for change the state of the switch and
 * 'remove()', for remove the element from the document.
 * 
 * @param {object} params An collection of values for customize the element.
 * @returns {object} An object with methods for manipulate the element.
 */
SaVaGe.ToggleSwitch = function(params) {
    // Verify parameters.
    if(typeof params !== 'object') params = {};
    if(typeof params.container !== 'string') params.container = "body";
    if(typeof params.value !== 'boolean') params.value = false;
    if(typeof params.height !== 'number') params.height = 50;
    if(typeof params.width !== 'number' || params.width < params.height) params.width = parseInt(params.height*1.6, 10);
    if(typeof params.radius !== 'number') params.radius = params.height/2 - 4;
    if(typeof params.duration !== 'number') params.duration = 250;
    if(typeof params.colors !== 'object') params.colors = {};
    if(params.colors.backLeft === undefined) params.colors.backLeft = "lightgray";
    if(params.colors.foreLeft === undefined) params.colors.foreLeft = "white";
    if(params.colors.backRight === undefined) params.colors.backRight = "#88f";
    if(params.colors.foreRight === undefined) params.colors.foreRight = "white";
    
    // Define internal variables.
    var atRight = params.value;
    
    // Calculate SVG dimensions and position offset.
    var svgHeight = params.height;
    var svgWidth = params.width;
    var offsetX = 0;
    var offsetY = 0;
    if(params.radius*2 > params.height) {
        svgHeight = params.radius*2;
        svgWidth = parseInt(params.width + (params.radius*2 - params.height), 10);
        offsetX = parseInt((svgWidth - params.width)/2, 10);
        offsetY = parseInt((svgWidth - params.width)/2, 10);
    }
    
    // Create widget.
    var svg = d3.select(params.container).append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .style("cursor", "pointer");
    var rect = svg.append("rect")
            .attr("x", offsetX)
            .attr("y", offsetY)
            .attr("rx", params.height/2)
            .attr("ry", params.height/2)
            .style("fill", atRight? params.colors.backRight : params.colors.backLeft)
            .attr("width", params.width)
            .attr("height", params.height);
    var circle = svg.append("circle")
            .attr("cx", (atRight? (params.width-params.height/2) : (params.height/2)) + offsetX)
            .attr("cy", params.height/2 + offsetY)
            .attr("r", params.radius)
            .style("fill", atRight? params.colors.foreRight : params.colors.foreLeft);

    // Define internal functions.
    var setAtRight = function(newValue) {
        atRight = newValue;
        circle.transition().duration(params.duration)
                .attr("cx", (atRight? (params.width-params.height/2) : (params.height/2)) + offsetX)
                .style("fill", atRight? params.colors.foreRight : params.colors.foreLeft);
        rect.transition().duration(params.duration).style("fill", atRight? params.colors.backRight : params.colors.backLeft);
        
    };
    
    // Define result's object.
    var res = {
        'svg' : svg,
        'getValue': function() { return atRight; },
        'setValue': setAtRight,
        'remove': function() { svg.remove(); }
    };

    // Define click listener.
    svg.on('click', function(data, index){
        setAtRight(!atRight);
        if(typeof params.onChange === 'function') params.onChange(res);
    });    
    
    return res;
};
