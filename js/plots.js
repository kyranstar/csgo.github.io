console.log("Loading data");
data_promise = Promise.all(
  [d3.csv('data/de_mirage_example_round.csv', function (d) {
    return {
      file_round: d.file_round,
      seconds: +d.seconds,
      att_side: d.att_side,
      nade_land_y: +d.nade_land_y,
      nade_land_x: +d.nade_land_x,
      att_pos_y: +d.att_pos_y,
      att_pos_x: +d.att_pos_x,
      cluster: +d.cluster,
    };
  }),
    d3.csv('data/de_mirage_CounterTerrorist_Smoke_10000_locs.csv', function (d) {
      return {
        file_round: d.file_round,
        seconds: +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
      };
    }),

    d3.csv('data/de_mirage_Terrorist_Smoke_10000_locs.csv', function (d) {
      return {
        file_round: d.file_round,
        seconds: +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
      };
    }),

    d3.csv('data/de_mirage_CounterTerrorist_Flash_10000_locs.csv', function (d) {
      return {
        file_round: d.file_round,
        seconds: +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
      };
    }),

    d3.csv('data/de_mirage_Terrorist_Flash_10000_locs.csv', function (d) {
      return {
        file_round: d.file_round,
        seconds: +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
      };
    }),

    d3.csv('data/de_mirage_CounterTerrorist_HE_10000_locs.csv', function (d) {
      return {
        file_round: d.file_round,
        seconds: +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
      };
    }),

    d3.csv('data/de_mirage_Terrorist_HE_10000_locs.csv', function (d) {
      return {
        file_round: d.file_round,
        seconds: +d.seconds,
        att_side: d.att_side,
        winner_side: d.winner_side,
        nade_land_y: +d.nade_land_y,
        nade_land_x: +d.nade_land_x,
        cluster: +d.cluster,
      };
    })
  ]);
data_promise.then(data => {
  data_ct_example = data[0]
  data_ct_smoke_locs = data[1]
  data_t_smoke_locs = data[2]
  data_ct_flash_locs = data[3]
  data_t_flash_locs = data[4]
  data_ct_he_locs = data[5]
  data_t_he_locs = data[6]
  setTimeout(drawInitial(), 100)
});


function drawInitial() {
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
    .selectAll("circle")
    .data(data_ct_smoke_locs)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .attr("r", 2)
    .style("fill", "#69b3a2")
    .attr("opacity", 0.5);
  nadeEffectColorScale = d3.scaleDiverging(t => d3.interpolateRdBu((t + 1) / 2));

  // Create a legend
  svg.append("g")
    .attr("class", "legendEffect")
    .attr("transform", "translate(20,20)");

  var legendEffect = d3.legendColor()
    .shapeWidth(50)
    .orient('horizontal')
    .cells([-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1])
    .scale(nadeEffectColorScale)
    .title("Effect on round win (R helps T, B helps CT)")


  svg.select(".legendEffect")
    .call(legendEffect)
    .attr('opacity', 0);

  thrower_pos = svg.append('g').attr('class', 'thrower_pos');
  thrower_pos.selectAll("circle")
    .data(data_ct_example)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.att_pos_x)
    })
    .attr("cy", function (d) {
      return yScale(d.att_pos_y)
    })
    .style("fill", function (d) {
      return (d.att_side === "CounterTerrorist") ? "#0000FF" : "#FF0000"
    })
    .attr("r", 6)
    .attr("opacity", 0)

  nade_pos = svg.append('g').attr('class', 'nade_pos');
  nade_pos.selectAll("circle")
    .data(data_ct_example)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return (d.att_side === "CounterTerrorist") ? "#69b3a2" : "#ba4a4a"
    })
    .attr("r", 6)
    .attr("opacity", 0)

  var lineFunction = d3.line()
    .x(function (d) {
      return xScale(d.x);
    })
    .y(function (d) {
      return yScale(d.y);
    })
    .curve(d3.curveNatural);

  nade_path = svg.append('g').attr('class', 'nade_path');
  path_dat = data_ct_example.map(function (d) {
    return {
      points: [
        {x: d.att_pos_x, y: d.att_pos_y},
        // midpoint
        {x: (d.att_pos_x + d.nade_land_x) / 2, y: (d.att_pos_y + d.nade_land_y) / 2 - 50},
        {x: d.nade_land_x, y: d.nade_land_y}
      ],
      color: (d.att_side === "CounterTerrorist") ? "#0000FF" : "#FF0000",
      seconds: d.seconds
    }
  });
  nade_path.selectAll("path")
    .data(path_dat)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", function (d) {
      return lineFunction(d.points)
    })
    .attr("stroke-width", 2)
    .style("stroke", function (d) {
      return d.color
    })
    .style("fill", "rgba(0,0,0,0)")
    .attr("opacity", 0)

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


