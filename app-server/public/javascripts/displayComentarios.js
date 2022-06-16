function displayComentarios(ficheiro,user){
    console.log(ficheiro)
    var comentarios = ficheiro.comentarios

    var blocoComentarios = ""
    comentarios.forEach(comentario=>{
        blocoComentarios +=`
            <div class="w3-panel">
                <div class="w3-container w3-dark-grey">
                    <p>Comentario de <b>${comentario.id_user}</b>:</p>
                </div>
                <div class="w3-container w3-light-grey">
                    <p>${comentario.comentario}</p>
                </div>
                <div class="w3-container w3-grey w3-tiny">
                    <p>Postado em ${comentario.data_criacao}</p>
                </div>
            </div>
        `
    })

    commentBox=`
    <div class="w3-modal-content">
        <div class="w3-panel" style="overflow-y:scroll;max-height: 50rem">
            ${blocoComentarios}
        </div>
        <div class="w3-panel">
            <div class="w3-row-padding">
                <div class="w3-col m9">
                    <textarea id="comentario-${ficheiro._id}" placeholder="Escrever comentário aqui..." name="${user}" class="w3-input" rows="3"></textarea>
                </div>
                <div class="w3-col m3">
                    <div class="w3-row">
                        <div class="w3-col m6">
                            <button id="like-${ficheiro._id}" class="w3-button w3-round-large w3-tiny w3-blue">
                                <i id="like" class="far fa-thumbs-up"></i>
                            </button>
                        </div>
                        <div class="w3-col m6 ">
                            <button id="dislike-${ficheiro._id}" class="w3-button w3-round-large w3-tiny w3-red">
                                <i id="dislike" class="far fa-thumbs-down"></i>
                            </button>
                        </div>
                    </div>
                    <button id="comentar-${ficheiro._id}" class="w3-button w3-round-large w3-tiny w3-green w3-margin" disabled>
                        Comentar
                    </button>
                </div>
            </div>
        </div>
    </div>
    `

    $("#display").empty()
    $("#display").append(commentBox)
    $("#display").modal()
}


$(document).on("keyup","textarea[id^=comentario]", function(){
    var id = $(this).attr("id").split("-")[1]
    if($(this).val()=="")
        $("#comentar-"+id).prop("disabled",true)
    else
        $("#comentar-"+id).prop("disabled",false)
})

$(document).on("click","button[id^=comentar]",function(){
    var id = $(this).attr("id").split("-")[1]
    var comentarioElement = $("textarea[id^=comentario]")
    var user = comentarioElement.attr("name")
    var comentario = comentarioElement.val()
    var data = {}
    data["id_user"] = user
    data["comentario"] = comentario
    var split = new Date().toISOString().substring(0,16).split("T")
    data["data_criacao"] = split[0]+" "+split[1]
    $.ajax({
        type: "POST",
        url: "/comentario/"+id,
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(){
            location.reload()
        },
        error: function(){
            location.reload()
        }
    })
})

$(document).on("click","button[id^=like]",function(){
    var id = $(this).attr("id").split("-")[1]
    var likeStatusButton = $("i[id=like]").attr("class")
    //se não esta liked
    if (likeStatusButton == "far fa-thumbs-up"){

    }
    else{
        
    }
        // $.ajax({
    //     type: "POST",
    //     url: "/comentario/"+id,
    //     contentType: 'application/json',
    //     data: JSON.stringify(data),
    //     success: function(){
    //         location.reload()
    //     },
    //     error: function(){
    //         location.reload()
    //     }
    // })
})