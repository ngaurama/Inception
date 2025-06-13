import { SceneManager } from './SceneManager';
import { RotationAnimations } from './RotationAnimations';

export class CameraControls {
    private sceneManager: SceneManager;
    private rotationAnimations: RotationAnimations;

    constructor(sceneManager: SceneManager, rotationAnimations: RotationAnimations) {
        this.sceneManager = sceneManager;
        this.rotationAnimations = rotationAnimations;
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
        const now = performance.now();
        if (!this.sceneManager.isAligned && now - this.sceneManager.lastAnimationTime > 2000) {
            this.rotationAnimations.animateToStraight();
            return;
        } else if (this.sceneManager.isAligned) {
            const newRadius = Math.max(this.sceneManager.minZoomDistance, Math.min(this.sceneManager.maxZoomDistance, this.sceneManager.camera.radius + delta));
            this.sceneManager.camera.radius = newRadius;
        }
        
    }
}
