var ctx1 = $("#downloadrecursos");

const drawDRPie = (labels,sizes,colors) => {
    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Dataset 1',
        data: sizes,
        backgroundColor: colors
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
        type: "doughnut",
        data: data,
        options: options
    });
}



var ctx2 = $("#downloadprojetos");
const drawDPPie = (labels,sizes,colors) => {
    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Dataset 1',
        data: sizes,
        backgroundColor: colors
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
    chart1 = new Chart(ctx2, {
        type: "doughnut",
        data: data,
        options: options
    });
}



var ctx3 = $("#uploads");
const drawUPPie = (labels,sizes,colors) => {
    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Dataset 1',
        data: sizes,
        backgroundColor: colors
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
    chart1 = new Chart(ctx3, {
        type: "doughnut",
        data: data,
        options: options
    });
}