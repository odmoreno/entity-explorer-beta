/**Barchar */


var LOGB = false

var marginT = { left:80, right:20, top:50, bottom:100 };

var widtht = 200 - marginT.left - marginT.right,
    heightt = 400 - marginT.top - marginT.bottom;
    
var groupSpacing = 6;

var barchararea;
initBarchart = () => {
    barchararea = d3.select("#barchar-area")
    .append("svg")
        //.attr("width", 100 + marginT.left + marginT.right)
        .attr("width", "100%")
        .attr("height", heightt + marginT.top + marginT.bottom)
    .append("g")
        .attr("id", "barchartG")
        .attr("transform", "translate(" + marginT.right + ", " + marginT.top + ")");


    // X Label
    barchararea.append("text")
        .attr("y", (heightt + 50))
        .attr("x", (widtht / 2) + 30)
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("font-family", "Nunito")
        .text("Votos");

}

updateBarchart = (data, grafo) => {
    //let listValues = Object.values(data)
    //let liskeys = Object.keys(data)

    //d3.select("#barchartG").remove()
//////
    //barchararea.append("g")
    //    .attr("id", "#barchartG")
    //    .attr("transform", "translate(" + marginT.right + ", " + marginT.top + ")");

    let datanew = []
    for (let key in data) {
        let xdata = {
            voto: codeVotes[key],
            valor: data[key],
            code: key
        }
        datanew.push(xdata)
    }
    
    datanew.sort((a, b) => (a.valor < b.valor) ? 1 : ((b.valor < a.valor) ? -1 : 0))
    LOGB && console.log("DATA BAR:", datanew)
    
    // X Scale
    var x = d3.scaleBand()
        .domain(datanew.map(function(d){ return d.voto }))
        .range([0, widtht+150])
        //.padding(0.2);

    // Y Scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(  datanew.map(function(d){ return d.valor }) )])
        .range([heightt, 0]);


    var xAxisCall = d3.axisBottom(x);
    barchararea.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightt +")")
        .call(xAxisCall)
        .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .text("")

    // Y Axis
    var yAxisCall = d3.axisLeft(y)
        .tickFormat(function(d){ return  d; });
    
    barchararea.select(".yAxis").remove()
    barchararea.append("g")
        .attr("class", "yAxis")
        .call(yAxisCall);

    // Bars
    barchararea.selectAll("rect").remove()

    var rects = barchararea.selectAll("rect")
        .data(datanew)
        
    
    //console.log("Yvalor:",  y(d.valor))
    //console.log("resta:",  (heightt- y(d.valor)) )
    //var resta = heightt - y(d.valor)
    rects.enter()
        .append("rect")
            .attr("y", function(d){ return y(d.valor); })
            .attr("x", function(d){ return x(d.voto) })
            .attr("height", function(d){ return (heightt - y(d.valor)) })
            .attr("width", function() {  return (x.bandwidth() - groupSpacing)})
            .attr("fill", d => grafo.colorVotos(d.code))
        
    LOGB && console.log("BAND:", (x.bandwidth()/2), x.bandwidth(), groupSpacing, x.bandwidth() - groupSpacing)
    
    barchararea.selectAll(".numerosGrupos").remove()
    rects.append("g").attr("id", "legend").data(datanew)
        .enter()
        .append("text")
        .attr("class", "numerosGrupos")
        .attr("x", function(d){
            return x(d.voto) + ((x.bandwidth()/2) +2 ) 
        })
        .attr("y", function(d){
            return (y(d.valor) - 10)
        })
        .text(function(d) { 
            var per= (( d.valor/ 137) * 100).toFixed(2)
            if (d.valor == 0) return ""
            return d.valor + "  " + per + " %"
        })
        .call(wrap, 80)
}