import { Kampos } from "./kampos";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { effects, transitions } from "kampos";

const hueSat = effects.hueSaturation();
const duotone = effects.duotone();
const fade = transitions.fade();

let x, y, rect;
let drawing = false;

// this is invoked once in every animation frame, while there's a mouse move over the canvas
function tick() {
  fade.progress = Math.max(0, Math.min(1, (y - rect.y) / rect.height));
  hueSat.hue = Math.max(0, Math.min(1, (x - rect.x) / rect.width)) * 360 - 180;
  drawing = false;
}

// handler for detecting mouse move
const moveHandler = (e: MouseEvent, target: HTMLCanvasElement) => {
  console.log("vladd", e);
  const { clientX, clientY } = e;

  // cache mouse location
  x = clientX;
  y = clientY;

  // only once! a frame
  if (!drawing) {
    drawing = true;
    // read here
    rect = target.getBoundingClientRect();
    // write on next frame
    requestAnimationFrame(tick);
  }
};

function App() {
  return (
    <div>
      <h1>Kampos React Demos</h1>
      <h2>Duotone effect</h2>
      <Kampos
        src="https://wix-incubator.github.io/kampos/demo/drop-water.mp4"
        effects={[duotone]}
        mouseenter={() => {
          duotone.disabled = true;
        }}
        mouseleave={() => {
          duotone.disabled = false;
        }}
      />
      <h2>Cross-fade with hue-rotation</h2>
      <Kampos
        srcs={[
          "https://wix-incubator.github.io/kampos/demo/wheat-field.mp4",
          "https://wix-incubator.github.io/kampos/demo/shell-beach.mp4",
        ]}
        effects={[fade, hueSat]}
        beforePlay={(medias) => {
          fade.to = medias[1];
        }}
        mousemove={moveHandler}
      />
    </div>
  );
}

export default App;
