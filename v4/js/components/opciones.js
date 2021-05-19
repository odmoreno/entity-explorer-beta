/** 
 * Funciones secundarias o extras para el entidades.js
 * 
 */

var LOGO = true

let sesionList = {}

let sesionElementList = document.getElementById('sesiones-list');

let optionSort = 1

let dictEntidades = {
  'Región': {label: false, name: 'region'},
  'Partido': {label: false, name: 'partidos'},
  'Provincia': {label: false, name: 'provincia'},
}

let dictElements ={}


/** Conjunto de funciones encargadas de manejar la lista de sesiones */
function addSesionToList (id){
  sesionList[id] = sesiones[id]
  updateSesionList()
}

function updateSesionList() { 

  let list = Object.values(sesionList)
  list.sort((a, b) => (a.sesId > b.sesId) ? 1 : ((b.sesId > a.sesId) ? -1 : 0))
  LOGO && console.log("sorted:", list)
  sesionElementList.innerHTML = '' 
  if (list.length > 0){
    const html = list.map(data => 
        `<div class="d-flex flex-row" style="align-items: center;">
          <div class="mr-2"> 
            <a href=${'#card' + data.sesId} class="d-block card-subtitle py-3" data-toggle="collapse" role="button" aria-expanded="false" aria-controls="collapseCard"
              data-toggle="tooltip" data-placement="top" title="${data.asunto}" style="text-align: center;">
              <div class="d-flex flex-row">
                <div class="d-flex flex-column">
                  <span class="m-1 text-secondary">Sesion ${data.sesion} Votacion ${data.votacion}</span>
                  <small class="m-1 text-primary"> ${data.fecha} (${data.hora})</small>
                </div>
                <button type="button" id="btn-remove ${data.sesId}" class="btn btn-special btn-success btn-circle btn-sm ml-4" onclick="removeSeslist(this.id)"><i class="fas fa-minus"></i></button>
              </div>
            </a>
            <div class="collapse" id=${'card' + data.sesId} >
                <div class="card-body">
                  <span style="text-transform:capitalize;">${data.asunto}</span>
                  
                </div>
            </div>
          </div>
          
        </div>`
    ).join('');
    //console.log(html)
    sesionElementList.innerHTML += html
  }
}

removeSeslist = (id2) => {
  LOGO && console.log("remove ses ", id2)
  let splitid = id2.split(" ")
  let id = splitid[1]
  LOGO && console.log(splitid)

  delete sesionList[id]
  updateSesionList()

  removeCircle(id)

  console.log(idSesiones)

  delete idSesiones[id]
}

/**Fin de lista de sesiones */


/**Conjunto de funciones para manejar la lista de asambleistas filtrados
 * 
 * <input class="mr-2" type="checkbox" id=${'A'+element.numeroId } onclick="onGetIdList(this.id)"  ${element.visitado ? 'checked' : ''} ></input>
 */

//let entityList = {}

let entityList = document.getElementById('entity-list');
let listaResultados = document.getElementById('resultadosDiv');

function ListEntitys (nodos) {
  let list = Object.values(nodos)
  console.log("LIST:", list)
  
  list = list.filter(element => element.visitado)
  //list.sort(value => { return value.visitado ? -1 : 1})

  //entityList.innerHTML = ''


  const html = list.map(element => 
    `<div  id="e${element.numeroId}"  class="card-list py-2 nodrag noselect"   
      style="border-bottom-color: ${element.visitado ? color(element, colorMap) : '#e3e6f0'};">
        
        <div class="d-flex flex-row ml-4 justify-content-between">
          <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

            <svg height="12" width="12" class="mr-3"><circle cx="5" cy="5" r="5"  fill="${color(element, colorMap)}" /></svg>

            <span class="${element.visitado ? 'entitySelected': 'entityAway'}"  
                  onmouseover="overEntity(${element.numeroId})" onmouseleave="onLeaveEntity(${element.numeroId})"> 
                    ${element.nombre} </span>
          </div>
          <div class="dropdown no-arrow">
            <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fas fa-ellipsis-h fa-sm fa-fw text-gray-400"></i>
            </a>
            <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in" aria-labelledby="dropdownMenuLink">
              <div class="dropdown-header">Opciones:</div>
                <a class="dropdown-item" onclick="removeEntityChart(${element.numeroId})" style="display: ${element.visitado ? 'block': 'none'} ;">Remover del gráfico</a>
                <a class="dropdown-item" id="quitar${element.numeroId}" onclick="quitarResaltado(${element.numeroId})" style="display: ${element.visitado && element.labelFlag ? 'block': 'none'} ;">Quitar resaltado</a>
                <a class="dropdown-item" id="fijar${element.numeroId}" onclick="fijarResaltado(${element.numeroId})" style="display: ${element.visitado && !element.labelFlag ? 'block': 'none'} ;">Fijar resaltado</a>
            </div>
          </div>
        </div>
    </div>`
  ).join('');

  entityList.innerHTML += html
}

