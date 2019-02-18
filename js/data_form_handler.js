
function changeDataset(value) {

    var format = value.split("."); // Get the data set's format.

    if (format[value.split(".").length-1] != "csv") { // This is for a new file.
      d3.select("#data").select("input").remove();
      d3.select("#data")
        .append("input")
         .attr("type", "file")
         .style("font-size", "10px")
         .on("change", function() {
          var file = d3.event.target.files[0];
          getfile(file);
        })
    } else {
      d3.select("#data").select("input").remove(); // Remove the selection field.
    }

}
