import { LoadAssetContainerAsync, Mesh, Vector3, Quaternion } from '@babylonjs/core';
import { SceneManager } from './SceneManager';
import { ScreenManager } from './ScreenManager';

export class ComputerLoader {
    private sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        this.sceneManager = sceneManager;
    }

    async loadComputer(): Promise<void> {
        return new Promise(async (resolve) => {
            try {
                const container = await LoadAssetContainerAsync('./textures/computer.glb', this.sceneManager.scene);
                container.addAllToScene();
                this.sceneManager.computerMeshes = container.meshes as Mesh[];

                this.sceneManager.computerMeshes.forEach((mesh) => {
                    mesh.scaling = new Vector3(2, 2, 2);
                    mesh.position = Vector3.Zero();
                    mesh.rotationQuaternion = Quaternion.RotationYawPitchRoll(0, 0, 0);
                });

                const screen = this.sceneManager.computerMeshes.find(m => m.name === "ScreenMesh");
                if (screen) {
                    new ScreenManager(this.sceneManager, screen).initialize();
                }
                if (this.sceneManager.camera) {
                    this.sceneManager.camera.setTarget(new Vector3(0, 0, 0));
                }
            } catch (error) {
                console.error('Failed to load model:', error);
            }
            resolve();
        });
    }
}