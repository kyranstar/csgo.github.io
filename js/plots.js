function loadData(){
  console.log("Loading data");
  /*d3.csv("/data/employees.csv", function(data) {
    for (var i = 0; i < data.length; i++) {
        console.log(data[i].Name);
        console.log(data[i].Age);
    }
} );*/
}

function drawInitial(){
  console.log("Drawing Initial");
  var margin = {top: 10, right: 40, bottom: 30, left: 30},
    width = 450 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svG = d3.select("#vis")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Create data
var data = [ {x:10, y:20}, {x:40, y:90}, {x:80, y:50} ]

// X scale and Axis
var x = d3.scaleLinear()
    .domain([0, 100])         // This is the min and the max of the data: 0 to 100 if percentages
    .range([0, width]);       // This is the corresponding value I want in Pixel
svG
  .append('g')
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// X scale and Axis
var y = d3.scaleLinear()
    .domain([0, 100])         // This is the min and the max of the data: 0 to 100 if percentages
    .range([height, 0]);       // This is the corresponding value I want in Pixel
svG
  .append('g')
  .call(d3.axisLeft(y));

// Add 3 dots for 0, 50 and 100%
svG
  .selectAll("whatever")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", function(d){ return x(d.x) })
    .attr("cy", function(d){ return y(d.y) })
    .attr("r", 7)
}

function clean(chartType) {
  let svg = d3.select('#vis').select('svg')
  if (chartType !== "isScatter") {
    svg.select('.scatter-x').transition().attr('opacity', 0)
    svg.select('.scatter-y').transition().attr('opacity', 0)
  }
  if (chartType !== "isMultiples") {
    svg.selectAll('.lab-text').transition().attr('opacity', 0)
    svg.selectAll('.cat-rect').transition().attr('opacity', 0)
  }
}

function draw1(){
  console.log("Drawing data1");
}
function draw2(){

}
