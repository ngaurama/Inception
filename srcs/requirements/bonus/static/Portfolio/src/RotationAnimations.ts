import { Animation, EasingFunction, QuarticEase, Quaternion } from '@babylonjs/core';
import { SceneManager } from './SceneManager';

export class RotationAnimations {
    private sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    animateToStraight(): void 
    {
        if (this.sceneManager.isAnimating) return;
        this.sceneManager.isAnimating = true;

        this.sceneManager.currentYRotation = ((this.sceneManager.currentYRotation + Math.PI) % (2 * Math.PI)) - Math.PI;

        const animation = new Animation(
            "rotateToStraight",
            "rotationQuaternion",
            60,
            Animation.ANIMATIONTYPE_QUATERNION,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const keys = [
            { frame: 0, value: this.sceneManager.computerMeshes[0]?.rotationQuaternion || Quaternion.Identity() },
            { frame: 60, value: Quaternion.RotationYawPitchRoll(0, 0, 0) }
        ];

        animation.setKeys(keys);

        const easingFunction = new QuarticEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(easingFunction);

        this.sceneManager.computerMeshes.forEach((mesh) => {
            if (mesh.rotationQuaternion) {
                try {
                    this.sceneManager.scene.beginDirectAnimation(
                        mesh,
                        [animation],
                        0,
                        60,
                        false,
                        1,
                        () => {
                            this.sceneManager.isAligned = true;
                            this.sceneManager.currentYRotation = 0;
                            this.sceneManager.isAnimating = false;
                            this.sceneManager.lastAnimationTime = performance.now();
                            this.sceneManager.lastStraighteningTime = performance.now();
                        }
                    );
                } catch (error) {
                    console.error('Animation Failed', error);
                    this.sceneManager.isAnimating = false;
                }
            }
        });
    }
}
