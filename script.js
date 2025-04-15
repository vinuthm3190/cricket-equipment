// Model: Data storage and management
class EquipmentManager {
    constructor() {
        this.lists = JSON.parse(localStorage.getItem('cricketEquipmentLists')) || [];
        this.activeListId = null;
    }
    
    saveToLocalStorage() {
        localStorage.setItem('cricketEquipmentLists', JSON.stringify(this.lists));
    }
    
    createList(name) {
        const newList = {
            id: Date.now(),
            name: name.trim(),
            items: []
        };
        
        this.lists.push(newList);
        this.activeListId = newList.id;
        this.saveToLocalStorage();
        return newList;
    }
    
    deleteList(id) {
        const index = this.lists.findIndex(list => list.id === id);
        if (index !== -1) {
            this.lists.splice(index, 1);
            
            if (this.activeListId === id) {
                this.activeListId = this.lists.length > 0 ? this.lists[0].id : null;
            }
            
            this.saveToLocalStorage();
        }
    }
    
    addItem(item) {
        const list = this.getActiveList();
        if (list) {
            list.items.push({
                id: Date.now(),
                ...item
            });
            this.saveToLocalStorage();
        }
    }
    
    removeItem(itemId) {
        const list = this.getActiveList();
        if (list) {
            list.items = list.items.filter(item => item.id !== itemId);
            this.saveToLocalStorage();
        }
    }
    
    getActiveList() {
        return this.lists.find(list => list.id === this.activeListId) || null;
    }
    
    setActiveList(id) {
        this.activeListId = id;
    }
    
    generateListContent() {
        const list = this.getActiveList();
        if (!list) return '';
        
        let content = `Cricket Kit for: ${list.name}\n\n`;
        
        if (list.items.length > 0) {
            content += `Equipment List:\n`;
            list.items.forEach(item => {
                content += `- ${item.name} (Quantity: ${item.quantity})\n`;
                content += `  Type: ${item.category}\n`;
                if (item.size) content += `  Size: ${item.size}\n`;
                if (item.brand) content += `  Brand: ${item.brand}\n`;
                content += '\n';
            });
            
            content += `\nTotal Items: ${list.items.length}\n`;
        } else {
            content += 'No items in this list yet.';
        }
        
        return content;
    }
}

// Controller: Managing UI and Events
class EquipmentController {
    constructor() {
        this.manager = new EquipmentManager();
        this.initializeUI();
        this.refreshUI();
        this.setupEventListeners();
    }
    
