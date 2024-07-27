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

    const cellWidth = 250; // Increased cell width
    const cellHeight = 80; // Increased cell height
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
    ctx.textBaseline = 'top'; // Changed to 'top' to avoid overlapping

    // Draw headers
    headers.forEach((header, index) => {
        drawWrappedText(ctx, header, index * cellWidth + padding, padding, cellWidth, cellHeight);
    });

    // Draw rows
    rows.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            drawWrappedText(ctx, cell, cellIndex * cellWidth + padding, (rowIndex + 1) * cellHeight + padding, cellWidth, cellHeight);
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

function drawWrappedText(ctx, text, x, y, cellWidth, cellHeight) {
    const words = text.split(' ');
    let line = '';
    const maxWidth = cellWidth - 2 * 10; // Account for padding
    const lineHeight = 18; // Line height (adjust as needed)
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
            ctx.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
            // Ensure text fits within cell height
            if (currentY > y + cellHeight - lineHeight) {
                // Draw truncated text
                ctx.fillText('...', x, currentY); // Indicate truncation
                break;
            }
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

function enableDownload(canvas) {
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = 'markdown_table.png';
    downloadLink.style.display = 'inline-block';
}
