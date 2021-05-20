var svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg1.setAttribute("viewBox", [-width / 2, (-height / 2) - 25, width - 100 , height])
svg1.setAttribute("width", width)
svg1.setAttribute("height", height)
//svg.attr("viewBox", [-width / 2, (-height / 2) - 25, width - 100 , height])
//.attr("width", width) // + margin.left + margin.right)
//.attr("height", height)
console.log(svg1)
var pt = svg1.createSVGPoint();

// pass event coordinates
pt.x = x;
pt.y = y;

const svgP = pt.matrixTransform( svg1.getScreenCTM().inverse() );
console.log("new coord:", svgP.x, svgP.y)



function chart() {
  // Circle for each node.
  circle = circle
    .data(nodes, d=> d.id)
    .join(
      enter => enter.append("circle")
          .call( enter => enter
            .attr("id", d=> {
              console.log("Enter circle ", d.id)
              return d.id
            })
            .attr("cx", d => d.xOffset)
            .attr("cy", d => d.yOffset)
            .attr("r", d => d.r)
            .attr("fill", d => color(d, colorMap))
            .attr("stroke", "orange")
            .attr("stroke-width", d => d.labelFlag ? 3.0 : 0))
          .call( enter => enter.select('circle')//.transition().duration(150)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y))
          .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)),
          //.call( enter => enter
          //  .attr("id", d=> d.id)
          //  .attr("cx", d => d.x)
          //  .attr("cy", d => d.y)
          //  .attr("r", d => d.r)
          //  .attr("fill", d => color(d, colorMap))
          //  .attr("stroke", "orange")
          //  .attr("stroke-width", d => d.labelFlag ? 3.0 : 0)),
      update => update
          //.attr("r", radius)
          //.attr("cx", d => {if(d.voto != d.lastvoto) return d.x})
          //.attr("cy", d => {if(d.voto != d.lastvoto) return d.y})
          .attr("stroke-width", d => d.labelFlag ? 3.0 : 0)
          .attr("fill", d => {
            console.log("update ", d.id)
            return color(d, colorMap)
          }) ,
      exit => exit.remove()
    )
    
  circle.on("mouseover", tip.show).on("mouseout", tip.hide)

  texts = texts
      .data(nodes, d=> d.id)
      .join("text") 
      .attr('visibility', d=> d.labelFlag ? 'visible' : 'hidden' )
      .attr('id', d=> 'text'+d.numeroid)
      .text(d=> d.nombre)
      //.transition().ease(d3.easeSinOut).duration(500)
      .attr('x', d=> d.x )//+ d.vx * .0135)
      .attr('y', d => d.y ) // + d.vy * .0135)
      

  // Group name labels
  svg.selectAll('.grp')
    .data(d3.keys(groups))
    .join("text")
    .attr("class", "grp")
    .attr("text-anchor", "middle")
    .attr("font-size", "1rem")
    .attr("x", d => groups[d].x)
    .attr("y", d => groups[d].y - 50)
    .text(d => groups[d].fullname + ' ('+groups[d].cnt+')' );
  

  simulation.nodes(nodes, d=> d.id)
      //.force("x",  d => d3.forceX(d.x/2).strength(.0005))
      //.force("y", d => d3.forceY(d.y/2).strength(.0005))

  //simulation.force("cluster", forceCluster())
  //          .force("collide", forceCollide())
  
  simulation.on("tick", () => {
    circle
      .transition()
      .duration(30)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

    texts.transition().ease(d3.easeSinOut).duration(400)
      .attr("x", d => d.x + 10)//+ d.vx * .0135)
      .attr("y", d => d.y + d.vy * .0135 )
  });
}

function outputEntidades2 (matches, option) {
  /**<div  class=" card py-2 </div> "> */
  const header = 
    `<div class="card mb-4">
      <a href="#collapse+${option}" class="d-block card-header py-3" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
        <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">${option}</h6>
      </a>
      <div class="collapse show" id="collapse+${option}">
        <div id="body-${option}" class="card-body">
        </div>
      </div>
    </div>`

  entityList.innerHTML += header

  if (matches.length > 0){
    const html = matches.map(match => 
      `<div class="d-flex flex-row ml-4">
       
         <div class=" d-flex flex-row l mb-1 " style="align-items: center;">

          <svg height="12" width="12" class="mr-3"><circle cx="5" cy="5" r="5"  fill="${color(match[0], colorMap)}" /></svg>
          <span class="mr-2" style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${match[0]} </span>
          
         </div>
         <div class=" d-flex flex-row mb-1 ml-4" style="align-items: center;">
          <span class="mr-2" style="color: #54575b ; text-transform:capitalize"> (${match[1].length}) Asambleistas</span> 
         </div>
         
      </div>`
    ).join('');
    //console.log(html)
    let entidadesListCard = document.getElementById('body-'+option);
    console.log(entidadesListCard)
    //entityList.innerHTML += html
    entidadesListCard.innerHTML += html

  
  } 
}


/**V5 antiguo timeline */

/**
 * <div class="card mb-4">
              <div class="col-xl-12 col-lg-12">
                <div class="d-flex flex-column card-header py-3 sectionHeader">
                  
                  <div class="d-flex flex-row">
                    <div id="lineCont" class="m-4"> 
                      <div id="line"></div>  
                    </div>
                    <a href="#collapseCardExample"  class="card-header py-3 sectionHeader" data-toggle="collapse" role="button" aria-expanded="true" 
                    aria-controls="collapseCardExample"> </a>
                  </div>

                </div>
              </div>

              <div class="collapse show" id="collapseCardExample">
                <div class="card-body">
                  <div class="d-flex flex-column">
                    <!--
                      <div class="d-flex flex-column">
                      <span>Para hacer Zoom in/out, mantener presionado Shift</span>
                      <span>Usar Scroll del mouse para desplazarse horizontalmente</span>
                    </div>
                    <div class="d-flex flex-row">
                      <input class="mt-1" type="button" id="fit" value="Restablecer visión" />
                    </div>
                    <br>
                    
                    
                    <!-- 
                      <div id="searchVotesArea" class="p-4">
                      <div class="mb-4 input-group  col-xl-6 col-lg-6" >
                        <div class="input-group-append mr-2 align-self-center">
                            <a class="rounded-circle" style="color: #54575b">
                                <i class="fas fa-search fa-lg"></i>
                            </a>    
                        </div>

                        <input onClick="this.select();" type="text" id="searchVotes" class="align-self-center form-control bg-light small" placeholder="Buscar Votaciones ..." aria-label="Search" aria-describedby="basic-addon2" style="border: #54575b 1px solid;" >
                        
                      </div>
                     
                      <div  class="p-2 d-flex flex-column" id="votesList"></div> 
                         
                    </div>
                    -->

                  </div>
                </div>
              </div>
            </div>
 */