function draw1() {
  console.log("Drawing draw1");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
    .data(data_ct_smoke_locs)
    .transition().duration(1000)
    .attr("r", 2)
    .style("fill", "#69b3a2")
    .attr("opacity", 0.5)

  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 0);

  thrower_pos.selectAll("circle")
    .transition().duration(1000)
    .attr("opacity", 0)
  nade_pos.selectAll("circle")
    .transition().duration(1000)
    .attr("opacity", 0)
  nade_path.selectAll('path')
    .transition().duration(1000)
    .attr("opacity", 0)
}

function draw2() {
  console.log("Drawing draw2");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
    .transition().duration(1000)
    .attr("opacity", 0)

  var min_seconds = 15.0;
  var max_seconds = 52.0;
  var range_seconds = max_seconds - min_seconds;
  var anim_time = 5000;

  thrower_pos.selectAll('circle')
    .transition().duration(500).delay(function (d) {
    return (d.seconds - min_seconds) / range_seconds * anim_time;
  })
    .attr("opacity", 1)

  nade_path.selectAll('path')
    .transition().duration(500).delay(function (d, i) {
    return (d.seconds - min_seconds) / range_seconds * anim_time + 500;
  })
    .attr("opacity", 1)

  nade_pos.selectAll('circle')
    .transition().duration(500).delay(function (d, i) {
    return (d.seconds - min_seconds) / range_seconds * anim_time + 500;
  })
    .attr("opacity", 1)


  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 0);
}

function draw4() {
  console.log("Drawing draw4");
  let svg = d3.select("#vis").select('svg')
  clean('none')


  thrower_pos.selectAll("circle")
    .transition().duration(1000)
    .attr("opacity", 0)
  nade_pos.selectAll("circle")
    .transition().duration(2000)
    .attr("opacity", 0)
  nade_path.selectAll('path')
    .transition().duration(1000)
    .attr("opacity", 0)

  svg.selectAll('circle')
    .data(data_ct_smoke_locs)
    .transition().duration(2000)
    .attr("r", 2)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", "#69b3a2")
    .attr("opacity", 0.5)

  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 0);
}

function draw5() {
  console.log("Drawing draw5");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  svg.selectAll('circle')
    .data(data_ct_smoke_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return (d.winner_side === d.att_side) ? 'red' : 'blue'
    })
    .attr("opacity", 0.3)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 0);
}

function draw6() {
  console.log("Drawing draw6");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var categorical = [
    {"name": "schemeAccent", "n": 8},
    {"name": "schemeDark2", "n": 8},
    {"name": "schemePastel2", "n": 8},
    {"name": "schemeSet2", "n": 8},
    {"name": "schemeSet1", "n": 9},
    {"name": "schemePastel1", "n": 9},
    {"name": "schemeCategory10", "n": 10},
    {"name": "schemeSet3", "n": 12},
    {"name": "schemePaired", "n": 12},
    {"name": "schemeCategory20", "n": 20},
    {"name": "schemeCategory20b", "n": 20},
    {"name": "schemeCategory20c", "n": 20}
  ]
  var clusterColorScale = d3.scaleOrdinal(d3[categorical[0].name])

  svg.selectAll('circle')
    .data(data_ct_smoke_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return (d.cluster < 0) ? '#000000' : (clusterColorScale(d.cluster))
    })
    .attr("opacity", 0.5)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 0);
}

