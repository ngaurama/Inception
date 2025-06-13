import { SceneManager } from './SceneManager';

export class CameraControls {
    private sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    setupControls(): void {
        this.sceneManager.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    }

    private handleWheel(event: WheelEvent): void {
        event.preventDefault();

        if (this.sceneManager.isAnimating || this.sceneManager.computerMeshes.length === 0 || !this.sceneManager.camera) return;

        const delta = (event.deltaY / 100) * 0.2;
        const isZoomingOut = delta > 0;
        if (isZoomingOut && this.sceneManager.camera.radius >= this.sceneManager.maxZoomDistance) {
            return;
        }
        if (this.sceneManager.isAligned) {
            const newRadius = Math.max(this.sceneManager.minZoomDistance, Math.min(this.sceneManager.maxZoomDistance, this.sceneManager.camera.radius + delta));
            this.sceneManager.camera.radius = newRadius;
        }
        
    }
}
