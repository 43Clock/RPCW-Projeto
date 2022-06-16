function showFicheiros(projeto,ficheiros){
    var ficheirosProjeto = ficheiros.filter(ele=>
        ele.data_submissao==projeto.data_submissao &&
        ele.id_submissor==projeto.id_submissor &&
        ele.titulo_recurso==projeto.titulo_recurso&&
        ele.zip_name==projeto.zip_name)
    
    tableRows = ""
    ficheirosProjeto.forEach(ficheiro=>{
        tableRows += `
                <tr>
                    <td>${ficheiro.nome_ficheiro}</td>
                    <td>${ficheiro.tipo_recurso}</td>
                    <td><a href="/download/${ficheiro._id}" class="w3-button w3-green w3-round w3-tiny"><i class="fas fa-download"></a></td>
                </tr>
        `
    })
    table=`
        <table class="w3-table-all">
            <tr>
                <th id="0" onclick="sortTable(0)">Ficheiro</th>
                <th id="1" onclick="sortTable(1)">Tipo</th>
                <th>Download</th>
            </tr>
            ${tableRows}
        </table>
    `
    $("#display").empty()
    $("#display").append(table)
    $("#display").modal()
}