function sortByOption(op, nodosDesordenados){

  let list = [... Object.values(nodosDesordenados)]
  //nodos.sort((a, b) => (a.curul > b.curul) ? 1 : ((b.curul > a.curul) ? -1 : 0))
  if(op == 1){
    list.sort((a, b) => (a.nombre > b.nombre) ? 1 : ((b.nombre > a.nombre) ? -1 : 0))
  }
  else if (op == 2){
    list.sort((a, b) => (a.partido > b.partido) ? 1 : ((b.partido > a.partido) ? -1 : 0))
  }
  else if (op == 3){
    list.sort((a, b) => (a.region > b.region) ? 1 : ((b.region > a.region) ? -1 : 0))
  }
  else if (op == 4){
    list.sort((a, b) => (a.provincia > b.provincia) ? 1 : ((b.provincia > a.provincia) ? -1 : 0))
  }
  else if (op == 5){
    list.sort((a, b) => (a.voto > b.voto) ? 1 : ((b.voto > a.voto) ? -1 : 0))
  }

  console.log("sorted: ", list)
  return list
}

function sortHandler(val){
  optionSort = val
  sortFunction(nodosActuales)
}

function sortFunction(nodos){
  let list = sortByOption(optionSort, nodos)
  entityList.innerHTML = ''
  ListEntitys(list)
}

/**Funciones del dropdown menu de cada entidad */

function addEntityChart(id){
  let sid = 's'+id
  onGetIdList(sid, 500, 300)
  
}

function removeEntityChart(id){
  entidades[id].visitado = false
  updateChartEntitys()
  findEntities(valueText)
}

function fijarResaltado(id){
  console.log('Fijar ID:', id)
  let nodoCircle = d3.select("#node"+id)
  console.log("Stroke:", nodoCircle.style("stroke"))

  nodoCircle.attr("stroke", "orange")
            .attr("stroke-width", 3.0)

  d3.select('#text' + id).attr("visibility", "visible")

  entidades[id].labelFlag = true

  d3.select('#fijar'+id).style("display", "none")
  d3.select('#quitar'+id).style("display", "block")
}

function quitarResaltado(id){
  d3.select("#node"+id).attr("stroke", "#fff").attr("stroke-width", 0)
  d3.select('#text' + id).attr("visibility", "hidden")

  entidades[id].labelFlag = false
  d3.select('#fijar'+id).style("display", "block")
  d3.select('#quitar'+id).style("display", "none")
}
// Fin de las funciones del menu de entidades

function overEntity(id){
  //console.log("ID ENTITY:", id)
  let element = nodosActuales[id]
  //console.log(element)
  if(element.visitado){
    d3.select("#node"+id).attr("stroke", "orange").attr("stroke-width", 3.0)
    d3.select('#text' + id).attr("visibility", "visible")
    //tip3.show(element)
  }  
}

function onLeaveEntity(id){
  let element = nodosActuales[id]
  if(element.visitado && !element.labelFlag){
    d3.select("#node"+id).attr("stroke", "#fff").attr("stroke-width", 0)
    d3.select('#text' + id).attr("visibility", "hidden")
  
  }
  
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev) {
  ev.preventDefault();
  console.log("Hola, ingreso de entidad en el svg")
  var data = ev.dataTransfer.getData("text")
  var id = document.getElementById(data)
  var x = ev.offsetX
  var y = ev.offsetY

  let idnew = data.substring(0,1)

  console.log(ev)
  console.log(data, x, y)
  //console.log(d3.select(ev.target).attr('id'))
  console.log(id)
  console.log(idnew)
  //onGetIdList(data, x, y)
 // var data = ev.dataTransfer.getData("text");
 // ev.target.appendChild(document.getElementById(data));

  if( idnew == 'e'){
    //Mover una entidad
    onGetIdList(data, x, y)
  }
  else if (idnew == 'o'){
    //Mover un grupo
    console.log("Mover muchos ", data)
    addAllEntities(data, x, y)
  }

}

