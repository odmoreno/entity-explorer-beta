/** 
 * Funciones para los buscadores
 */

var LOGB = false

let numberFlag = false
let asuntoFlag = true
let sesFlag = false


function searchFechas(searchDate) {
    //let searchSes = searchText.split(" ") 
    let searchMonth = searchDate.getMonth() + 1
    let searchYear = searchDate.getFullYear()
    let searchDia = searchDate.getDate()
    LOGB && console.log("month:", searchMonth)
    LOGB && console.log("year:", searchYear)
    LOGB && console.log("Dia:", searchDia)

    let ses = Object.values(sesiones)
    let matches = ses.filter(sess => {
        let fechaSes = parseDate(sess.fecha)
        let mes = fechaSes.getMonth() + 1
        let year = fechaSes.getFullYear()
        let dia = fechaSes.getDate()

        return searchYear === year && searchMonth === mes && searchDia === dia
    });
    LOGB && console.log(matches)

    if (matches.length > 9)
        matches = matches.slice(0, 9)

    //outputFechas(matches)
    outputSesiones(matches)
    //update2(matches[0])
    let data = matches[0]
     
    let slider = $("#date-slider").data("ionRangeSlider");
    //document.getElementById('dateP').value = data.fecha
    document.getElementById('search').value = 'Sesion ' + data.sesion
    
    slider.update({
        from: data.sesId,
    });
}

function searchSesiones(searchText) {
    
    let word = validateInput(searchText)
    LOGB && console.log("search: ", word)
    let ses = Object.values(sesiones)
    
    let matches = filterData(word, ses)
   
    if (searchText.length === 0) {
        matches = []
        fechaList.innerHTML = ''
    }
    if (matches.length > 13)
        matches = matches.slice(0, 13)

    LOGB && console.log("data:", matches)
    outputSesiones(matches)
}
//${match.asunto.substr(0, 200)}
function outputSesiones(matches) {
    if (matches.length > 0) {
        const html = matches.map(match =>
                `<div class="d-flex flex-row">
          <a href="#"  id=${match.sesId}
          class="list-group-item list-group-item-action mb-1 " >
              ${ sesFlag ? ' ': `<span style="color: #034EA2; font-weight: bold;"> Sesión ${match.sesion}</span>`}
              <span style="color: #034EA2; font-weight: bold;"> Votación ${match.votacion}</span>
              <span style="color: #54575b;"> (${match.fecha} ${match.hora}): </span>
              <span> ${ match.bold ? match.bold : match.asunto } ... </span> 
          </a>
          <button href="#" id=${'b' + match.sesId} class="btn btn-special btn-success btn-circle btn-sm m-2" onclick=getIdSes(this.id)>
              <i class="fas fa-plus"></i>
          </button>
        </div>`).
                join('');
        //console.log(html)
        // matchList.innerHTML = html 
        fechaList.innerHTML = html
    } else{
        const noData = ` <div class="d-flex justify-content-center" style="margin: auto">
                            <span style="color: #034EA2; font-weight: bold; margin-top: 20px;"> No hay resultados </span>
                        </div>`
        fechaList.innerHTML = noData;
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
        LOGB && console.log(num1)
        if(!isNaN(num1)){
            LOGB && console.log("Es un numero: ", num1)
            value = word
            numberFlag = true
            //asuntoFlag = false
        }
    })
    return value
} 

//OPciones de filtrado, en este caso solo hay 2 : Por sesion y Asunto
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
    LOGB && console.log("Sesiones:", matches1)
    LOGB && console.log("Asuntos:", matches2)
    if(matches1.length > 0) {
        //sesFlag = true
        matches1.sort((a,b) => (a.votacion > b.votacion) ? 1 : ((b.votacion > a.votacion) ? -1 : 0))
        return matches1
    }
    else{
        LOGB && console.log(matches2)
        let words = matches2.map(match => {
            var newtext = match.asunto.replace(text, '<b>'+text+'</b>')
            //console.log(newtext)
            match.bold = newtext
            return match
        })

        LOGB && console.log(words)

        return words
    }
    
}

