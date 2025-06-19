document.addEventListener('DOMContentLoaded', () => {
    // Supabase configuration
    const SUPABASE_URL = 'https://tvecnfdqakrevzaeifpk.supabase.co';
    const SUPABASE_ANON_KEY = 'b82c51dffe821aacbe5f9b190ce267d66ecc709bf03dde0add0315f846c92026';
    const SUPABASE_STORAGE_URL = 'https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/s3';
    const BUCKET_NAME = 'sites'; // Using 'sites' as the bucket name based on the task description
    
    // File type mapping for folder organization
    const fileTypeMap = {
        // Documents
        'pdf': 'documents',
        'doc': 'documents',
        'docx': 'documents',
        'txt': 'documents',
        'rtf': 'documents',
        
        // Spreadsheets
        'csv': 'spreadsheets',
        'xls': 'spreadsheets',
        'xlsx': 'spreadsheets',
        
        // Web
        'html': 'web',
        'htm': 'web',
        'css': 'web',
        'js': 'web',
        'jsx': 'web',
        'tsx': 'web',
        
        // Images
        'jpg': 'images',
        'jpeg': 'images',
        'png': 'images',
        'gif': 'images',
        'svg': 'images',
        'webp': 'images',
        
        // Audio
        'mp3': 'audio',
        'wav': 'audio',
        'ogg': 'audio',
        'm4a': 'audio',
        
        // Video
        'mp4': 'video',
        'mov': 'video',
        'avi': 'video',
        'webm': 'video',
        
        // Code
        'json': 'code',
        'xml': 'code',
        'py': 'code',
        'java': 'code',
        'c': 'code',
        'cpp': 'code',
        'cs': 'code',
        'php': 'code',
        'rb': 'code',
        'go': 'code',
        'rs': 'code',
        'ts': 'code',
        
        // Version control
        'git': 'version-control',
        'gitignore': 'version-control',
        
        // Archives
        'zip': 'archives',
        'rar': 'archives',
        'tar': 'archives',
        'gz': 'archives',
        '7z': 'archives',
    };
    
    // Upload history storage
    let uploadHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');

    // DOM elements
    const fileInput = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    const uploadForm = document.getElementById('upload-form');
    const uploadButton = document.getElementById('upload-button');
    const uploadStatus = document.getElementById('upload-status');
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.getElementById('status-message');
    const result = document.getElementById('result');
    const resultJson = document.getElementById('result-json');

    // Update file name display when a file is selected
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileName.textContent = fileInput.files[0].name;
        } else {
            fileName.textContent = 'No file chosen';
        }
    });

    // Handle form submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            alert('Please select a file to upload');
            return;
        }

        const file = fileInput.files[0];
        
        // Show upload status
        uploadStatus.classList.remove('hidden');
        uploadButton.disabled = true;
        progressBar.style.width = '0%';
        statusMessage.textContent = 'Preparing to upload...';
        result.classList.add('hidden');

        try {
            // Determine the appropriate folder based on file extension
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const folder = fileTypeMap[fileExtension] || 'other';
            
            // Create a unique file name
            const timestamp = new Date().getTime();
            const uniqueFileName = `${timestamp}-${file.name}`;
            const filePath = `${folder}/${uniqueFileName}`;
            
            // Create form data for the upload
            const formData = new FormData();
            formData.append('file', file);

            // Upload the file to Supabase Storage
            statusMessage.textContent = `Uploading to ${folder} folder...`;
            progressBar.style.width = '50%';

            // Using fetch to upload directly to Supabase Storage
            const response = await fetch(`${SUPABASE_STORAGE_URL}/${BUCKET_NAME}/${filePath}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'x-upsert': 'true'
                },
                body: file
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add to upload history
            const uploadRecord = {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                folder: folder,
                path: filePath,
                timestamp: new Date().toISOString(),
                url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
            };
            
            uploadHistory.unshift(uploadRecord); // Add to beginning of array
            if (uploadHistory.length > 100) { // Limit history to 100 entries
                uploadHistory = uploadHistory.slice(0, 100);
            }
            localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
            
            // Update UI to show success
            progressBar.style.width = '100%';
            statusMessage.textContent = `Upload successful! File stored in ${folder} folder.`;
            
            // Display the result
            result.classList.remove('hidden');
            resultJson.textContent = JSON.stringify({
                ...data,
                folder: folder,
                path: filePath,
                history: `${uploadHistory.length} files in upload history`
            }, null, 2);
            
            // Reset the form
            fileInput.value = '';
            fileName.textContent = 'No file chosen';
            
        } catch (error) {
            console.error('Error uploading file:', error);
            
            // Update UI to show error
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = '#f44336';
            statusMessage.textContent = `Error: ${error.message}`;
            
            // Display the error in the result area
            result.classList.remove('hidden');
            resultJson.textContent = JSON.stringify({ error: error.message }, null, 2);
        } finally {
            // Re-enable the upload button
            uploadButton.disabled = false;
        }
    });

    // Function to check if the bucket exists and create it if it doesn't
    async function checkAndCreateBucket() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/buckets?id=eq.${BUCKET_NAME}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                }
            });
            
            const data = await response.json();
            
            if (!data || data.length === 0) {
                // Bucket doesn't exist, create it
                const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/buckets`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'apikey': SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: BUCKET_NAME,
                        name: BUCKET_NAME,
                        public: true // Make it public for easier access
                    })
                });
                
                if (!createResponse.ok) {
                    console.error('Failed to create bucket:', await createResponse.text());
                } else {
                    console.log('Bucket created successfully');
                    // Create folder structure
                    await createFolderStructure();
                }
            } else {
                console.log('Bucket already exists');
                // Ensure folder structure exists
                await createFolderStructure();
            }
        } catch (error) {
            console.error('Error checking/creating bucket:', error);
        }
    }
    
    // Function to create the folder structure in the bucket
    async function createFolderStructure() {
        // Get unique folders from the file type map
        const folders = [...new Set(Object.values(fileTypeMap))];
        folders.push('other'); // Add 'other' folder for unrecognized file types
        
        // Create each folder by uploading an empty .keep file
        for (const folder of folders) {
            try {
                const emptyFile = new Blob([''], { type: 'text/plain' });
                await fetch(`${SUPABASE_STORAGE_URL}/${BUCKET_NAME}/${folder}/.keep`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'x-upsert': 'true'
                    },
                    body: emptyFile
                });
                console.log(`Created folder: ${folder}`);
            } catch (error) {
                console.error(`Error creating folder ${folder}:`, error);
            }
        }
    }
    
    // Function to display upload history
    function displayUploadHistory() {
        // Create a modal or panel to display upload history
        const historyContainer = document.createElement('div');
        historyContainer.id = 'history-container';
        historyContainer.className = 'history-container hidden';
        
        const historyHeader = document.createElement('div');
        historyHeader.className = 'history-header';
        historyHeader.innerHTML = `
            <h2>Upload History</h2>
            <button id="close-history">×</button>
        `;
        
        const historyContent = document.createElement('div');
        historyContent.className = 'history-content';
        
        if (uploadHistory.length === 0) {
            historyContent.innerHTML = '<p>No uploads yet</p>';
        } else {
            const historyTable = document.createElement('table');
            historyTable.className = 'history-table';
            historyTable.innerHTML = `
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Type</th>
                        <th>Folder</th>
                        <th>Size</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${uploadHistory.map(item => `
                        <tr>
                            <td><a href="${item.url}" target="_blank">${item.fileName}</a></td>
                            <td>${item.fileType}</td>
                            <td>${item.folder}</td>
                            <td>${formatFileSize(item.fileSize)}</td>
                            <td>${new Date(item.timestamp).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            historyContent.appendChild(historyTable);
        }
        
        historyContainer.appendChild(historyHeader);
        historyContainer.appendChild(historyContent);
        document.body.appendChild(historyContainer);
        
        // Add event listener to close button
        document.getElementById('close-history').addEventListener('click', () => {
            historyContainer.classList.add('hidden');
        });
        
        // Add history button to the main container
        const historyButton = document.createElement('button');
        historyButton.id = 'history-button';
        historyButton.textContent = 'View Upload History';
        historyButton.addEventListener('click', () => {
            historyContainer.classList.remove('hidden');
        });
        
        document.querySelector('.container').appendChild(historyButton);
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Check and create the bucket when the page loads
    checkAndCreateBucket();
    
    // Display upload history
    displayUploadHistory();
});