function findEntities (searchText) {
  //entityList.innerHTML = ''
  listaResultados.innerHTML = ''
  
  let text = searchText.toLowerCase()
  if(text == 'partidos')
      filterPartidos(searchText, true)     
  else if (text.includes("regi"))
      filterRegion(searchText, true)
  else if ( text.includes("prov") )
      filterProv(searchText, true)    
  else if ( text.includes("comision") )
      filterComisiones(searchText, true)    
  else {
      //entityList.innerHTML = ''
      filterPartidos(searchText, false)
      filterRegion(searchText, false)
      filterProv(searchText, false)
      filterAsams(searchText, false)
      //filterComisiones(searchText, false)
  }
  
  if(searchText === "") listaResultados.innerHTML = ''

}

filterAsams = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = Object.values(nodosActuales).filter(sess => {
      return sess.id.match(regex)
  })
  console.log("asams filtrados: ", matches)
  //sortFunction(matches)
  outputAsambleistas(matches)

}

filterPartidos = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
  //sess.partido == text
  
  let matches = []
  matches = Object.keys(partidos).filter(partido => {
    return partido.match(regex)
  })

  //console.log("matches list partidos:", matches)
  let results;
  if(matches.length > 1){
    results = buscarPartidosOpciones(matches)
    outputEntidades(results, 'Partido')
  }
  else if(matches.length == 1){
    results = buscarPartidosOpciones(matches)
    outputEntidades(results, 'Partido')
    let asambsunitario = results[0][1]
    //initializeList(asambsunitario)
    //ListEntitys(asambsunitario)
    //sortFunction(asambsunitario)
    outputAsambleistas(asambsunitario)
    
  }

}

buscarPartidosOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsPartidos = Object.values(nodosActuales).filter(sess => {
      return sess.partido.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsPartidos)
    data.push(info)
  })
  //console.log("Lista de lista:", data)
  return data
  
}

filterRegion = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

  let matches = []
  matches = Object.keys(regiones).filter(region => {
    return region.match(regex)
  })

  let results;
  if(matches.length > 1){
    results = buscarRegionOpciones(matches)
    outputEntidades(results, 'Región')
  }
  else if(matches.length == 1){
    results = buscarRegionOpciones(matches)
    outputEntidades(results, 'Región')
    let asambsunitario = results[0][1]
    //initializeList(asambsunitario)
    //ListEntitys(asambsunitario)
    //sortFunction(asambsunitario)
    outputAsambleistas(asambsunitario)
  }

}

buscarRegionOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsRegion = Object.values(nodosActuales).filter(sess => {
      return sess.region.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsRegion)
    data.push(info)
  })
  //console.log("Regiones:", data)
  return data
  
}

filterProv = (text, flag) => {
  const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
  
  let matches = []
  matches = Object.keys(provincias).filter(prov => {
    return prov.match(regex)
  })
  
  console.log("matches:", matches, regex)
  
  let results;
  if(matches.length > 1){
    results = buscarProvinciasOpciones(matches)
    outputEntidades(results, 'Provincia')
  }
  else if(matches.length == 1){
    results = buscarProvinciasOpciones(matches)
    outputEntidades(results, 'Provincia')
    let asambsunitario = results[0][1]
    //initializeList(asambsunitario)
    //ListEntitys(asambsunitario)
    //sortFunction(asambsunitario)
    outputAsambleistas(asambsunitario)
  }

}

buscarProvinciasOpciones = (list) => {
  let data = []
  list.forEach( op => {
    let partido = op.toLowerCase()
    let asambsRegion = Object.values(nodosActuales).filter(sess => {
      return sess.provincia.match(partido)
    })
    let info = []
    info.push(partido)
    info.push(asambsRegion)
    data.push(info)
  })
  console.log("Provincias:", data)
  return data
  
}

/**Checkear las entidades y meterlas al canvass */
function onGetIdList(id, x , y){
  console.log("ADD:", id, x , y)
  let idnew = id.substring(1)
  console.log(idnew)

  let element = asambleistas[idnew]

  if(element.visitado == false){
    if (!(element.numeroId in entidades)){
      entidades[element.numeroId] = element
      entidades[element.numeroId].xOffset = x +170
      entidades[element.numeroId].yOffset = y +80
      console.log(entidades, d3.values(entidades).length)
    }
    else{
      entidades[element.numeroId].visitado = true
    }
    element.visitado = true
    console.log("checked", element.visitado);
    updateNodes()
  }
  else {
    entidades[element.numeroId].visitado = false
    updateNodes()
  }
}

