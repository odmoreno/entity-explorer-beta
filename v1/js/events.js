


console.log(eventDrops)
console.log(d3)
console.log(d3.chart)
var eventDropsChart = eventDrops(d3);
console.log(eventDropsChart)

var global = global || window;


var tip = d3.tip().attr('class', 'd3-tip')
  .html(function (d) {
    //console.log(d)
    var html = `<div class="d-flex flex-column" id="tooltip">
                <strong class="p-1 textTip"><span style="color: #1375b7" >${d.id}</span></strong>
                <span class="p-1"><span style='text-transform:capitalize' >${d.date}</span></span>
        </div>`;
    return html
});


const chart = eventDrops({
  range: {
    start: new Date('03/01/2018 6:55:11 PM'),
    end: new Date('03/06/2018 7:15:11 PM')
  },
  drop: {
    date: d => d.date,
    onClick: d => {
      console.log(`Data ${d.id} has been clicked!`);
    },
    onMouseOver: d => {
      console.log(`Data ${d.id} has been Mouseover!`);
      tip.show(d)
    },
    onMouseOut: d => {
      console.log(`Data ${d.id} has been out`);
      tip.hide()
    },
  },
  indicator: {
    previousText: '◀',
    nextText: '▶',
  },
  axis: {
    formats: {
        milliseconds: '%L',
        seconds: ':%S',
        minutes: '%I:%M',
        hours: '%I %p',
        days: '%a %d',
        weeks: '%b %d',
        months: '%B',
        year: '%Y',
    },
    verticalGrid: true,
    tickPadding: 6,
  },
  zoom: {
    onZoomStart: null,
    onZoom: null,
    onZoomEnd: null,
    minimumScale: 1,
    maximumScale: Infinity,
  },
});

/**
 * const repositoriesData = [
  {
      name: 'admin-on-rest',
      data: [{ date: new Date('2020/09/15 14:21:31') } ],
  },
  {
      name: 'event-drops',
      data: [{ date: new Date('2019/09/15 13:24:57') } ],
  },
  {
      name: 'sedy',
      data: [{ date: new Date('2019/09/15 13:25:12') } ],
  },
];
 */

const repositoriesData = [{
  name: "intake",
    data: [
      { date: new Date('03/02/2018 6:55:11 PM'), id: 'Sesion 1' },
      { date: new Date('03/02/2018 10:56:11 PM'), id: 'Sesion 2' },
      { date: new Date('03/03/2018 6:57:11 AM'), id: 'Sesion 3' },
    ]
}, {
  name: "eligibility",
    data: [
      { date: new Date('03/03/2018 6:58:09 PM'), id: 'Sesion 4' },
      { date: new Date('03/03/2018 11:58:09 PM'), id: 'Sesion 5' },   ]
}, {
  name: "assessment",
    data: [
      { date: new Date('03/04/2018 6:59:09 PM'), id: 'Sesion 6' }
    ]
}, {
  name: "dispute resolution",
    data: [
      { date: new Date('03/05/2018 7:01:09 AM'), id: 'Sesion 1' }
    ]
}, {
  name: "compliance",
    data: [
      { date: new Date('03/05/2018 7:05:09 PM'), id: 'Sesion 1' }
    ]
}, {
  name: "closure",
    data: [
      { date: new Date('03/05/2018 11:12:07 PM'), id: 'Sesion 1' }
    ]
}]

let dataF = []

repositoriesData.map( v=> {
  //console.log(v.data)
  v.data.forEach((dates) => {
    //console.log(dates.date)
    dataF = [...dataF, dates]
  })
  //return v.data
})
console.log("dates:", dataF)

/**
 * const chart = eventDrops({
  range: {
    start: new Date('2014/09/15 14:21:31'),
    end: new Date('2014/09/15 13:25:12')
  },
  drop: {
    date: d => d.date,
  },
});
 */

/*
var config = {
  start: new Date('2014/09/15 14:21:31'),
  end: new Date('2014/09/15 13:25:12')  
};

var eventDropsChart = d3.chart.eventDrops();
d3.select('#chart')
  .datum(data())
  .call(eventDropsChart);
*/

let margin = {top: 20, right: 20, bottom: 30, left: 40}
let width = 1249
let height = 320
let focusHeight = 100

let div = d3.select('#eventdrops-demo')
  .data([repositoriesData])
  //.call(eventDropsChart);
  .call(chart)

let svg = div.select('svg')
  .call(tip)

console.log("CHART:", svg)


area = (x, y) => {
  d3.area()
    .defined(d => !isNaN(d.value))
    .x(d => x(d.date))
    .y0(y(0))
    .y1(d => y(d.value))
  }

x = d3.scaleUtc()
  .domain(d3.extent(dataF, d => {
    //console.log(dataF)
    //console.log(d)
    //console.log(d.date)
    return d.date
  }))
  .range([margin.left, width - margin.right])

y = d3.scaleLinear()
  .domain([0, 10])
  .range([height - margin.bottom, margin.top])

xAxis = (g, x, height) => g
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

var svg1 = d3.select("#chart").append("svg")
  .attr("viewBox", [0, 0, width, focusHeight])
  .attr("width", width)//  + margin.left + margin.right)
  .attr("height", height)
  //.style("display", "block");

  console.log(svg1)

const brush = d3.brushX()
  .extent([[margin.left, 0.5], [width - margin.right, focusHeight - margin.bottom + 0.5]])
  .on("brush", brushed(this))
  //.on("end", brushended);

const defaultSelection = [x(d3.utcYear.offset(x.domain()[1], -1)), x.range()[1]];

svg1.append("g")
  .call(xAxis, x, focusHeight);

svg1.append("path")
  .datum(dataF)
  .attr("fill", "steelblue")
  .attr("d", area(x, y.copy().range([focusHeight - margin.bottom, 4])));

var gb = svg1.append("g")
  .call(brush)
  .call(brush.move, defaultSelection);

function brushed(event) {
  console.log(event)
  const selection = event.selection;
  console.log(selection)
  if (selection) {
    console.log('hey brushed')
    svg1.property("value", selection.map(x.invert, x).map(d3.utcDay.round));
    svg1.dispatch("input");
  }
}

function brushended() {
  gb.call(brush.move, defaultSelection)
}