function validateDates (){
    //var now = new Date();
    var disabledDates = []
    var startDate = new Date(2017, 4, 14) 
    var endDate = new Date(2020, 12, 24) 
    var daysOfYear = []; // Dias en el calendario
    var flagDate = false
    let ses = Object.values(sesiones)

    for (var d = new Date(2017, 4, 14); d <= endDate; d.setDate(d.getDate() + 1)) {
        daysOfYear.push(new Date(d));
    }

    daysOfYear.forEach( (dia) => {
        flagDate = true
        for (var i = 0; i < ses.length; i++) {
            let fechaSes = parseDate(sesiones[i].fecha)
            //console.log(dia, fechaSes)
            //console.log(dia.getMonth())
            if( (dia.getMonth() + 1 == fechaSes.getMonth() + 1)  && (dia.getDate() == fechaSes.getDate()) && (dia.getFullYear() == fechaSes.getFullYear())  ) {
                //console.log("inside")
                //console.log(dia, fechaSes)
                //let fecha = formatDate(dia)
                //console.log(fecha)
                flagDate = false
                break;
            }
        }
        //['15/05/2017']
        let month = dia.getMonth() + 1
        let year = dia.getFullYear()
        let diaU = dia.getDate()
        let fechaParsero = diaU + '/' + month + '/' + year
        if (flagDate) disabledDates.push(fechaParsero)
    })
    
    LOGB && console.log(disabledDates)
    return disabledDates
}

/** Funciones para el buscador de entidades 
 * 
*/


function findEntities (searchText) {
    entityList.innerHTML = ''
    if(searchText === "") return
    
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
        filterAsams(searchText, false)
        filterPartidos(searchText, false)
        filterRegion(searchText, false)
        filterProv(searchText, false)
        filterComisiones(searchText, false)
    }
    
}

filterAsams = (text, flag) => {
    const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')

    let matches = Object.values(asambleistas).filter(sess => {
        return sess.id.match(regex)
    })
    LOGB && console.log("asams filtrados: ", matches)
    if (matches.length > 5)
        matches = matches.slice(0, 5)
    outputAsambs(matches)
}

filterPartidos = (text, flag) => {
    const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
    let matches = []
    if(!flag){
        matches = Object.keys(partidos).filter(partido => {
            return partido.match(regex)
        })
    }else
        matches = Object.keys(partidos)
    
    
    let results = []
    matches.forEach( (partido) => {
        for (let index = 0; index < partidosG.length; index++) {
            const element = partidosG[index];
            if (element[0] == partido){
                results.push(element)
                break;
            }
            
        }
    })
    let asambsP = Object.values(asambleistas).filter(sess => {
        return sess.partido == text
    })
    LOGB && console.log(asambsP)
    LOGB && console.log("Partidos filtrados: ", results)
    outputEntidades(results, 'Partido')
}

filterRegion = (text, flag) => {
    const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
    let matches = []
    if(!flag){
        matches = Object.keys(regiones).filter(region => {
            return region.match(regex)
        })
    }else
        matches = Object.keys(regiones)

    let results = []
    matches.forEach( (region) => {
        for (let index = 0; index < regionesG.length; index++) {
            const element = regionesG[index];
            if (element[0] == region){
                results.push(element)
                break;
            }
            
        }
    })
    LOGB && console.log("regiones filtrados: ", matches)
    let asambsP = Object.values(asambleistas).filter(sess => {
        return sess.region == text
    })

    outputEntidades(results, 'Región')
    if (matches.length == 1)
        outputAsambs(asambsP)
}

filterProv = (text, flag) => {
    const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
    let matches = []
    if(!flag){
        matches = Object.keys(provincias).filter(prov => {
            return prov.match(regex)
        })
    }else
        matches = Object.keys(provincias)

    let results = []
    matches.forEach( (prov) => {
        for (let index = 0; index < provG.length; index++) {
            const element = provG[index];
            if (element[0] == prov){
                results.push(element)
                break;
            }
            
        }
    })
    LOGB && console.log("Prov filtrados: ", matches)

    outputEntidades(results, 'Provincia')
    let asambsP = Object.values(asambleistas).filter(sess => {
        return sess.provincia == text
    })
    if (matches.length == 1)
        outputAsambs(asambsP)

}

