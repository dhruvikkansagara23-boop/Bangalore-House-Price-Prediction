let dashboardChartsObj = null;

async function loadDashboardData() {
    const loc = document.getElementById('filterLoc').value;
    const bhk = document.getElementById('filterBhk').value;
    const minP = document.getElementById('filterMinP').value;
    const maxP = document.getElementById('filterMaxP').value;
    
    const params = new URLSearchParams();
    if(loc) params.append('location', loc);
    if(bhk) params.append('bhk', bhk);
    if(minP) params.append('min_price', minP);
    if(maxP) params.append('max_price', maxP);
    
    const qs = params.toString() ? `?${params.toString()}` : '';

    try {
        const sumRes = await fetch('/analytics/summary' + qs);
        const sumData = await sumRes.json();
        
        document.getElementById('avg-price').textContent = sumData.avg_price ? `₹ ${sumData.avg_price} L` : 'N/A';
        document.getElementById('median-price').textContent = sumData.median_price ? `₹ ${sumData.median_price} L` : 'N/A';
        document.getElementById('exp-loc').textContent = sumData.expensive_loc;
        document.getElementById('cheap-loc').textContent = sumData.cheap_loc;

        const chartRes = await fetch('/analytics/charts' + qs);
        const chartData = await chartRes.json();
        
        if (window.initDashboardCharts) {
            dashboardChartsObj = window.initDashboardCharts(chartData, dashboardChartsObj);
        }
        
    } catch (err) {
        console.error("Failed to load dashboard data", err);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Populate locations
    try {
        const locRes = await fetch('/get_location_names');
        const locData = await locRes.json();
        const locSelect = document.getElementById('filterLoc');
        locData.locations.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc;
            opt.textContent = loc;
            locSelect.appendChild(opt);
        });
    } catch (e) {}

    document.getElementById('applyFiltersBtn').addEventListener('click', loadDashboardData);
    
    await loadDashboardData();
});