function updateNodes () {

  let newnodes = []
  for (let key in entidades) {
    if(entidades[key].visitado == true) newnodes.push(entidades[key])
  }
  console.log("newnodes:", newnodes)
  groups = _groups()
  nodes = createNodes(newnodes, groups)
  colorMap = $('#colores-select').val() 

  entityList.innerHTML = ''
  //initializeList(nodosActuales)
  //ListEntitys(nodosActuales)
  sortFunction(nodosActuales)
  findEntities(valueText)
  d3.timeout(chart, 500)
  //updateTable(nodes)


}

//Add todas las entidades del grupo
function addAllEntities(id, x, y){
  console.log("ADD:", id, x , y)
  let idnew = id.substring(1)
  console.log(idnew)

  let listElements = dictElements[idnew]
  console.log("grupo: ", listElements)

  console.log("entidades prev: ", entidades)

  for(let index in listElements){
    let element = listElements[index]
    console.log(element)
    let idEl = element.numeroId
    entidades[idEl] = element
    entidades[idEl].xOffset = x +170
    entidades[idEl].yOffset = y +80
    entidades[idEl].visitado = true
  }

  console.log("entidades next: ", entidades)

  updateNodes()
}


/**Lista de entidades Individuales */
function outputAsambleistas (nodos) {
  let list = Object.values(nodos)
  console.log("LIST:", list)
  list.sort(value => { return value.visitado ? 1 : -1})

  if (list.length > 0){
    const header = 
      `<div class="card-listU">
        <a href="#collapseAsambs2" class="d-block card-headerU py-2" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
          <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">Asambleístas</h6>
        </a>
        <div class="collapse show" id="collapseAsambs2">
          <div id="bodyAsambs2" class="card-body">
          </div>
        </div>
      </div>`

    listaResultados.innerHTML += header
    const html = list.map(element => 
      `<div  id="e${element.numeroId}"  class="card-listU py-1 ${!element.visitado ? 'draggme' : 'nodrag2 noselect'}"
          draggable="${!element.visitado ? true : false}" ondragstart="drag(event)" 
          style="border-bottom-color: ${element.visitado ? color(element, colorMap) : '#e3e6f0'};">

          <div class="d-flex flex-row ml-3 justify-content-between">
            <div  class=" d-flex flex-row l mb-1" style="align-items: center;">

              <svg height="12" width="12" class="mr-3"><circle cx="5" cy="5" r="5"  fill="${color(element, colorMap)}" /></svg>

              <span class="${element.visitado ? 'entitySelected': 'entityAway'}"  >
                      ${element.nombre} </span>
            </div>
          </div>
      </div>`
    ).join('');

    let entidadesListCard = document.getElementById('bodyAsambs2');
    entidadesListCard.innerHTML += html
  }
  
}

/**Lista de grupos de entidades */
function outputEntidades (matches, option) {
  /**<div  class=" card py-2 </div> "> */
  const header = 
    `<div class="card-listU">
      <a href="#collapse${option}" class="d-block card-headerU py-2" data-toggle="collapse" role="button" aria-expanded="true" aria-controls="collapseCardExample">
        <h6 class="m-0 font-weight-bold text-primary" style="text-transform:capitalize">${option}</h6>
      </a>
      <div class="collapse show" id="collapse${option}">
        <div id="body-${option}" class="card-body">
        </div>
      </div>
    </div>`

  listaResultados.innerHTML += header

  //console.log('matches:', matches)
  //console.log("name: ", matches[0][0].replaceAll(/\s/g,''))
  let element = dictEntidades[option]
  
  if (matches.length > 0){
    const html = matches.map(match => 
      `<div id="o${match[0].replaceAll(/\s/g,'')}" class="card-listU py-1 ${!element.flag ? 'draggme' : 'nodrag'}" 
        draggable="${!element.flag ? true : false}" ondragstart="drag(event)" 
        
          style="border-bottom-color: ${element.flag ? fillColorByType(match[0], element.name) : '#e3e6f0'};">
        
        <div class="d-flex flex-row ml-3 justify-content-between">
            
          <div  class=" d-flex flex-row l mb-1" style="align-items: center;">
          <svg height="15" width="25" class="mr-1">
              <g stroke="black" stroke-width="1">
                <circle cx="6" cy="6" r="5"  fill="${fillColorByType(match[0], element.name)}" />
                <circle cx="12" cy="6" r="5"  fill="${fillColorByType(match[0], element.name)}" />
                <circle cx="9" cy="10" r="5"  fill="${fillColorByType(match[0], element.name)}" />
              </g>
            </svg>
            <span class="${element.flag ? 'entitySelected': 'entityAway'}"  
                  onmouseover="overEntidades()" onmouseleave="onLeaveEntidades()"> 
                    ${match[0]} </span>
          </div>
          <div class="cantidad">
            <span class="mr-2" style="color: #54575b ; text-transform:capitalize"> (${match[1].length}) Asambs.</span>
          </div>
        </div>
      </div>`
      ).join('');
    //console.log(html)
    let entidadesListCard = document.getElementById('body-'+option);
    //console.log(entidadesListCard)
    //entityList.innerHTML += html
    entidadesListCard.innerHTML += html

    updateDictEntities(matches)
  } 
}

