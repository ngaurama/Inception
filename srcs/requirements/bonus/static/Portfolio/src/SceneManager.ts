import { Engine, Scene, Color4, HemisphericLight, ArcRotateCamera, Vector3, Mesh } from '@babylonjs/core';
import '@babylonjs/loaders';
import './style.css';
import { ComputerLoader } from './ComputerLoader';
import { CameraControls } from './CameraControls';
import { ScreenManager } from './ScreenManager';
import { CustomLoadingScreen } from './CustomLoadingScreen';

export class SceneManager 
{
    public canvas: HTMLCanvasElement;
    public scene: Scene;
    public engine: Engine;
    public computerMeshes: Mesh[] = [];
    public camera: ArcRotateCamera | null = null;
    public minZoomDistance: number = 1.1;
    public maxZoomDistance: number = 4;
    public isAligned: boolean = true;
    public currentYRotation: number = 0;
    public isAnimating: boolean = false;
    public lastAnimationTime: number = 0;
    public lastStraighteningTime: number = 0;
    public cameraControls: CameraControls;
    private screenManager: ScreenManager | null = null;
    private customLoadingScreen: CustomLoadingScreen;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = this.createScene();
        this.scene.useRightHandedSystem = true;

        this.customLoadingScreen = new CustomLoadingScreen();
        this.engine.loadingScreen = this.customLoadingScreen;
        this.engine.displayLoadingUI();
        new ComputerLoader(this).loadComputer().then(() => {
            const screen = this.computerMeshes.find(m => m.name === "ScreenMesh");
            if (screen) {
                this.screenManager = new ScreenManager(this, screen);
                this.screenManager.initialize();
            }
            this.customLoadingScreen.updateProgress(100);
            document.getElementById('enterSite')?.classList.remove('hidden');
        });
        this.cameraControls = new CameraControls(this);
        this.cameraControls.setupControls();

        const darkModeSwitch = document.getElementById('darkModeSwitch');
        const gradientBg = document.querySelector('.gradient-bg');

        if (darkModeSwitch && gradientBg) {
            darkModeSwitch.addEventListener('change', () => {
            gradientBg.classList.toggle('dark-mode');
            });
        }

        document.getElementById('enterSite')?.addEventListener('click', () => {
            this.engine.hideLoadingUI();
            const body = document.getElementById('body');
            if (body) {
                body.classList.remove('loading');
                body.classList.add('loaded');
            }
            this.engine.runRenderLoop(() => {
                this.updateScene();
                this.scene.render();
            });
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    createScene(): Scene {
        const scene = new Scene(this.engine);
        scene.clearColor = new Color4(0, 0, 0, 0);
        this.camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, this.maxZoomDistance, Vector3.Zero(), scene);
        this.camera.inputs.clear();
        this.camera.wheelPrecision = 100;
        this.camera.lowerBetaLimit = Math.PI / 2;
        this.camera.upperBetaLimit = Math.PI / 2;
        this.camera.lowerRadiusLimit = this.minZoomDistance;
        this.camera.upperRadiusLimit = this.maxZoomDistance;
        this.camera.wheelDeltaPercentage = 0.05;
        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
        hemiLight.intensity = 1.5;
        return scene;
    }

    updateScene(): void {
        if (this.computerMeshes.length === 0 || !this.camera) return;
        this.camera.setTarget(Vector3.Zero());

        if (this.screenManager)
            this.screenManager.update();
    }
}
