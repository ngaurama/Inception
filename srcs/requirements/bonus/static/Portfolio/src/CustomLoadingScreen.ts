export class CustomLoadingScreen {

    loadingUIBackgroundColor: string = "#000000";
    loadingUIText: string = "Loading...";

    constructor() {

    }

    displayLoadingUI() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            this.updateProgress(0);
        }
    }

    hideLoadingUI() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    updateProgress(progress: number) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, progress)}%`;
        }
    }
}