function fillColorByType(d, option){
  let color;
  if (option == 'partidos'){
    color = colorPartidos(partidos[d])
  }
  else if(option == 'region'){
    color = colorRegions(regiones[d])
  }
  else if ( option == "provincia") 
    color = colorProvincias(provincias[d])

  console.log('color')
  return color
}

function overEntidades(){}

function onLeaveEntidades(){}

function updateDictEntities(matches){

  matches.map(match => {
    let code = match[0].replaceAll(/\s/g,'')
    dictElements[code] = match[1]
  })
  console.log("dict de entidades :", dictElements)
}
/**Fin de lista de entidades */

/**Fin de lista de asamblelistas */


/** Funciones para el buscador de asambleistas dentro del canvas */

const asambslist = document.getElementById('asambleistasList');
const pinnedlist = document.getElementById('pinnedList');
let pinnedElements = {}
let matches = []

function buscarAsambleistas (searchText, nodos) {
    asambslist.innerHTML = ' '
    matches = []
    showPinnedAssamb()
    if (searchText == '')
        asambslist.innerHTML = ' '
    else {
        console.log(searchText)
        //console.log(nodos)
        const regex = new RegExp(`\\b.*${searchText}.*?\\b`, 'gi')

        matches = nodos.filter(sess => {
            return sess.idnombre.match(regex) && sess.labelFlag == false
        })
        LOGO && console.log("Asambleistas: ", matches)
        if (matches.length > 15)
            matches = matches.slice(0, 15)

        showSessionAssembly(matches)
    }
}

showSessionAssembly = (matches) => {
    asambslist.innerHTML = ' '
    if (matches.length > 0){
        const html = matches.map(match => 
            `<div style="display: ${!(match.numeroid in pinnedElements) ? 'block' : 'none'};">
                <div class="d-flex flex-column ml-4">

                    <div class= "d-flex flex-row  list-group-item list-group-item-action mb-1 ">
                        <input class="mr-2" type="checkbox" id=${match.numeroid}  onclick="getIdAssambly(this.id)"></input>
                        <span style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${match.nombre} </span>
                    </div>
                </div>
            </div>`
        ).join('');
        //console.log(html)
        asambslist.innerHTML += html
    } 
}

showPinnedAssamb = () => {
    
    pinnedlist.innerHTML = ''
    let list = Object.values(pinnedElements)
    console.log(pinnedElements)
    

    if (list.length > 0){
        const html = list.map(element => 
            `<div class="d-flex flex-column ml-4">
                
                <div  class=" d-flex flex-row list-group-item list-group-item-action mb-1" style="align-items: center;">

                    <input class="mr-2" type="checkbox" id=${element.numeroId } onclick="removePinned(this.id)" checked></input>
                    <span style="color: #54575b; font-weight: bold; text-transform:capitalize"> ${element.nombre} </span>
                </div>
            </div>`
        ).join('');

        //console.log(html)
        pinnedlist.innerHTML += html
    }
    
}

