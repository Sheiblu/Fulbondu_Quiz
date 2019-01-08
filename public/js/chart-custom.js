(function($) { "use strict";
 
// ============================================
// Chart 
// ============================================

var chart    = document.getElementById('chart').getContext('2d'),
    gradient = chart.createLinearGradient(0, 0, 0, 450);

gradient.addColorStop(0, 'rgba(123, 94, 234, 0.5)');
gradient.addColorStop(0.5, 'rgba(123, 94, 234, 0.25)');
gradient.addColorStop(1, 'rgba(123, 94, 234, 0)');


var data  = {
    labels: [ 'Year 2018', 'Year 2019', 'Year 2020', 'Year 2021', 'Year 2022', 'Year 2023' ],
    datasets: [{
            backgroundColor: gradient,
            pointBackgroundColor: '#7b5eea',
            pointBorderWidth: 10,
            pointHoverBorderWidth: 20,
            borderWidth: 2,
            borderColor: '#7b5eea',
            data: [0.8, 2.00, 7.75, 12.35, 15.00, 23.25]
    }]
};


var options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
        easing: 'easeInOutQuad',
        duration: 520
    },
    scales: {
        xAxes: [{
            gridLines: {
                color: 'rgba(255, 255, 255, 0.08)',
                lineWidth: 1
            }
        }],
        yAxes: [{
            gridLines: {
                color: 'rgba(255, 255, 255, 0.04)',
                lineWidth: 1
            },
            ticks: {
                beginAtZero: true,
                userCallback: function(value, index, values) {
                    // Convert the number to a string and splite the string every 3 charaters from the end
                    value = value.toString();
                    value = value.split(/(?=(?:...)*$)/);
                    
                    // Convert the array to a string and format the output
                    value = value.join('.');
                    return '$' + value;
                }
            }
        }]
    },
    elements: {
        line: {
            tension: 0.4
        }
    },
    legend: {
        display: false
    },
    point: {
        backgroundColor: 'white'
    },
    tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
                return "Token price $" + Number(tooltipItem.yLabel).toFixed(0).replace(/./g, function(c, i, a) {
                    return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
                });
            }
        },			
        titleFontFamily: "'Work Sans', sans-serif",
        bodyFontFamily: "'Poppins', sans-serif",
        titleFontColor: '#7b5eea',
        caretSize: 7,
        cornerRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.85)',
        titleFontSize: 17,
        bodyFontSize: 13,
        titleFontStyle: '600',
        bodyFontStyle: '300',
        titleSpacing: 1,
        titleMarginBottom: 10,
        displayColors: false,
        xPadding: 20,
        yPadding: 20
    }
};


var chartInstance = new Chart(chart, {
    type: 'line',
    data: data,
        options: options
});








})(jQuery); 