function draw7() {
  console.log("Drawing draw7");
  let svg = d3.select("#vis").select('svg')
  /*
  * Smoke_CounterTerrorist_cluster_.1  1.637e-01  1.773e-02   9.232  < 2e-16 ***
Smoke_CounterTerrorist_cluster_0   2.865e-01  1.608e-02  17.822  < 2e-16 ***
Smoke_CounterTerrorist_cluster_1   2.247e-01  1.730e-02  12.993  < 2e-16 ***
Smoke_CounterTerrorist_cluster_2   3.229e-01  1.966e-02  16.430  < 2e-16 ***
Smoke_CounterTerrorist_cluster_3   2.205e-01  2.941e-02   7.496 6.60e-14 ***
Smoke_CounterTerrorist_cluster_4   4.999e-02  4.849e-02   1.031 0.302649
Smoke_CounterTerrorist_cluster_5   2.780e-01  8.433e-02   3.297 0.000978 ***
Smoke_CounterTerrorist_cluster_6   4.179e-02  4.951e-02   0.844 0.398556
Smoke_CounterTerrorist_cluster_7   1.834e-01  1.031e-01   1.778 0.075364 .
Smoke_CounterTerrorist_cluster_8   4.396e-01  9.416e-02   4.668 3.04e-06 ***
Smoke_CounterTerrorist_cluster_9   4.004e-02  1.148e-01   0.349 0.727211
  * */
  clean('none')


  var ct_smoke_no_cluster_effect = 1.637e-01;
  var ct_smoke_effectiveness = [];
  ct_smoke_effectiveness[0] = 2.865e-01;
  ct_smoke_effectiveness[1] = 2.247e-01;
  ct_smoke_effectiveness[2] = 3.229e-01;
  ct_smoke_effectiveness[3] = 2.205e-01;
  ct_smoke_effectiveness[4] = 4.999e-02;
  ct_smoke_effectiveness[5] = 2.780e-01;
  ct_smoke_effectiveness[6] = 4.179e-02;
  ct_smoke_effectiveness[7] = 1.834e-01;
  ct_smoke_effectiveness[8] = 4.396e-01;
  ct_smoke_effectiveness[9] = 4.004e-02;

  svg.selectAll('circle')
    .data(data_ct_smoke_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return nadeEffectColorScale((d.cluster < 0) ? ct_smoke_no_cluster_effect : (ct_smoke_effectiveness[d.cluster]))
    })
    .attr("opacity", 0.5)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 1);
}

function draw8() {
  console.log("Drawing draw8");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var t_smoke_no_cluster_effect = -1.756e-01;
  var t_smoke_effectiveness = [];
  t_smoke_effectiveness[0] = -1.294e-01;
  t_smoke_effectiveness[1] = -7.986e-02;
  t_smoke_effectiveness[2] = -2.631e-01;
  t_smoke_effectiveness[3] = -1.068e-01;
  t_smoke_effectiveness[4] = 2.846e-02;
  t_smoke_effectiveness[5] = -2.996e-01;
  t_smoke_effectiveness[6] = -1.631e-01;
  t_smoke_effectiveness[7] = -1.709e-01;
  t_smoke_effectiveness[8] = 4.311e-02;
  t_smoke_effectiveness[9] = 1.061e-01;
  t_smoke_effectiveness[10] = 2.074e-01;
  t_smoke_effectiveness[11] = -4.543e-05;
  t_smoke_effectiveness[12] = -5.249e-02;
  t_smoke_effectiveness[13] = -3.804e-01;
  t_smoke_effectiveness[14] = -1.144e-01;
  t_smoke_effectiveness[15] = 1.505e-02;
  t_smoke_effectiveness[16] = -4.289e-01;
  t_smoke_effectiveness[17] = -4.035e-02;
  t_smoke_effectiveness[18] = -4.998e-02;
  t_smoke_effectiveness[19] = -2.376e-01;
  t_smoke_effectiveness[20] = -4.900e-01;
  t_smoke_effectiveness[21] = -6.606e-01;

  svg.selectAll('circle')
    .data(data_t_smoke_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return nadeEffectColorScale((d.cluster < 0) ? t_smoke_no_cluster_effect : (t_smoke_effectiveness[d.cluster]))
    })
    .attr("opacity", 0.5)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 1);
}

function draw9() {
  console.log("Drawing draw9");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var ct_flash_no_cluster_effect = 1.002e-01;
  var ct_flash_effectiveness = [];
  ct_flash_effectiveness[0] = 2.857e-01;
  ct_flash_effectiveness[1] = 1.989e-01;
  ct_flash_effectiveness[2] = 1.018e-01;
  ct_flash_effectiveness[3] = 2.756e-01;
  ct_flash_effectiveness[4] = 2.460e-01;
  ct_flash_effectiveness[5] = 1.705e-01;
  ct_flash_effectiveness[6] = 5.553e-01;
  ct_flash_effectiveness[7] = 3.106e-01;
  ct_flash_effectiveness[8] = 2.674e-01;
  ct_flash_effectiveness[9] = 2.219e-01;

  svg.selectAll('circle')
    .data(data_ct_flash_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return nadeEffectColorScale((d.cluster < 0) ? ct_flash_no_cluster_effect : (ct_flash_effectiveness[d.cluster]))
    })
    .attr("opacity", 0.5)
}