getIdAssambly = (id) => {
    console.log(id)
    
    if (id in pinnedElements){
        console.log("en uso")
    }
    else {
        let asambleista = asambleistas[id]
        console.log('asambleista: ', asambleista)
        pinnedElements[id] = asambleista
        
        console.log("entidad:" , entidades[id])
        entidades[id].labelFlag = true
        d3.select('#node' + asambleista.numeroId).attr("stroke", "orange").attr("stroke-width", 3.0) // #f6c23e
        d3.select('#text' + asambleista.numeroId).attr("visibility", "visible")

        showPinnedAssamb()
        showSessionAssembly(matches)
    }

}

removePinned = (id) => {
    
    d3.select('#node' + id).attr("stroke", "#fff").attr("stroke-width", 0)
    d3.select('#text' + id).attr("visibility", "hidden")
    entidades[id].labelFlag = false
    delete pinnedElements[id]
    showPinnedAssamb()
    showSessionAssembly(matches)
    //console.log(entidades)
}

fueradelbuscador = () => {
    pinnedlist.innerHTML = ''
    asambslist.innerHTML = ' '
}

fueradelbuscadorEntidades = () => {
  listaResultados.innerHTML = ''
}

/** Fin del buscador de asambleistas */

/**Zona para buscar votaciones */

const votesList = document.getElementById('votesList');

function searchSesiones(searchText) {
    
  let word = validateInput(searchText)
  LOGO && console.log("search: ", word)
  let ses = Object.values(sesiones)
  
  let matches = filterData(word, ses)
 
  if (searchText.length === 0) {
      matches = []
      votesList.innerHTML = ''
  }
  if (matches.length > 13)
      matches = matches.slice(0, 13)

      LOGO && console.log("data:", matches)
  outputSesiones(matches)
}
//${match.asunto.substr(0, 200)}
function outputSesiones(matches) {
  if (matches.length > 0) {
      const html = matches.map(match =>
              `<div class="d-flex flex-row">
        <a   id=${match.sesId}
        class="list-group-item list-group-item-action mb-1 " >
            ${ sesFlag ? ' ': `<span style="color: #034EA2; font-weight: bold;"> Sesión ${match.sesion}</span>`}
            <span style="color: #034EA2; font-weight: bold;"> Votación ${match.votacion}</span>
            <span style="color: #54575b;"> (${match.fecha} ${match.hora}): </span>
            <span> ${ match.bold ? match.bold : match.asunto } ... </span> 
        </a>
      </div>`).
              join('');
      //console.log(html)
      // matchList.innerHTML = html 
      votesList.innerHTML = html
  } else{
      const noData = ` <div class="d-flex justify-content-center" style="margin: auto">
                          <span style="color: #034EA2; font-weight: bold; margin-top: 20px;"> No hay resultados </span>
                      </div>`
      votesList.innerHTML = noData;
  }
}

//valida si ingreso algun numero que pueda ser una sesion
function validateInput (text) {
  let value = text
  let searchSes = text.split(" ")
  numberFlag = false
  //asuntoFlag = true
  searchSes.forEach(function (word) {
      let num1 = parseInt(word)
      LOGO && console.log(num1)
      if(!isNaN(num1)){
          LOGO && console.log("Es un numero: ", num1)
          value = word
          numberFlag = true
          //asuntoFlag = false
      }
  })
  return value
} 

function filterData (text, ses) {
  sesFlag = false
  let matches1 = []
  let matches2 = ses.filter(sess => {
      const regex2 = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
      //console.log(regex2)
      //sess.asunto.match(regex2) .replace(regex2, '<b>'+text+'</b>')
      
      return sess.asunto.match(regex2)
  });
  if(numberFlag == true){
      //filtrar por sesion
      matches1 = ses.filter(sess => {
          const regex = new RegExp(`^${text}`, 'gi')
          //console.log(regex)
          let sesionN = sess.sesion.toString();
          if(sesionN === text) sesFlag = true
          return sesionN.match(regex) 
      });
  }
  LOGO && console.log("Sesiones:", matches1)
  LOGO && console.log("Asuntos:", matches2)
  if(matches1.length > 0) {
      //sesFlag = true
      matches1.sort((a,b) => (a.votacion > b.votacion) ? 1 : ((b.votacion > a.votacion) ? -1 : 0))
      return matches1
  }
  else{
      LOGO && console.log(matches2)
      let words = matches2.map(match => {
          var newtext = match.asunto.replace(text, '<b>'+text+'</b>')
          //console.log(newtext)
          match.bold = newtext
          return match
      })

      LOGO && console.log(words)

      return words
  }
  
}