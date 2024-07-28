document.addEventListener('DOMContentLoaded', (event) => {
  const markdownInput = document.getElementById('markdownInput');
  const themeSelect = document.getElementById('themeSelect');
  const copyImageBtn = document.getElementById('copyImageBtn');

  markdownInput.addEventListener('input', generateImage);
  themeSelect.addEventListener('change', generateImage);
  copyImageBtn.addEventListener('click', copyImageToClipboard);
});

function generateImage(){
  const markdown = document.getElementById('markdownInput').value;
  if (!markdown.trim()) {
    clearCanvas();
    return;
  }

  const { headers, rows } = parseMarkdownTable(markdown);
  if (!headers.length || !rows.length) {
    clearCanvas();
    return;
  }

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Set font before measuring text
  ctx.font = '14px Arial';

  // Calculate cell dimensions based on content
  const cellPadding = 10;
  const margin = 20;
  const cellWidths = headers.map((header, index) => {
    let maxWidth = ctx.measureText(header).width;
    rows.forEach(row => {
      const cellWidth = ctx.measureText(row[index]).width;
      maxWidth = Math.max(maxWidth, cellWidth);
    });
    return maxWidth + (cellPadding * 2);
  });

  const cellHeight = 40;

  // Calculate canvas dimensions
  canvas.width = cellWidths.reduce((sum, width) => sum + width, 0) + (margin * 2);
  canvas.height = (cellHeight * (rows.length + 1)) + (margin * 2);

  const theme = document.getElementById('themeSelect').value;
  drawTable(ctx, headers, rows, cellWidths, cellHeight, cellPadding, margin, theme);
  enableDownload(canvas);
}

function clearCanvas(){
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('downloadLink').style.display = 'none';
  document.getElementById('copyImageBtn').style.display = 'none';
}

function parseMarkdownTable(markdown){
  const lines = markdown.trim().split('\n');
  const headers = lines[0].split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim());
  const rows = lines.slice(2).map(line =>
    line.split('|').filter(cell => cell.trim() !== '').map(cell => cell.trim())
  );
  return { headers, rows };
}

function drawTable(ctx, headers, rows, cellWidths, cellHeight, cellPadding, margin, theme){
  const colors = getThemeColors(theme);

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.font = '14px Arial';
  ctx.textBaseline = 'middle';

  let x = margin;
  // Draw headers
  headers.forEach((header, index) => {
    const y = cellHeight / 2 + margin;
    ctx.fillStyle = colors.headerBackground;
    ctx.fillRect(x, margin, cellWidths[index], cellHeight);
    ctx.fillStyle = colors.headerText;
    ctx.fillText(header, x + cellPadding, y);
    x += cellWidths[index];
  });

  // Draw rows
  rows.forEach((row, rowIndex) => {
    x = margin;
    row.forEach((cell, cellIndex) => {
      const y = ((rowIndex + 1) * cellHeight) + (cellHeight / 2) + margin;
      ctx.fillStyle = colors.cellBackground;
      ctx.fillRect(x, (rowIndex + 1) * cellHeight + margin, cellWidths[cellIndex], cellHeight);
      ctx.fillStyle = colors.text;
      ctx.fillText(cell, x + cellPadding, y);
      x += cellWidths[cellIndex];
    });
  });

  // Draw grid
  ctx.strokeStyle = colors.border;
  ctx.beginPath();
  x = margin;
  for (let i = 0; i <= headers.length; i++) {
    ctx.moveTo(x, margin);
    ctx.lineTo(x, ctx.canvas.height - margin);
    x += cellWidths[i] || 0;
  }
  for (let i = 0; i <= rows.length + 1; i++) {
    ctx.moveTo(margin, i * cellHeight + margin);
    ctx.lineTo(ctx.canvas.width - margin, i * cellHeight + margin);
  }
  ctx.stroke();
}

function getThemeColors(theme){
  switch (theme) {
    case 'dark':
      return {
        background: '#333',
        text: '#fff',
        headerBackground: '#555',
        headerText: '#fff',
        cellBackground: '#444',
        border: '#666'
      };
    case 'colorful':
      return {
        background: '#f0f8ff',
        text: '#333',
        headerBackground: '#4caf50',
        headerText: '#fff',
        cellBackground: '#e6f3ff',
        border: '#2196f3'
      };
    default:
      return {
        background: '#fff',
        text: '#333',
        headerBackground: '#f2f2f2',
        headerText: '#333',
        cellBackground: '#fff',
        border: '#ddd'
      };
  }
}

function enableDownload(canvas){
  const downloadLink = document.getElementById('downloadLink');
  const copyImageBtn = document.getElementById('copyImageBtn');
  downloadLink.href = canvas.toDataURL('image/png');
  downloadLink.download = 'markdown_table.png';
  downloadLink.style.display = 'inline-block';
  copyImageBtn.style.display = 'inline-block';
}

async function copyImageToClipboard(){
  const canvas = document.getElementById('canvas');
  canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      alert('Image copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy image: ', err);
      alert('Failed to copy image. Your browser might not support this feature.');
    }
  }, 'image/png');
}
