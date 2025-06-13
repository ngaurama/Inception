import { SceneManager } from './SceneManager';

const canvas = document.querySelector("canvas");

if (canvas instanceof HTMLCanvasElement) {
    new SceneManager(canvas);
} else {
    console.error("Canvas element not found!");
}
