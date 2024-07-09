document.getElementById('waveform').addEventListener('change', function() {
    const customWaves = document.getElementById('customWaves');
    if (this.value === 'custom') {
        customWaves.style.display = 'block';
    } else {
        customWaves.style.display = 'none';
    }
});

document.getElementById('generate').addEventListener('click', function() {
    const waveform = document.getElementById('waveform').value;
    const frequency = parseFloat(document.getElementById('frequency').value);
    const N = parseInt(document.getElementById('samples').value, 10);
    const T = 1.0 / 800.0; // Sampling interval, assuming a sampling rate of 800 Hz
    let y = [];
    let x = [];

    for (let n = 0; n < N; n++) {
        x.push(n * T);
        if (waveform === 'sine') {
            y.push(Math.sin(2 * Math.PI * frequency * n * T));
        } else if (waveform === 'square') {
            y.push(Math.sign(Math.sin(2 * Math.PI * frequency * n * T)));
        } else if (waveform === 'sawtooth') {
            y.push(2 * (n * T * frequency - Math.floor(n * T * frequency + 0.5)));
        } else if (waveform === 'custom') {
            const frequency1 = parseFloat(document.getElementById('frequency1').value);
            const amplitude1 = parseFloat(document.getElementById('amplitude1').value);
            const frequency2 = parseFloat(document.getElementById('frequency2').value);
            const amplitude2 = parseFloat(document.getElementById('amplitude2').value);
            const frequency3 = parseFloat(document.getElementById('frequency3').value);
            const amplitude3 = parseFloat(document.getElementById('amplitude3').value);
            y.push(
                amplitude1 * Math.sin(2 * Math.PI * frequency1 * n * T) +
                amplitude2 * Math.sin(2 * Math.PI * frequency2 * n * T) +
                amplitude3 * Math.sin(2 * Math.PI * frequency3 * n * T)
            );
        }
    }

    plotTimeDomain(x, y);
    const fft = calculateFFT(y);
    plotFrequencyDomain(fft);
});

function plotTimeDomain(x, y) {
    const trace = {
        x: x,
        y: y,
        mode: 'lines',
        type: 'scatter'
    };

    const layout = {
        title: '時間領域',
        xaxis: { title: '時間 (s)' },
        yaxis: { title: '振幅' }
    };

    Plotly.newPlot('timeDomain', [trace], layout);
}

function calculateFFT(data) {
    const N = data.length;
    let re = new Array(N).fill(0);
    let im = new Array(N).fill(0);

    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            re[k] += data[n] * Math.cos((2 * Math.PI * k * n) / N);
            im[k] -= data[n] * Math.sin((2 * Math.PI * k * n) / N);
        }
    }

    let mag = re.map((val, index) => Math.sqrt(val * val + im[index] * im[index]));
    return mag.slice(0, N / 2); // Return only the first half of the spectrum
}

function plotFrequencyDomain(fft) {
    const N = fft.length;
    const freq = Array.from({length: N}, (_, k) => k * 800 / (2 * N)); // Frequency axis for the first half of the spectrum

    const trace = {
        x: freq,
        y: fft,
        mode: 'lines',
        type: 'scatter'
    };

    const layout = {
        title: '周波数領域',
        xaxis: { title: '周波数 (Hz)' },
        yaxis: { title: '振幅' }
    };

    Plotly.newPlot('frequencyDomain', [trace], layout);
}
