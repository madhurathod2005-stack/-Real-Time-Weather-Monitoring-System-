// ==========================================
// ESP32 CONFIGURATION
// ==========================================
// IMPORTANT: Paste your ESP32 IP address below. 
// E.g., if your ESP32 serial monitor says 192.168.1.100, use 'http://192.168.1.100/data'
const ESP32_URL = 'http://172.22.25.112/data';

// How often to fetch data from ESP32 (in milliseconds)
const REFRESH_INTERVAL = 2000; // 2 seconds

// How many data points to show on the charts at once
const MAX_DATA_POINTS = 15;

// Variables to hold the chart objects
let tempChart, humChart;

// ==========================================
// CHART INITIALIZATION
// ==========================================
function initCharts() {
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    const humCtx = document.getElementById('humChart').getContext('2d');

    // Global Chart Settings
    Chart.defaults.color = '#a0a5b5';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Reusable options for both charts
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: false // Hide X axis labels for cleaner look
            },
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                border: { dash: [5, 5] }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        elements: {
            line: { tension: 0.4 }, // Curvy lines
            point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 5
            }
        }
    };

    // Temperature Chart
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#ff5252',
                backgroundColor: 'rgba(255, 82, 82, 0.1)',
                borderWidth: 3,
                fill: true
            }]
        },
        options: commonOptions
    });

    // Humidity Chart
    humChart = new Chart(humCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Humidity (%)',
                data: [],
                borderColor: '#448aff',
                backgroundColor: 'rgba(68, 138, 255, 0.1)',
                borderWidth: 3,
                fill: true
            }]
        },
        options: commonOptions
    });
}

// ==========================================
// UPDATE CHARTS
// ==========================================
function updateCharts(temp, hum) {
    const now = new Date().toLocaleTimeString();

    // Push new data
    tempChart.data.labels.push(now);
    tempChart.data.datasets[0].data.push(temp);

    humChart.data.labels.push(now);
    humChart.data.datasets[0].data.push(hum);

    // Remove oldest data point if we exceed MAX_DATA_POINTS
    if (tempChart.data.labels.length > MAX_DATA_POINTS) {
        tempChart.data.labels.shift();
        tempChart.data.datasets[0].data.shift();

        humChart.data.labels.shift();
        humChart.data.datasets[0].data.shift();
    }

    // Refresh charts
    tempChart.update();
    humChart.update();
}

// ==========================================
// UPDATE UI ELEMENTS
// ==========================================
function updateUI(data) {
    // 1. Update text values
    document.getElementById('temp-val').innerText = `${data.temperature} °C`;
    document.getElementById('hum-val').innerText = `${data.humidity} %`;
    document.getElementById('soil-val').innerText = data.soil;
    document.getElementById('rain-val').innerText = data.rain;
    document.getElementById('light-val').innerText = data.light;

    // 2. Update Soil Moisture Status 
    // (Assuming lower value = wetter for typical analog soil sensors)
    const soilStatus = document.getElementById('soil-status');
    if (data.soil < 400) {
        soilStatus.innerHTML = "Wet <i class='fa-solid fa-water'></i>";
        soilStatus.style.color = "#448aff";
    } else if (data.soil < 800) {
        soilStatus.innerHTML = "Moist <i class='fa-solid fa-leaf'></i>";
        soilStatus.style.color = "#69f0ae";
    } else {
        soilStatus.innerHTML = "Dry <i class='fa-solid fa-fire'></i>";
        soilStatus.style.color = "#ff5252";
    }

    // 3. Update Rain Status
    // (Assuming lower value = more rain / sensor is wet)
    const rainStatus = document.getElementById('rain-status');
    if (data.rain < 500) {
        rainStatus.innerHTML = "Raining <i class='fa-solid fa-cloud-showers-heavy'></i>";
        rainStatus.style.color = "#40c4ff";
    } else {
        rainStatus.innerHTML = "No Rain <i class='fa-solid fa-sun'></i>";
        rainStatus.style.color = "#a0a5b5";
    }

    // 4. Update Light Level (LDR) Status
    // (Assuming higher value = brighter)
    const lightStatus = document.getElementById('light-status');
    const lightIcon = document.getElementById('light-icon');
    if (data.light > 500) {
        lightStatus.innerHTML = "Day <i class='fa-solid fa-sun'></i>";
        lightStatus.style.color = "#ffd740";
        lightIcon.className = "fa-solid fa-sun"; // Change header icon
    } else {
        lightStatus.innerHTML = "Night <i class='fa-solid fa-moon'></i>";
        lightStatus.style.color = "#b388ff";
        lightIcon.className = "fa-solid fa-moon"; // Change header icon
    }

    // 5. Update the charts with new temp/humidity
    updateCharts(data.temperature, data.humidity);
}

// ==========================================
// CONNECTION STATUS
// ==========================================
function updateConnectionStatus(isConnected) {
    const statusDiv = document.getElementById('connection-status');
    const icon = statusDiv.querySelector('i');
    const text = statusDiv.querySelector('span');

    if (isConnected) {
        statusDiv.className = 'status-connected';
        icon.className = 'fa-solid fa-circle pulsing';
        text.innerText = 'ESP32 Connected';
    } else {
        statusDiv.className = 'status-disconnected';
        icon.className = 'fa-solid fa-circle-xmark';
        text.innerText = 'ESP32 Offline (Dummy Data)';
    }
}

// ==========================================
// DUMMY DATA GENERATOR (For Testing/Offline)
// ==========================================
function getDummyData() {
    return {
        temperature: (Math.random() * 5 + 25).toFixed(1), // Random temp between 25.0 and 30.0
        humidity: Math.floor(Math.random() * 15 + 50),    // Random hum between 50 and 65
        soil: Math.floor(Math.random() * 1023),           // Random analog value 0-1023
        rain: Math.floor(Math.random() * 1023),           // Random analog value 0-1023
        light: Math.floor(Math.random() * 1023)           // Random analog value 0-1023
    };
}

// ==========================================
// FETCH DATA FROM ESP32
// ==========================================
async function fetchSensorData() {
    try {
        // We use AbortController to set a timeout. If ESP32 doesn't respond in 1.5s, it throws an error.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(ESP32_URL, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json(); // Parse JSON from ESP32
            updateUI(data);                     // Update UI with real data
            updateConnectionStatus(true);       // Set status to Connected
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        // If ESP32 is off or IP is wrong, this block runs
        console.warn('ESP32 unreachable. Using dummy data for demonstration.');

        const dummyData = getDummyData();
        updateUI(dummyData);
        updateConnectionStatus(false);
    }
}

// ==========================================
// START THE DASHBOARD
// ==========================================
window.addEventListener('load', () => {
    initCharts(); // Draw empty charts first
    fetchSensorData(); // Fetch immediately on load

    // Set up auto-refresh
    setInterval(fetchSensorData, REFRESH_INTERVAL);
});