    initializeUI() {
        // Elements for creating lists
        this.personNameInput = document.getElementById('personName');
        this.createListBtn = document.getElementById('createListBtn');
        this.listTabs = document.getElementById('listTabs');
        
        // Elements for adding items
        this.addItemForm = document.getElementById('addItemForm');
        this.addItemHeader = document.getElementById('addItemHeader');
        this.itemNameSelect = document.getElementById('itemName');
        this.customItemField = document.getElementById('customItemField');
        this.customItemNameInput = document.getElementById('customItemName');
        this.quantityInput = document.getElementById('quantity');
        this.sizeSelect = document.getElementById('size');
        this.brandInput = document.getElementById('brand');
        this.typeRadios = document.getElementsByName('itemType');
        this.addItemBtn = document.getElementById('addItemBtn');
        
        // Elements for displaying items
        this.equipmentList = document.getElementById('equipmentList');
        this.equipmentListHeader = document.getElementById('equipmentListHeader');
        this.itemsTable = document.getElementById('itemsTable');
        this.itemsTableBody = document.getElementById('itemsTableBody');
        this.noItemsMessage = document.getElementById('noItemsMessage');
        this.totalItems = document.getElementById('totalItems');
        this.itemCount = document.getElementById('itemCount');
        
        // Elements for sharing
        this.sharingOptions = document.getElementById('sharingOptions');
        this.viewListBtn = document.getElementById('viewListBtn');
        this.showQRBtn = document.getElementById('showQRBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.previewSection = document.getElementById('previewSection');
        this.listPreview = document.getElementById('listPreview');
        this.qrCodeView = document.getElementById('qrCodeView');
        this.qrCodeHeader = document.getElementById('qrCodeHeader');
        this.qrCode = document.getElementById('qrCode');
        this.listView = document.getElementById('listView');
        this.listViewHeader = document.getElementById('listViewHeader');
        this.listViewContent = document.getElementById('listViewContent');
    }
    
    setupEventListeners() {
        // Create list event
        this.createListBtn.addEventListener('click', () => this.createList());
        
        // Item form events
        this.itemNameSelect.addEventListener('change', () => this.toggleCustomItemField());
        this.addItemBtn.addEventListener('click', () => this.addItem());
        
        // Sharing options
        this.viewListBtn.addEventListener('click', () => this.showListView());
        this.showQRBtn.addEventListener('click', () => this.showQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadList());
    }
    
    refreshUI() {
        this.renderListTabs();
        this.updateActiveListUI();
    }
    
    renderListTabs() {
        this.listTabs.innerHTML = '';
        
        if (this.manager.lists.length === 0) {
            this.listTabs.classList.add('hidden');
            return;
        }
        
        this.listTabs.classList.remove('hidden');
        
        this.manager.lists.forEach(list => {
            const tab = document.createElement('div');
            tab.className = `tab ${list.id === this.manager.activeListId ? 'active' : ''}`;
            tab.innerHTML = `
                ${list.name}
                <span class="tab-close" data-id="${list.id}">×</span>
            `;
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.manager.setActiveList(list.id);
                    this.refreshUI();
                }
            });
            
            this.listTabs.appendChild(tab);
        });
        
        // Add event listeners to close buttons
        document.querySelectorAll('.tab-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.manager.deleteList(id);
                this.refreshUI();
            });
        });
    }
    
    updateActiveListUI() {
        const activeList = this.manager.getActiveList();
        
        // Hide all forms/lists if no active list
        if (!activeList) {
            this.addItemForm.classList.add('hidden');
            this.equipmentList.classList.add('hidden');
            this.sharingOptions.classList.add('hidden');
            return;
        }
        
        // Update the add item form
        this.addItemForm.classList.remove('hidden');
        this.addItemHeader.textContent = `Add New Item for ${activeList.name}`;
        
        // Update the equipment list
        this.equipmentList.classList.remove('hidden');
        this.equipmentListHeader.textContent = `${activeList.name}'s Equipment`;
        
        // Render items table
        this.renderItemsTable(activeList);
        
        // Update sharing options
        this.sharingOptions.classList.remove('hidden');
        this.listPreview.textContent = this.manager.generateListContent();
        this.qrCodeHeader.textContent = `QR Code for ${activeList.name}`;
        this.listViewHeader.textContent = `${activeList.name}'s Cricket Kit`;
    }
    
    renderItemsTable(list) {
        this.itemsTableBody.innerHTML = '';
        
        if (!list.items || list.items.length === 0) {
            this.itemsTable.classList.add('hidden');
            this.noItemsMessage.classList.remove('hidden');
            this.totalItems.classList.add('hidden');
            return;
        }
        
        this.itemsTable.classList.remove('hidden');
        this.noItemsMessage.classList.add('hidden');
        this.totalItems.classList.remove('hidden');
        this.itemCount.textContent = list.items.length;
        
        list.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.category}</td>
                <td>${item.size || "-"}</td>
                <td>${item.brand || "-"}</td>
                <td>
                    <button class="btn danger-btn remove-item-btn" data-id="${item.id}">Remove</button>
                </td>
            `;
            
            this.itemsTableBody.appendChild(row);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                this.manager.removeItem(id);
                this.refreshUI();
            });
        });
    }
    
    createList() {
        const name = this.personNameInput.value.trim();
        if (name === '') return;
        
        this.manager.createList(name);
        this.personNameInput.value = '';
        this.refreshUI();
    }
    
    toggleCustomItemField() {
        if (this.itemNameSelect.value === 'custom') {
            this.customItemField.classList.remove('hidden');
        } else {
            this.customItemField.classList.add('hidden');
        }
    }
    
    addItem() {
        const itemName = this.itemNameSelect.value;
        if (itemName === '') return;
        
        const name = itemName === 'custom' ? this.customItemNameInput.value.trim() : itemName;
        if (name === '') return;
        
        // Get selected type value
        let category = 'Youth'; // Default
        for (const radio of this.typeRadios) {
            if (radio.checked) {
                category = radio.value;
                break;
            }
        }
        
        const item = {
            name: name,
            quantity: parseInt(this.quantityInput.value) || 1,
            size: this.sizeSelect.value,
            brand: this.brandInput.value.trim(),
            category: category
        };
        
        this.manager.addItem(item);
        
        // Reset form
        this.itemNameSelect.value = '';
        this.customItemNameInput.value = '';
        this.quantityInput.value = 1;
        this.sizeSelect.value = '';
        this.brandInput.value = '';
        this.customItemField.classList.add('hidden');
        
        // Update UI
        this.refreshUI();
    }
    
    showListView() {
        // Hide QR code view and show list view
        this.qrCodeView.classList.add('hidden');
        this.listView.classList.remove('hidden');
        this.previewSection.classList.add('hidden');
        
        // Update list view content
        this.listViewContent.textContent = this.manager.generateListContent();
    }
    
    showQRCode() {
        // Hide list view and show QR code view
        this.listView.classList.add('hidden');
        this.qrCodeView.classList.remove('hidden');
        this.previewSection.classList.add('hidden');
        
        // Generate QR code
        this.generateQRCode(this.manager.generateListContent());
    }
    
    downloadList() {
        const activeList = this.manager.getActiveList();
        if (!activeList || !activeList.items || activeList.items.length === 0) return;
        
        const content = this.manager.generateListContent();
        const filename = `${activeList.name}_cricket_kit.txt`;
        
        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        
        // Create temporary link and trigger download
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Show feedback
        const originalText = this.downloadBtn.textContent;
        this.downloadBtn.textContent = 'Downloaded!';
        setTimeout(() => {
            this.downloadBtn.textContent = originalText;
        }, 2000);
    }
    
    generateQRCode(text) {
        // Get active list
        const activeList = this.manager.getActiveList();
        if (!activeList) return;
        
        // Clear previous QR code
        this.qrCode.innerHTML = '';
        
        // Create a QR code-like visual
        const scale = 10;
        const quietZone = 2;
        
        // Generate a deterministic seed based on name and content
        const nameHash = Array.from(activeList.name).reduce((acc, char) => 
            ((acc << 5) - acc) + char.charCodeAt(0), 0);
        
        const contentHash = Array.from(text).reduce((acc, char) => 
            ((acc << 5) - acc) + char.charCodeAt(0), 0);
        
        let seed = Math.abs(nameHash * 31 + contentHash);
        
        // Function to generate random but deterministic values
        const random = (max) => {
            seed = (seed * 9301 + 49297) % 233280;
            return Math.floor((seed / 233280) * max);
        };
        
        // Create a grid for the QR code
        const grid = [];
        for (let y = 0; y < scale; y++) {
            const row = [];
            for (let x = 0; x < scale; x++) {
                // QR code position markers in corners
                if ((x < 3 && y < 3) || 
                    (x < 3 && y >= scale - 3) || 
                    (x >= scale - 3 && y < 3)) {
                    row.push(1);
                } else if (x === 6 || y === 6) {
                    // Timing pattern
                    row.push(x % 2 === 0 ? 1 : 0);
                } else {
                    // Random data for visual effect
                    row.push(random(2));
                }
            }
            grid.push(row);
        }
        
        // Create QR code container
        const qrContainer = document.createElement('div');
        qrContainer.style.display = 'grid';
        qrContainer.style.gridTemplateColumns = `repeat(${scale + quietZone * 2}, 1fr)`;
        qrContainer.style.gap = '0';
        qrContainer.style.width = '100%';
        qrContainer.style.height = '100%';
        
        // Add cells to QR code
        for (let y = 0; y < scale + quietZone * 2; y++) {
            for (let x = 0; x < scale + quietZone * 2; x++) {
                const cell = document.createElement('div');
                
                // Check if in quiet zone
                const qrX = x - quietZone;
                const qrY = y - quietZone;
                
                if (qrX < 0 || qrX >= scale || qrY < 0 || qrY >= scale) {
                    // Quiet zone - white
                    cell.style.backgroundColor = 'white';
                } else {
                    // QR code cells
                    cell.style.backgroundColor = grid[qrY][qrX] ? 'black' : 'white';
                }
                
                cell.style.width = '100%';
                cell.style.height = '100%';
                qrContainer.appendChild(cell);
            }
        }
        
        // Add QR code to container
        this.qrCode.appendChild(qrContainer);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new EquipmentController();
});