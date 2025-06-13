import { SceneManager } from './SceneManager';
import { Mesh, DynamicTexture, StandardMaterial, Color3, Material, Texture } from '@babylonjs/core';
import { FordJohnsonSorter } from './FordJohnson';

export class ScreenManager {
    private sceneManager: SceneManager;
    private screenMesh: Mesh;
    private screenTexture!: DynamicTexture;
    private screenMaterial!: StandardMaterial;
    private inputText: string = '';
    private cursorVisible: boolean = true;
    private cursorIndex: number = 0;
    private lastCursorToggle: number = 0;
    private cursorBlinkInterval: number = 500;
    private commandHistory: string[] = [];
    private historyIndex: number = -1;
    private outputLines: string[] = [];
    private maxWidth: number = 472;
    private isInViewerMode: boolean = false;
    private viewerContentLines: string[] = [];
    private viewerScrollIndex: number = 0;
    private files: { [key: string]: string[] } = {
        '/': ['files', 'programs', 'images'],
        '/files': ['AboutMe.txt', 'Notes.txt', 'Bible.txt'],
        '/images': ['42.jpeg', 'grinch.jpg'],
        '/programs': ['fordjohnson']
    };
    private currentDirectory: string = '/';

    constructor(sceneManager: SceneManager, screenMesh: Mesh) {
        this.sceneManager = sceneManager;
        this.screenMesh = screenMesh;
        this.initializeInput();
    }

    initialize(): void {
        if (this.screenMesh.material) {
            this.screenTexture = new DynamicTexture('screenTexture', { width: 512, height: 512 }, this.sceneManager.scene, true);
            this.screenMaterial = new StandardMaterial('screenMat', this.sceneManager.scene);
            this.screenMaterial.diffuseTexture = this.screenTexture;
            this.screenMaterial.emissiveColor = new Color3(0, 1, 0);
            this.screenMaterial.alpha = 1;
            this.screenMaterial.backFaceCulling = false;
            this.screenMaterial.useAlphaFromDiffuseTexture = true;
            this.screenMaterial.transparencyMode = Material.MATERIAL_ALPHABLEND;
            this.screenMesh.material = this.screenMaterial;

            this.outputLines.push('Welcome to Ngaurama-Linux 1.8 LTS');
            this.outputLines.push('>> Type "help" to get started');
            this.outputLines.push('');
            this.renderContent();
        }
    }

