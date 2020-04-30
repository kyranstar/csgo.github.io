
console.log("Loading data");
Promise.all(
  [d3.csv('data/de_mirage_CounterTerrorist_Smoke_10000_locs.csv', function(d){
    return {
        file_round: d.file_round,
        seconds : +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
    };
}),
  d3.csv('data/de_mirage_example_round.csv', function(d){
    return {
        file_round: d.file_round,
        seconds : +d.seconds,
        att_side: d.att_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
    };
})
]).then(data => {
    data_ct_smoke_locs = data[0]
    console.log(data_ct_smoke_locs)
    data_ct_smoke_examples = data[1]
    setTimeout(drawInitial(), 100)
});



function drawInitial(){
  console.log("Drawing Initial");
  var margin = {top: 40, right: 40, bottom: 30, left: 30},
    width = 1000 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#vis")
  .append("svg")
    .attr("width", 850)
    .attr("height", 850)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// X scale and Axis
xScale = d3.scaleLinear()
    .domain([0, 1000])         // This is the min and the max of the data: 0 to 100 if percentages
    .range([0, 850]);       // This is the corresponding value I want in Pixel
svg
  .append('g')
  .attr("transform", "translate(0," + height + ")")
  //.call(d3.axisBottom(x));

svg
  .append("image").attr("xlink:href", "https://raw.githubusercontent.com/kyranstar/csgo.github.io/master/img/de_mirage.jpg")
  .attr("width", 850)
  .attr("height", 850)

// X scale and Axis
yScale = d3.scaleLinear()
    .domain([0, 1000])         // This is the min and the max of the data: 0 to 100 if percentages
    .range([0, 840]);       // This is the corresponding value I want in Pixel
svg
  .append('g')
  //.call(d3.axisLeft(y));

svg
  .selectAll("ct_smoke_plot")
  .data(data_ct_smoke_locs)
  .enter()
  .append("circle")
    .attr("cx", function(d){ return xScale(d.nade_land_x) })
    .attr("cy", function(d){ return yScale(d.nade_land_y) })
    .attr("r", 2)
    .style("fill", "#69b3a2")
    .attr("opacity", 0.5)

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
  console.log("Drawing draw1");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
        .transition().duration(1000)
        .style("fill", "#69b3a2")
        .attr("opacity", 0.5)
}
function draw2(){
  console.log("Drawing draw2");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
        .transition().duration(1000)
        .attr("opacity", 0)
}
function draw3(){
  console.log("Drawing draw3");
  let svg = d3.select("#vis").select('svg')
  clean('none')
  //console.log(random_round_nades);
}
function draw4(){
  console.log("Drawing draw4");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
        .transition().duration(1000)
        .style("fill", "#69b3a2")
        .attr("opacity", 0.5)
}
function draw5(){
  console.log("Drawing draw5");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
        .transition().duration(1000)
        .style("fill", function (d){return (d.winner_side === d.att_side) ? 'red' : 'blue'})
    .attr("opacity", 0.3)

}
function draw6(){
  console.log("Drawing draw6");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var categorical = [
  { "name" : "schemeAccent", "n": 8},
  { "name" : "schemeDark2", "n": 8},
  { "name" : "schemePastel2", "n": 8},
  { "name" : "schemeSet2", "n": 8},
  { "name" : "schemeSet1", "n": 9},
  { "name" : "schemePastel1", "n": 9},
  { "name" : "schemeCategory10", "n" : 10},
  { "name" : "schemeSet3", "n" : 12 },
  { "name" : "schemePaired", "n": 12},
  { "name" : "schemeCategory20", "n" : 20 },
  { "name" : "schemeCategory20b", "n" : 20},
  { "name" : "schemeCategory20c", "n" : 20 }
]
  var clusterColorScale = d3.scaleOrdinal(d3[categorical[0].name])

  svg.selectAll('circle')
        .transition().duration(1000)
        .style("fill", function (d){return (d.cluster < 0) ? '#000000' : (clusterColorScale(d.cluster))})
        .attr("opacity", 0.5)
}
function draw7(){

}
