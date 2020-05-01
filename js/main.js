// INITIALIZE SCROLLER
let scroll = scroller().container(d3.select('#graphic'))
scroll()
let lastIndex = undefined
let activeIndex = 0
//This is where most of the magic happens. Every time the user scrolls, we receive a new index. First, we find all the irrelevant sections, and reduce their opacity.
scroll.on('active', function(index){
  d3.selectAll('.step')
    .transition().duration(500)
    .style('opacity', function (d, i) {return i === index ? 1 : 0.3;});
//Next, we selection from a range of activationFunctions (which we create), based on the index of the current section.
  activeIndex = index
  let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
  let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
  scrolledSections.forEach(i => {
    activationFunctions[i]();
  })
  lastIndex = activeIndex;
})
//I placed all the functions in an array. Each function corresponds to a different change in the visualisation. One may change the graph into a scatter plot, and another may initiate a force simulation.
let activationFunctions = [
  draw1,
  draw2,
  draw4,
  draw5,
  draw6,
  draw7,
  draw8,
  draw9,
  draw10,
  draw11,
  draw12,
  draw13,
  draw14,
  draw15
]

