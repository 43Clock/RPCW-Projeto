function criarnoticia(){
    //<form id="formnoticia" action="http://localhost:8001/noticias" method="post">
    form = `
    <fieldset>
        <legend>Nova notícia</legend>
        <label for="input">Introduza o Titulo:</label>
        <input type="text" name="titulo" id="titulo">
        
        <textarea id="conteudo" style="width:100%;">Conteudo</textarea>
        
        <input class="w3-radio" type="radio" name="visibilidade" value="visivel" checked>
        <label>Visível</label>

        <input class="w3-radio" type="radio" name="visibilidade" value="invisivel">
        <label>Invisível</label>
        <button name="submeter" id="submeter">Submeter Notícia</button>
    </fieldset>
    `

    
    $("#display").empty()
    $("#display").append(form)
    $("#display").modal()
}




$(document).on("click","button[id^=submeter]",function(){
    var titulo = $("input[id^=titulo]").val()
    var conteudo = $("textarea[id^=conteudo]").val()
    var data = {}
    data["titulo"] = titulo
    data["conteudo"] = conteudo
    var split = new Date().toISOString().substring(0,16).split("T")
    data["data_criacao"] = split[0]+" "+split[1]
    $.ajax({
        type: "POST",
        url: "/admin/noticias",
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