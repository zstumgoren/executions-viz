var WIDTH = 600;
var HEIGHT = 400;
d3.select('svg')
    .style('width', WIDTH)
    .style('height', HEIGHT);

function row(d) {
  // Slice the year from the Date field
  let year = +d.Date.split('/').slice(-1).pop();
  // Only include executions from 2000 onward
  if (year >= 2000) {
    return {
      year: year,
      state: d.State,
      age: +d.Age,
      sex: d.Sex,
      race: d.Race,
      method: d.Method
    };
  };
}

d3.csv("execution_database.csv", row)
    .then(function (data) {
      // PREPARE DATA
      // Group Executions by year
      var executionsByYear = d3.nest()
        .key(function(d) { return d.year }).sortKeys(d3.ascending)
        .rollup(function(d) { return d.length })
        .entries(data);

      // PERFORM DATA JOIN
      // Select the SVG and (yet-to-exist) rect
      // elements and perform a data join.
      d3.select('svg').selectAll('rect')
          .data(executionsByYear)
          .enter()
          .append('rect');

      // CREATE SCALES
      // Create a y scale
      var yScale = d3.scaleLinear();
      yScale.range([HEIGHT, 0]);
      var yMax = d3.max(executionsByYear, function(datum, index){ return datum.value; });
      yScale.domain([0, yMax]);

      // Create the x scale
      var xScale = d3.scaleLinear();
      xScale.range([0, WIDTH]);
      xScale.domain([0, executionsByYear.length]);

      // SET VISUAL ATTRIBUTES
      // Select rectangles and set the attributes.
      // We use the scale functions to dynamically set attributes for x, y and height
      d3.selectAll('rect')
          .attr('height', function(datum, index){ return HEIGHT - yScale(datum.value) })
          .attr('width', WIDTH/executionsByYear.length)
          .attr('x', function(datum, index){ return xScale(index) })
          .attr('y', function(datum, index){ return yScale(datum.value) })
          .attr('fill', '#3333FF');

      // CREATE AXES
      var leftAxis = d3.axisLeft(yScale);
      d3.select('svg')
          .append('g')
          .call(leftAxis);

       // Create a scale band that maps years to horizontal positions
      var yearScale = d3.scaleBand();
      var yearDomain = executionsByYear.map(function(year){
          return year.key
      });
      yearScale.range([0, WIDTH]);
      yearScale.domain(yearDomain);

      // Create a bottom axis generator that uses the yearScale
      var bottomAxis = d3.axisBottom(yearScale);
      d3.select('svg')
        .append('g')
        .attr('transform', 'translate(0,'+HEIGHT+')') //move it to the bottom of the svg
        .call(bottomAxis); // create a bottom axis within that <g>

      // Remove the axis "domain" lines to clean up the styling a bit
      // NOTE: We use CSS to hide the tick lines
      d3.selectAll(".domain").remove();

      // ADD TOOLTIPS
      // Define the div for the tooltip
      // (div is initially hidden through opacity setting)
      var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

      function mouseover(d) {
        div.transition()
             .duration(200)
             .style("opacity", .9);
        div.html(d.value + "</br>executions")
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
      }

      function mouseout(d) {
        div.transition()
             .duration(500)
             .style("opacity", 0);
      }

      // Add mouse event handlers
      d3.selectAll('rect')
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    });
