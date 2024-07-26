document.addEventListener('DOMContentLoaded', (event) => {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', generateImage);
});

function generateImage() {
    const markdown = document.getElementById('markdownInput').value;
    if (!markdown.trim()) {
        alert('Please enter a Markdown table.');
        return;
    }

    const { headers, rows } = parseMarkdownTable(markdown);
    if (!headers.length || !rows.length) {
        alert('Invalid Markdown table format. Please check your input.');
        return;
    }

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const cellWidth = 150;
    const cellHeight = 40;
    const padding = 10;

    canvas.width = cellWidth * headers.length;
    canvas.height = cellHeight * (rows.length + 1);

    drawTable(ctx, headers, rows, cellWidth, cellHeight, padding);
    enableDownload(canvas);
}

function parseMarkdownTable(markdown) {
    const lines = markdown.trim().split('\n');
    const headers = lines[0].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
    const rows = lines.slice(2).map(line =>
        line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
    );
    return { headers, rows };
}

function drawTable(ctx, headers, rows, cellWidth, cellHeight, padding) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'black';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'middle';

    // Draw headers
    headers.forEach((header, index) => {
        const x = index * cellWidth + padding;
        const y = cellHeight / 2;
        ctx.fillText(header, x, y);
    });

    // Draw rows
    rows.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            const x = cellIndex * cellWidth + padding;
            const y = (rowIndex + 1.5) * cellHeight;
            ctx.fillText(cell, x, y);
        });
    });

    // Draw grid
    ctx.beginPath();
    for (let i = 0; i <= headers.length; i++) {
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, ctx.canvas.height);
    }
    for (let i = 0; i <= rows.length + 1; i++) {
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(ctx.canvas.width, i * cellHeight);
    }
    ctx.stroke();
}

function enableDownload(canvas) {
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'markdown_table.png';
    downloadLink.style.display = 'inline-block';
}
