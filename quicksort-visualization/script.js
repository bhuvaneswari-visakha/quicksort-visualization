class QuickSortVisualizer {
    constructor() {
        this.array = [];
        this.arraySize = 20;
        this.speed = 300;
        this.comparisons = 0;
        this.swaps = 0;
        this.isSorting = false;
        this.stepMode = true;
        this.waitingForNextStep = false;
        this.nextStepResolve = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.generateArray();
    }

    initializeElements() {
        this.arrayContainer = document.getElementById('arrayContainer');
        this.generateBtn = document.getElementById('generateBtn');
        this.sortBtn = document.getElementById('sortBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.arraySizeSlider = document.getElementById('arraySize');
        this.speedSlider = document.getElementById('speed');
        this.arraySizeValue = document.getElementById('arraySizeValue');
        this.speedValue = document.getElementById('speedValue');
        this.comparisonsDisplay = document.getElementById('comparisons');
        this.swapsDisplay = document.getElementById('swaps');
        this.statusDisplay = document.getElementById('status');
        this.stepModeCheckbox = document.getElementById('stepMode');
        this.stepControls = document.getElementById('stepControls');
        this.nextStepBtn = document.getElementById('nextStepBtn');
        this.speedControl = document.getElementById('speedControl');
    }

    attachEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateArray());
        this.sortBtn.addEventListener('click', () => this.startSort());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.arraySizeSlider.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            this.arraySizeValue.textContent = this.arraySize;
            if (!this.isSorting) {
                this.generateArray();
            }
        });
        
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedValue.textContent = this.speed;
        });

        this.stepModeCheckbox.addEventListener('change', (e) => {
            this.stepMode = e.target.checked;
            this.speedControl.style.display = this.stepMode ? 'none' : 'flex';
        });

        this.nextStepBtn.addEventListener('click', () => {
            if (this.waitingForNextStep && this.nextStepResolve) {
                this.nextStepResolve();
                this.waitingForNextStep = false;
            }
        });
    }

    generateArray() {
        this.array = [];
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push(Math.floor(Math.random() * 100) + 20);
        }
        this.comparisons = 0;
        this.swaps = 0;
        this.updateStats();
        this.renderArray();
        this.updateStatus('Ready');
    }

    renderArray(highlightIndices = {}) {
        this.arrayContainer.innerHTML = '';
        const maxValue = Math.max(...this.array);
        
        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${(value / maxValue) * 100}%`;
            
            // Apply highlighting
            if (highlightIndices.pivot === index) {
                bar.classList.add('pivot');
            } else if (highlightIndices.comparing && highlightIndices.comparing.includes(index)) {
                bar.classList.add('comparing');
            } else if (highlightIndices.swapping && highlightIndices.swapping.includes(index)) {
                bar.classList.add('swapping');
            } else if (highlightIndices.sorted && highlightIndices.sorted.includes(index)) {
                bar.classList.add('sorted');
            }
            
            const valueLabel = document.createElement('div');
            valueLabel.className = 'array-bar-value';
            valueLabel.textContent = value;
            bar.appendChild(valueLabel);
            
            this.arrayContainer.appendChild(bar);
        });
    }

    updateStats() {
        this.comparisonsDisplay.textContent = this.comparisons;
        this.swapsDisplay.textContent = this.swaps;
    }

    updateStatus(status) {
        this.statusDisplay.textContent = status;
    }

    async sleep(ms) {
        if (this.stepMode) {
            // In step mode, wait for user to click next
            return new Promise(resolve => {
                this.waitingForNextStep = true;
                this.nextStepResolve = resolve;
            });
        } else {
            // In auto mode, use timer
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    async startSort() {
        if (this.isSorting) return;
        
        this.isSorting = true;
        this.disableControls();
        
        // Show step controls if in step mode
        if (this.stepMode) {
            this.stepControls.style.display = 'flex';
        }
        
        this.updateStatus('Starting QuickSort...');
        await this.sleep(this.speed);
        
        await this.quickSort(0, this.array.length - 1);
        
        // Mark all as sorted with celebration
        this.updateStatus('All elements sorted! 🎉');
        await this.renderArray({ sorted: Array.from({ length: this.array.length }, (_, i) => i) });
        
        if (!this.stepMode) {
            await this.sleep(this.speed * 2);
        }
        
        this.updateStatus('Completed! Click Reset to try again.');
        this.stepControls.style.display = 'none';
        this.isSorting = false;
        this.enableControls();
    }

    async quickSort(low, high, sortedIndices = []) {
        if (low < high) {
            this.updateStatus(`Sorting partition from index ${low} to ${high}`);
            await this.sleep(this.speed * 0.8);
            
            const pivotIndex = await this.partition(low, high, sortedIndices);
            
            // Show partition complete
            this.updateStatus(`Partition complete! Pivot at index ${pivotIndex}`);
            await this.sleep(this.speed);
            
            // Recursively sort left partition
            if (low < pivotIndex - 1) {
                this.updateStatus(`Sorting LEFT partition (${low} to ${pivotIndex - 1})`);
                await this.sleep(this.speed * 0.8);
                await this.quickSort(low, pivotIndex - 1, sortedIndices);
            }
            
            // Recursively sort right partition
            if (pivotIndex + 1 < high) {
                this.updateStatus(`Sorting RIGHT partition (${pivotIndex + 1} to ${high})`);
                await this.sleep(this.speed * 0.8);
                await this.quickSort(pivotIndex + 1, high, sortedIndices);
            }
        } else if (low === high) {
            // Single element is already sorted
            sortedIndices.push(low);
            this.updateStatus(`Single element at index ${low} is sorted`);
            await this.renderArray({ sorted: sortedIndices });
            await this.sleep(this.speed * 0.5);
        }
    }

    async partition(low, high, sortedIndices) {
        const pivot = this.array[high];
        let i = low - 1;
        
        // Step 1: Show pivot selection
        this.updateStatus(`Selecting pivot: ${pivot} at index ${high}`);
        await this.renderArray({ pivot: high, sorted: sortedIndices });
        await this.sleep(this.speed * 1.5);
        
        for (let j = low; j < high; j++) {
            // Step 2: Show comparison
            this.comparisons++;
            this.updateStats();
            this.updateStatus(`Comparing: ${this.array[j]} with pivot ${pivot}`);
            await this.renderArray({ 
                pivot: high, 
                comparing: [j],
                sorted: sortedIndices 
            });
            await this.sleep(this.speed);
            
            if (this.array[j] < pivot) {
                i++;
                this.updateStatus(`${this.array[j]} < ${pivot}, moving to partition`);
                await this.sleep(this.speed * 0.5);
                
                if (i !== j) {
                    // Step 3: Show swap preparation
                    this.updateStatus(`Swapping ${this.array[i]} and ${this.array[j]}`);
                    await this.renderArray({ 
                        pivot: high, 
                        swapping: [i, j],
                        sorted: sortedIndices 
                    });
                    await this.sleep(this.speed * 1.2);
                    
                    // Step 4: Perform swap
                    [this.array[i], this.array[j]] = [this.array[j], this.array[i]];
                    this.swaps++;
                    this.updateStats();
                    
                    // Step 5: Show result after swap
                    this.updateStatus(`Swapped! New positions updated`);
                    await this.renderArray({ 
                        pivot: high,
                        sorted: sortedIndices 
                    });
                    await this.sleep(this.speed);
                }
            } else {
                this.updateStatus(`${this.array[j]} >= ${pivot}, no swap needed`);
                await this.sleep(this.speed * 0.7);
            }
        }
        
        // Step 6: Place pivot in correct position
        this.updateStatus(`Placing pivot ${pivot} in correct position`);
        await this.sleep(this.speed * 0.5);
        
        if (i + 1 !== high) {
            this.updateStatus(`Final swap: placing pivot between partitions`);
            await this.renderArray({ 
                swapping: [i + 1, high],
                sorted: sortedIndices 
            });
            await this.sleep(this.speed * 1.2);
            
            [this.array[i + 1], this.array[high]] = [this.array[high], this.array[i + 1]];
            this.swaps++;
            this.updateStats();
            
            // Show pivot in final position
            sortedIndices.push(i + 1);
            this.updateStatus(`Pivot ${pivot} is now in correct position!`);
            await this.renderArray({ 
                sorted: sortedIndices 
            });
            await this.sleep(this.speed * 1.5);
        }
        
        return i + 1;
    }

    reset() {
        if (this.isSorting) return;
        this.generateArray();
    }

    disableControls() {
        this.generateBtn.disabled = true;
        this.sortBtn.disabled = true;
        this.arraySizeSlider.disabled = true;
        this.stepModeCheckbox.disabled = true;
        this.speedSlider.disabled = true;
    }

    enableControls() {
        this.generateBtn.disabled = false;
        this.sortBtn.disabled = false;
        this.arraySizeSlider.disabled = false;
        this.stepModeCheckbox.disabled = false;
        this.speedSlider.disabled = false;
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QuickSortVisualizer();
});
