var ctx1 = $("#downloadrecursos");

const drawDRPie = (labels,sizes) => {
    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Dataset 1',
        data: sizes,
        backgroundColor: [
            goodc,
            badc
        ]
        }
    ]
    };
    var options = {
        responsive: false,
        legend: {
            display: true,
            position: "right",
            labels: {
                fontColor: "#333",
                fontSize: 34
            }
        },
        animation: {
            duration: 0
        }
    };
    chart1 = new Chart(ctx1, {
        type: "pie",
        data: data,
        options: options
    });
}