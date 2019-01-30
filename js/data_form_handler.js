
function changeDataset(value) {
    var format = value.split("."); //get the actual format

  if (format[value.split(".").length-1] == "csv") {
  }else{
    d3.select("#data").select("input").remove();
     d3.select("#data")
      .append("input")
        .attr("type", "file")
        .on("change", function() {
          var file = d3.event.target.files[0];
        getfile(file);
       })
   }
}
