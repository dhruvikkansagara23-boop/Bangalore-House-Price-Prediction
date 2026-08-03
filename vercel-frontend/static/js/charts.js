window.initDashboardCharts = function(data, existingCharts = null) {
    // Power BI Dark Theme Defaults
    Chart.defaults.color = '#a0a0a0'; 
    Chart.defaults.borderColor = '#333333';
    Chart.defaults.font.family = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(37, 37, 38, 0.9)';
    Chart.defaults.plugins.tooltip.borderColor = '#555555';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
    Chart.defaults.plugins.tooltip.bodyColor = '#e0e0e0';

    if (existingCharts) {
        if(existingCharts.scatter) existingCharts.scatter.destroy();
        if(existingCharts.bhk) existingCharts.bhk.destroy();
        if(existingCharts.trend) existingCharts.trend.destroy();
        if(existingCharts.sqft) existingCharts.sqft.destroy();
        if(existingCharts.tier) existingCharts.tier.destroy();
    }
    
    let chartsObj = {};

    const ctxScatter = document.getElementById('scatterChart').getContext('2d');
    chartsObj.scatter = new Chart(ctxScatter, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Price vs Area',
                data: data.scatter,
                backgroundColor: 'rgba(17, 141, 255, 0.7)',
                borderColor: '#118DFF',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#118DFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Total Sqft', color: '#a0a0a0' }, grid: { color: '#333333' } },
                y: { title: { display: true, text: 'Valuation (Lakhs)', color: '#a0a0a0' }, grid: { color: '#333333' } }
            }
        }
    });

    const ctxBhk = document.getElementById('bhkChart').getContext('2d');
    chartsObj.bhk = new Chart(ctxBhk, {
        type: 'bar',
        data: {
            labels: data.bhk_dist.labels,
            datasets: [{
                label: 'Properties by Configuration (BHK)',
                data: data.bhk_dist.values,
                backgroundColor: 'rgba(0, 184, 170, 0.8)',
                borderColor: '#00B8AA',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(0, 184, 170, 1)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    chartsObj.trend = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: data.price_trends.labels,
            datasets: [{
                label: 'Avg Valuation by Location',
                data: data.price_trends.values,
                borderColor: '#E66C37',
                tension: 0.2,
                fill: true,
                backgroundColor: 'rgba(230, 108, 55, 0.2)',
                pointBackgroundColor: '#E66C37',
                pointBorderColor: '#ffffff'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    const ctxSqft = document.getElementById('sqftChart').getContext('2d');
    chartsObj.sqft = new Chart(ctxSqft, {
        type: 'bar',
        data: {
            labels: data.price_per_sqft.labels,
            datasets: [{
                label: 'Avg Price / Sqft (₹)',
                data: data.price_per_sqft.values,
                backgroundColor: 'rgba(107, 0, 123, 0.8)',
                borderColor: '#6B007B',
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxTier = document.getElementById('tierChart').getContext('2d');
    chartsObj.tier = new Chart(ctxTier, {
        type: 'doughnut',
        data: {
            labels: data.price_tiers.labels,
            datasets: [{
                data: data.price_tiers.values,
                backgroundColor: [
                    '#118DFF', // Budget - Blue
                    '#00B8AA', // Mid - Teal
                    '#E66C37', // Prime - Orange
                    '#6B007B'  // Luxury - Purple
                ],
                borderColor: '#252526',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#a0a0a0' } },
                title: { display: true, text: 'Property Tiers Distribution', color: '#e0e0e0', font: { size: 14 } }
            }
        }
    });

    return chartsObj;
};