    private initializeInput():void
    {
        window.addEventListener('keydown', (event) => {

            if (this.isInViewerMode) {
                if (event.key === 'ArrowDown') {
                    if (this.viewerScrollIndex < this.viewerContentLines.length - 1) {
                        this.viewerScrollIndex++;
                        this.renderViewer();
                    }
                } else if (event.key === 'ArrowUp') {
                    if (this.viewerScrollIndex > 0) {
                        this.viewerScrollIndex--;
                        this.renderViewer();
                    }
                } else if (event.key === 'q') {
                    this.isInViewerMode = false;
                    this.screenMesh.material = this.screenMaterial;
                    this.renderContent();
                }
                return;
            }
            if (event.key.length === 1 && this.inputText.length < 50){
                this.inputText = this.inputText.slice(0, this.cursorIndex) + event.key + this.inputText.slice(this.cursorIndex);
                this.cursorIndex++;
            } else if (event.key === 'Backspace' && this.cursorIndex > 0){
                this.inputText = this.inputText.slice(0, this.cursorIndex - 1) + this.inputText.slice(this.cursorIndex);
                this.cursorIndex--;
            } else if (event.key === 'Delete' && this.cursorIndex < this.inputText.length){
                this.inputText = this.inputText.slice(0, this.cursorIndex) + this.inputText.slice(this.cursorIndex + 1);
            } else if(event.key === 'Home' && this.cursorIndex > 0){
               this.cursorIndex = 0;
            } else if(event.key === 'End' && this.inputText.length < 50){
               this.cursorIndex = this.inputText.length;
            } else if(event.key === 'ArrowLeft' && this.cursorIndex > 0){
                this.cursorIndex--;
            } else if(event.key === 'ArrowRight' && this.cursorIndex < this.inputText.length){
                this.cursorIndex++;
            } else if (event.key === 'Enter'){
                if (this.inputText)
                    this.commandHistory.unshift(this.inputText);
                this.historyIndex = -1;
                this.handleCommand(this.inputText);
                this.inputText = '';
                this.cursorIndex = 0;
            } else if (event.key === 'ArrowUp') {
                if (this.historyIndex + 1 < this.commandHistory.length) {
                    this.historyIndex++;
                    this.inputText = this.commandHistory[this.historyIndex];
                    this.cursorIndex = this.inputText.length;
                }
            } else if (event.key === 'ArrowDown') {
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputText = this.commandHistory[this.historyIndex];
                    this.cursorIndex = this.inputText.length;
                } else {
                    this.historyIndex = -1;
                    this.inputText = '';
                    this.cursorIndex = 0;
                }
            } 
            this.renderContent();
        });
    }

    private handleCommand(command: string): void {
        let response = '';

        this.outputLines.push(`evaluator@42:~${this.currentDirectory} $ ${command}`);
        if (command === 'help') {
            response = 'Available commands:\n > ls\n> help\n > clear\n > cd [dir] \n > cat [*.txt]\n > view [*.jpg/jpeg/png]\n > run [fordjohnson {numbers}]';
        } else if (command === 'clear') {
            this.outputLines = [];
            this.outputLines.push('Welcome to Ngaurama-Linux 1.8 LTS');
            this.outputLines.push('>> Type "help" to get started');
            this.outputLines.push('');
            return this.renderContent();
        } else if (command === 'ls') {
            response = `Directory ${this.currentDirectory}: ${this.files[this.currentDirectory].join(', ')}`;
        } else if (command.toLowerCase().startsWith('cd')) {
            const parts = command.split(' ').filter(part => part.trim() !== '');
            if (parts.length === 2) {
                const dir = parts[1].toLowerCase();
                if (dir === '..' && this.currentDirectory !== '/') {
                    this.currentDirectory = '/';
                } else if (this.files[this.currentDirectory].includes(dir)) {
                    this.currentDirectory = `/${dir}`;
                } else {
                    response = `Directory '${parts[1]}' not found.`;
                }
            } else {
                response = 'Usage: cd [dir] (e.g., cd files, cd ..)';
            }
        }
        else if (command.toLowerCase().startsWith('cat')) {
            const parts = command.split(' ').filter(part => part.trim() !== '');
            if (parts.length === 2 && !(parts[1].toLowerCase().endsWith(".jpg") || parts[1].toLowerCase().endsWith(".jpeg"))) {
                const file = parts[1];
                if (this.files[this.currentDirectory].includes(file)) {
                    this.loadAndViewFile(import.meta.env.BASE_URL + `/files/${file}`);
                } else {
                    response = `File '${file}' not found in ${this.currentDirectory}.`;
                }
            } else {
                response = 'Usage: cat [file]';
            }
        } else if (command.toLowerCase().startsWith('view')) {
            const parts = command.split(' ').filter(part => part.trim() !== '');
            if (parts.length === 2 && (parts[1].toLowerCase().endsWith(".jpg") || parts[1].toLowerCase().endsWith(".jpeg"))) {
                const file = parts[1];
                if (this.files[this.currentDirectory].includes(file)) {
                    this.loadAndViewImage(import.meta.env.BASE_URL + `/images/${file}`);
                } else {
                    response = `Image '${file}' not found in ${this.currentDirectory}.`;
                }
            } else {
                response = 'Usage: view [image.jpg/jpeg]';
            }
        } else if (command.toLowerCase() === 'pwd') {
            response = `Current directory: ${this.currentDirectory}`;
        } else if (command.startsWith('run fordjohnson')) {
            if (this.currentDirectory !== '/programs') {
                response = `Error: Program fordjohnson not found in ${this.currentDirectory}.`;
            } else {
                const numbers = this.parseFordJohnsonCommand(command);
                if (numbers) {
                    const sorter = new FordJohnsonSorter();
                    const sorted = sorter.sort(numbers);
                    response = `Sorted: ${sorted.join(', ')}`;
                } else {
                    response = 'Invalid format. Use: run fordjohnson [numbers]';
                }
            }
        } else if (!command)
            this.update();
        else {
            response = `Command '${command}' not recognized. Type 'help' for assistance.`;
        }
        if (response) {
            const lines = response.split('\n');
            for (const line of lines) {
                this.outputLines.push(line);
            }
        }
        //this.outputLines.push('');
        this.renderContent();
}

    private async loadAndViewImage(filePath: string): Promise<void> {
        try {
            this.isInViewerMode = true;
            this.viewerScrollIndex = 0;
            const img = new Image();
            img.src = filePath;

            img.onload = () => {
                const texture = new Texture(filePath, this.sceneManager.scene, true, false, Texture.TRILINEAR_SAMPLINGMODE, () => {
                    const imageMaterial = new StandardMaterial("imageMaterial", this.sceneManager.scene);
                    texture.uScale = 1;
                    texture.vScale = -1;
                    imageMaterial.diffuseTexture = texture;
                    imageMaterial.emissiveColor = new Color3(1, 1, 1);
                    imageMaterial.backFaceCulling = false;
                    this.screenMesh.material = imageMaterial;
                }, (msg, err) => {
                    console.error("Failed to load texture:", msg, err);
                    this.enterViewerMode(`Failed to load image from ${filePath}`);
                });
            };
            img.onerror = (err) => {
                console.error("Image load error", err);
                this.enterViewerMode(`Failed to load image from ${filePath}`);
            };
        } catch (error) {
            this.enterViewerMode(`Error loading ${filePath}: ${error}`);
        }
    }

    private async loadAndViewFile(filePath: string): Promise<void> {
        try {
            const response = await fetch(filePath);
            const content = await response.text();
            this.enterViewerMode(content);
        } catch (error) {
            this.enterViewerMode(`Error loading ${filePath}: ${error}`);
        }
    }

   private enterViewerMode(content: string): void {
        this.isInViewerMode = true;
        this.viewerScrollIndex = 0;
        const paragraphs = content.split(/\n\s*\n/).map(p => p.replace(/\n/g, ' '));
        this.viewerContentLines = [];
        for (let i = 0; i < paragraphs.length; i++) {
            this.viewerContentLines.push(paragraphs[i]);
            if (i < paragraphs.length - 1) {
                this.viewerContentLines.push('');
            }
        }
        this.renderViewer();
    }


    private renderViewer(): void {
        const ctx = this.screenTexture.getContext() as CanvasRenderingContext2D;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 512, 512);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#00FF00';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const visibleLines = this.viewerContentLines.slice(this.viewerScrollIndex, this.viewerScrollIndex + 22);
        let y = 20;
        for (const line of visibleLines) {
            if (y + 20 > 460) break;
            if (line.trim() === '')
            {
                y += 20;
                continue;
            }
            const words = line.split(' ');
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const width = ctx.measureText(testLine).width;
                if (width <= this.maxWidth) {
                    currentLine = testLine;
                } else {
                    ctx.fillText(currentLine, 20, y);
                    y += 20;
                    currentLine = word;
                }
                if (y + 20 > 460) break;
            }
            if (currentLine) {
                ctx.fillText(currentLine, 20, y);
                y += 20;
            }
        }

        ctx.fillStyle = '#557700';
        ctx.fillText('     -- Arrow Keys to Navigate, Q to Exit --', 20, 480);
        this.screenTexture.update();
    }

    private parseFordJohnsonCommand(command: string): number[] | null {
        const parts = command.split(' ').filter(part => part !== './fordjohnson' && part.trim() !== '');
        const numbers = parts.map(part => parseInt(part)).filter(num => !isNaN(num));
        return numbers.length > 0 ? numbers : null;
    }
    
    renderContent(): void {
        const ctx = this.screenTexture.getContext() as CanvasRenderingContext2D;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 512, 512);
        ctx.font = '18px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        const calculateWrappedLines = (text: string, maxWidth: number): number => {
            if (!text) return 1;
            const words = text.split(' ');
            let currentLine = '';
            let lineCount = 0;
            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const width = ctx.measureText(testLine).width;
                if (width <= maxWidth) {
                    currentLine = testLine;
                } else {
                    lineCount++;
                    currentLine = word;
                }
            }
            if (currentLine) {
                lineCount++;
            }
            return Math.max(lineCount, 1);
        };

        let totalRenderedLines = 0;
        const lineHeights: number[] = [];
        
        for (const line of this.outputLines) {
            let wrappedLines: number;
            if (line.startsWith('evaluator@42')) {
                const promptEnd = line.indexOf('$ ') + 2;
                const prompt = line.substring(0, promptEnd);
                const command = line.substring(promptEnd);
                const promptLines = calculateWrappedLines(prompt, this.maxWidth);
                let commandLines = 0;
                if (command) {
                    const promptWidth = ctx.measureText(prompt).width;
                    const remainingWidth = this.maxWidth - promptWidth;
                    const commandWords = command.split(' ');
                    let currentLine = '';
                    let firstLine = true;
                    
                    for (const word of commandWords) {
                        const testLine = currentLine + (currentLine ? ' ' : '') + word;
                        const width = ctx.measureText(testLine).width;
                        const availableWidth = firstLine ? remainingWidth : this.maxWidth;
                        
                        if (width <= availableWidth) {
                            currentLine = testLine;
                        } else {
                            commandLines++;
                            currentLine = word;
                            firstLine = false;
                        }
                    }
                    if (currentLine) {
                        commandLines++;
                    }
                }
                
                wrappedLines = Math.max(promptLines, commandLines > 0 ? commandLines : 1);
            } else {
                wrappedLines = calculateWrappedLines(line, this.maxWidth);
            }
            
            lineHeights.push(wrappedLines);
            totalRenderedLines += wrappedLines;
        }
        const maxDisplayLines = 24;
        const promptReservedLines = 2;
        const availableLines = maxDisplayLines - promptReservedLines;
        let displayLines = 0;
        let startIndex = this.outputLines.length;
        
        for (let i = this.outputLines.length - 1; i >= 0; i--) {
            const linesNeeded = lineHeights[i];
            if (displayLines + linesNeeded <= availableLines) {
                displayLines += linesNeeded;
                startIndex = i;
            } else {
                break;
            }
        }
        let y = 20;
        const outputToRender = this.outputLines.slice(startIndex);
        
        for (const line of outputToRender) {
            if (line.startsWith('evaluator@42')) {
                const promptEnd = line.indexOf('$ ') + 2;
                const prompt = line.substring(0, promptEnd);
                const command = line.substring(promptEnd);
                
                ctx.fillStyle = '#00FF00';
                let currentLine = '';
                let x = 20;
                const words = prompt.split(' ');
                for (const word of words) {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const width = ctx.measureText(testLine).width;
                    if (width <= this.maxWidth) {
                        currentLine = testLine;
                    } else {
                        ctx.fillText(currentLine, 20, y);
                        y += 20;
                        currentLine = word;
                    }
                }
                if (currentLine) {
                    ctx.fillText(currentLine, x, y);
                    x += ctx.measureText(currentLine).width;
                }

                if (command) {
                    ctx.fillStyle = '#FFFFFF';
                    const commandWords = command.split(' ');
                    currentLine = '';
                    for (const word of commandWords) {
                        const testLine = currentLine + (currentLine ? ' ' : '') + word;
                        const width = ctx.measureText(testLine).width;
                        if (width <= this.maxWidth - x) {
                            currentLine = testLine;
                        } else {
                            ctx.fillText(currentLine, x, y);
                            y += 20;
                            x = 20;
                            currentLine = word;
                        }
                    }
                    if (currentLine) {
                        ctx.fillText(currentLine, x, y);
                    }
                }
                y += 20;
            } else if (line) {
                ctx.fillStyle = (line.startsWith("Welcome") || line.startsWith(">>")) ? '#FFFFFF' : '#FFFF00';
                let currentLine = '';
                const words = line.split(' ');
                for (const word of words) {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const width = ctx.measureText(testLine).width;
                    if (width <= this.maxWidth) {
                        currentLine = testLine;
                    } else {
                        ctx.fillText(currentLine, 20, y);
                        y += 20;
                        currentLine = word;
                    }
                }
                if (currentLine) {
                    ctx.fillText(currentLine, 20, y);
                    y += 20;
                }
            } else {
                y += 20;
            }
        }

        const promptPrefix = `evaluator@42:~${this.currentDirectory} $ `;
        ctx.fillStyle = '#00FF00';
        ctx.fillText(promptPrefix, 20, y);
        if (this.inputText) {
            ctx.fillStyle = '#FFFFFF';
            const promptWidth = ctx.measureText(promptPrefix).width;
            let currentLine = '';
            let yOffset = y;
            let isFirstLine = true;

            for (let i = 0; i < this.inputText.length; i++) {
                currentLine += this.inputText[i];
                const width = ctx.measureText(currentLine).width;

                const currentAvailableWidth = isFirstLine ? (this.maxWidth - promptWidth) : this.maxWidth;
                if (width > currentAvailableWidth) {
                    const xOffset = isFirstLine ? (20 + promptWidth) : 20;
                    ctx.fillText(currentLine.slice(0, -1), xOffset, yOffset);
                    yOffset += 20;
                    currentLine = this.inputText[i];
                    isFirstLine = false;
                }
            }
            const xOffset = isFirstLine ? (20 + promptWidth) : 20;
            if (currentLine) {
                ctx.fillText(currentLine, xOffset, yOffset);
            }
       }

       if (this.cursorVisible && !this.isInViewerMode) {
            const promptWidth = ctx.measureText(promptPrefix).width;
            let currentLine = '';
            let yOffset = y;
            let isFirstLine = true;
            let cursorX = 15 + promptWidth;
            let charsInCurrentLine = 0;

            let foundCursorPos = false;
            outerLoop:
            for (let i = 0; i < this.inputText.length; i++) {
                if (i === this.cursorIndex)
                {
                    foundCursorPos = true;
                    break;
                }
                currentLine += this.inputText[i] || '';
                charsInCurrentLine++;
                const width = ctx.measureText(currentLine).width;

                const currentAvailableWidth = isFirstLine ? (this.maxWidth - promptWidth) : this.maxWidth;
                if (width > currentAvailableWidth) {
                    yOffset += 20;
                    currentLine = this.inputText[i] || '';
                    charsInCurrentLine = 1;
                    isFirstLine = false;
                }
                if (i === this.inputText.length - 1 && this.cursorIndex === this.inputText.length)
                {
                    foundCursorPos = true;
                    currentLine += '';
                    break;
                }
            }
            if (foundCursorPos)
            {
                cursorX = isFirstLine
                    ? 15 + promptWidth + ctx.measureText(currentLine).width
                    : 15 + ctx.measureText(currentLine).width;
            }

            ctx.fillStyle = '#00FFFF';
            ctx.fillText('┃', cursorX, yOffset);
        }
        this.screenTexture.update();
    }

    update(): void {
        const now = performance.now();
        if (this.isInViewerMode)
        {
            this.renderViewer();
        }
        else
        {
            if (now - this.lastCursorToggle > this.cursorBlinkInterval) {
                this.cursorVisible = !this.cursorVisible;
                this.lastCursorToggle = now;
                this.renderContent();
            }
        }
    }
}
