$("#searchbar").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    table = document.getElementById("tableBody");
    tr = table.getElementsByTagName("tr");
    var coluna = parseInt($("#searchType option:selected").val())
    console.log(coluna)
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[coluna];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toLowerCase().indexOf(value) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
});