filterComisiones = (text, flag) => {
    const regex = new RegExp(`\\b.*${text}.*?\\b`, 'gi')
    let matches = []
    if(!flag){
        matches = Object.keys(comisiones).filter(com => {
            return com.match(regex)
        })
    }else
        matches = Object.keys(comisiones)

    let results = []
    matches.forEach( (com) => {
        for (let index = 0; index < comG.length; index++) {
            const element = comG[index];
            if (element[0] == com){
                results.push(element)
                break;
            }
            
        }
    })
    LOGB && console.log("Comisiones filtrados: ", matches)

    outputEntidades(results, 'Comisión')
    
    let asambsP = Object.values(asambleistas).filter(sess => {
        return sess.comisiones[0] == text
    })
    if (matches.length == 1)
        outputAsambs(asambsP)
}

function outputEntidades (matches, option) {
    
    if (matches.length > 0){
        const html = matches.map(match => 
            `<div class="d-flex flex-row">
            <a href="#"  id=${match[0]}
                class="list-group-item list-group-item-action mb-1 " >
                <span style="color: #034EA2; font-weight: bold; text-transform:capitalize"> ${match[0]} </span>
                <span style="color: #54575b;">  ( ${option} ) </span>
                <span> ${match[1].length} Asambleistas</span> 
            </a>
            <button href="#" id=${match[0]} class="btn btn-success btn-circle btn-sm m-2" onclick="">
                <i class="fas fa-plus"></i>
            </button>
            </div>`
        ).join('');
        //console.log(html)

        entityList.innerHTML += html
    } 
}


outputAsambs = (matches) => {
    if (matches.length > 0){
        const html = matches.map(match => 
            `<div class="d-flex flex-row">
            <a href="#"  id=${match.id}
                class="list-group-item list-group-item-action mb-1 " >
                <span style="color: #034EA2; font-weight: bold; text-transform:capitalize"> ${match.nombre} </span>
                <span style="color: #54575b;"> ( Asambleista ${ match.tipo} ${ match.provincia == 'nacional'? '' : ` del ${match.provincia}` } ) </span>
            </a>
            <button href="#" id=${match.id} class="btn btn-success btn-circle btn-sm m-2" onclick="">
                <i class="fas fa-plus"></i>
            </button>
            </div>`
        ).join('');
        //console.log(html)
        entityList.innerHTML += html
    } 
}

/**Fin de entidades */


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
        LOGB && console.log("Asambleistas: ", matches)
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

/** Fin del buscador de asambleistas */

/**Funciones para el buscador de rango de fechas */

const fechasrangedlist = document.getElementById('fechas-list');
let rangedListSession = []

function manageDates (data){
    rangedListSession = []
    console.log(data)
    var from = data.from
    var to = data.to

    for ( let i=from; i<to; i++) {
        var votacion = sesiones[i]
        rangedListSession.push(votacion)
    }
    console.log(rangedListSession)
    outputSesionesR(rangedListSession)
}

function outputSesionesR(matches) {
    if (matches.length > 0) {
        const html = matches.map(match =>
                `<div class="d-flex flex-row">
          <a href="#"  id=${match.sesId}
          class="list-group-item list-group-item-action mb-1 " >
              ${ sesFlag ? ' ': `<span style="color: #034EA2; font-weight: bold;"> Sesión ${match.sesion}</span>`}
              <span style="color: #034EA2; font-weight: bold;"> Votación ${match.votacion}</span>
              <span style="color: #54575b;"> (${match.fecha} ${match.hora}): </span>
              <span> ${ match.bold ? match.bold : match.asunto } ... </span> 
          </a>
          <button href="#" id=${'b' + match.sesId} class="btn btn-special btn-success btn-circle btn-sm m-2" onclick=getIdSes(this.id)>
              <i class="fas fa-plus"></i>
          </button>
        </div>`).
                join('');
        //console.log(html)
        // matchList.innerHTML = html 
        fechasrangedlist.innerHTML = html
    } else{
        const noData = ` <div class="d-flex justify-content-center" style="margin: auto">
                            <span style="color: #034EA2; font-weight: bold; margin-top: 20px;"> No hay resultados </span>
                        </div>`
        fechasrangedlist.innerHTML = noData;
    }
}

function addAllSesions(){
    
}