function draw10() {
  console.log("Drawing draw10");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var t_flash_no_cluster_effect = -1.909e-01;
  var t_flash_effectiveness = [];
  t_flash_effectiveness[0] = -6.751e-02;
  t_flash_effectiveness[1] = 4.564e-02;
  t_flash_effectiveness[2] = -2.689e-02;
  t_flash_effectiveness[3] = -3.948e-03;
  t_flash_effectiveness[4] = -2.737e-01;
  t_flash_effectiveness[5] = 7.255e-02;
  t_flash_effectiveness[6] = -9.037e-03;
  t_flash_effectiveness[7] = -1.832e-01;
  t_flash_effectiveness[8] = -2.353e-01;
  t_flash_effectiveness[9] = -6.354e-02;
  t_flash_effectiveness[10] = -9.516e-02;

  svg.selectAll('circle')
    .data(data_t_flash_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return nadeEffectColorScale((d.cluster < 0) ? t_flash_no_cluster_effect : (t_flash_effectiveness[d.cluster]))
    })
    .attr("opacity", 0.5)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 1);
}

function draw11() {
  console.log("Drawing draw11");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var ct_he_no_cluster_effect = 2.072e-01;
  var ct_he_effectiveness = [];
  ct_he_effectiveness[0] = 1.320e-01;
  ct_he_effectiveness[1] = 2.223e-01;
  ct_he_effectiveness[2] = 1.402e-01;
  ct_he_effectiveness[3] = 5.436e-01;
  ct_he_effectiveness[4] = 3.570e-01;
  ct_he_effectiveness[5] = 4.761e-01;

  svg.selectAll('circle')
    .data(data_ct_he_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return nadeEffectColorScale((d.cluster < 0) ? ct_he_no_cluster_effect : (ct_he_effectiveness[d.cluster]))
    })
    .attr("opacity", 0.5)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 1);
}

function draw12() {
  console.log("Drawing draw11");
  let svg = d3.select("#vis").select('svg')
  clean('none')

  var t_he_no_cluster_effect = -4.506e-01;
  var t_he_effectiveness = [];
  t_he_effectiveness[0] = -3.795e-01;
  t_he_effectiveness[1] = -2.097e-01;
  t_he_effectiveness[2] = -1.773e-01;
  t_he_effectiveness[3] = -1.432e-01;
  t_he_effectiveness[4] = -8.268e-01;
  t_he_effectiveness[5] = -1.986e-01;
  t_he_effectiveness[6] = -7.158e-01;
  t_he_effectiveness[7] = -1.831e-01;
  t_he_effectiveness[8] = -3.663e-01;
  t_he_effectiveness[9] = -1.043e-01;
  t_he_effectiveness[10] = -3.263e-01;
  t_he_effectiveness[11] = -4.573e-01;
  t_he_effectiveness[12] = 8.267e-03;
  t_he_effectiveness[13] = -4.446e-01;
  t_he_effectiveness[14] = -1.510e-01;
  t_he_effectiveness[15] = -7.935e-02;
  t_he_effectiveness[16] = -3.193e-02;
  t_he_effectiveness[17] = -2.247e-01;
  t_he_effectiveness[18] = -2.214e-01;
  t_he_effectiveness[19] = -4.608e-01;
  t_he_effectiveness[20] = -7.192e-01;
  t_he_effectiveness[21] = -3.349e-01;
  t_he_effectiveness[22] = -5.969e-03;

  svg.selectAll('circle')
    .data(data_t_he_locs)
    .transition().duration(1000)
    .attr("cx", function (d) {
      return xScale(d.nade_land_x)
    })
    .attr("cy", function (d) {
      return yScale(d.nade_land_y)
    })
    .style("fill", function (d) {
      return nadeEffectColorScale((d.cluster < 0) ? t_he_no_cluster_effect : (t_he_effectiveness[d.cluster]))
    })
    .attr("opacity", 0.5)
  svg.select(".legendEffect")
    .transition().duration(1000)
    .attr('opacity', 1);
}

function draw13() {

}

function draw14() {

}

function draw15() {

}
