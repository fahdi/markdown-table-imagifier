document.addEventListener('DOMContentLoaded', (event) => {
  const generateBtn = document.getElementById('generateBtn');
  const markdownInput = document.getElementById('markdownInput');
  const themeSelect = document.getElementById('themeSelect');
  const copyImageBtn = document.getElementById('copyImageBtn');
  const clearBtn = document.getElementById('clearBtn'); 

  generateBtn.addEventListener('click', generateImage);
  copyImageBtn.addEventListener('click', copyImageToClipboard);
  clearBtn.addEventListener('click', clearAllInput);
});

function clearAllInput() {
  document.getElementById('markdownInput').value = '';
  document.getElementById('themeSelect').value = 'default'; // Reset to default
  clearCanvas();
}

function generateImage(){
  const markdown = document.getElementById('markdownInput').value;
  const theme = document.getElementById('themeSelect').value;
  
  document.getElementById('output-section').style.display = 'block';
  const canvasContainer = document.getElementById('canvasContainer');


  if (!markdown.trim()) {
    clearCanvas();
    return;
  }

  // Convert Markdown to HTML
  const htmlTable = marked(markdown);

  // Create a hidden div and insert the HTML table
  const hiddenDiv = document.createElement('div');
  hiddenDiv.innerHTML = htmlTable;
  hiddenDiv.className = `table-theme-${theme}`;
  hiddenDiv.style.padding = '20px';
  canvasContainer.appendChild(hiddenDiv);

  // Use html2canvas to convert the div to a canvas
  html2canvas(hiddenDiv, { useCORS: true }).then(canvas => {
    // Remove the hidden div
    canvasContainer.removeChild(hiddenDiv);

    // Display the canvas and enable download/copy
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(canvas);
    enableDownload(canvas);
  });
}

function clearCanvas(){
  const canvasContainer = document.getElementById('canvasContainer');
  canvasContainer.innerHTML = '';
  document.getElementById('downloadLink').style.display = 'none';
  document.getElementById('copyImageBtn').style.display = 'none';
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
  const canvas = document.querySelector('#canvasContainer canvas');
  canvas.toBlob(async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      alert('Image copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy image: ', err);
      alert('Failed to copy image. Your browser might not support this feature.');
    }
  }, 'image/png');
}
