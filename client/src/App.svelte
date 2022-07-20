<script lang="ts">
  import Toastify from "toastify-js";

  import "toastify-js/src/toastify.css";

  import P5,{ Image,VIDEO } from "p5";
  import { io } from "socket.io-client";
  import { onDestroy,onMount } from "svelte";
  import { Link,Route,Router } from "svelte-navigator";
  import Stream from "./pages/stream.svelte";
  import Views from "./pages/views.svelte";
  let canvasContainer: HTMLElement;
  let socketStatus = "disconnected";
  let zoomId = "aaa";
  let p5js: P5 = null;

  const socket = io("ws://localhost:5000", {
    transports: ["websocket"],
  });

  let uid = "";
  socket.on("connect", () => {
    socketStatus = "connected";
    console.log("connected");
    console.log(socket.id);
    uid = socket.id;
  });
  let canvas: HTMLElement;

  
  function getContainerSize(height, width) {
    // let height = canvasContainer.clientHeight-40;
    // let width = canvasContainer.clientWidth-40;

    return {
      height: (9 * width) / 16 - 40,
      width: width - 40,
    };
  }

  onMount(() => {
    console.log("canvasContainer", canvasContainer);
    console.log(canvasContainer.style);
    // get element height
    let height = getContainerSize(
      canvasContainer.clientHeight,
      canvasContainer.clientWidth
    ).height;
    let width = getContainerSize(
      canvasContainer.clientHeight,
      canvasContainer.clientWidth
    ).width;

    const sketch = (p5: P5) => {
      p5.setup = () => {
        const canvas = p5.createCanvas(width, height);
        p5.background(255);
      };
      p5.draw = () => {
        if (p5.mouseIsPressed) {
          // p5.strokeWeight(8);
          p5.line(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
          // console.log(p5.mouseX, p5.mouseY, p5.pmouseX, p5.pmouseY);
          socket.emit("draw", {
            zoomId: zoomId,
            udi: uid,
            mouseX: p5.mouseX,
            mouseY: p5.mouseY,
            pmouseX: p5.pmouseX,
            pmouseY: p5.pmouseY,
          });
        }
      };

      socket.on("reciverDraw", (data) => {
        console.log("reciverDraw", data);
        if (data.uid == uid) return;

        // p5.strokeWeight(8);
        p5.line(data.mouseX, data.mouseY, data.pmouseX, data.pmouseY);
      });
    };

    p5js = new P5(sketch, canvas);
    p5js.windowResized = () => {
      let height = getContainerSize(
        canvasContainer.clientHeight,
        canvasContainer.clientWidth
      ).height;
      let width = getContainerSize(
        canvasContainer.clientHeight,
        canvasContainer.clientWidth
      ).width;
      console.log("height,width", height, width);
      p5js.resizeCanvas(width, height, true);
      p5js.background(255);
    };
    
  });

  function joinZoom() {
    socket.emit("join-zoom", zoomId, socket.id);
  }
  socket.on("user-connected", (data) => {
    console.log("user-connected", data);
  });

  function clearCanvas() {
    p5js.clear(255, 255, 255, 1);
    p5js.background(255);
    socket.emit("clear");
  }
  onDestroy(() => {
    socket.close();
  });
  socket.on("clear", () => {
    p5js.clear(255, 255, 255, 1);
    p5js.background(255);
  });

  let p5Stroke;
  function handleChangeStroke() {
    console.log(p5Stroke)
    p5js.strokeWeight(p5Stroke);    
  }
</script>

<div
  class="flex flex-col items-center justify-center w-screen h-screen bg-gray-200"
>
  <div class="bg-stone-600 w-full h-12  ">
    <h1>Headef</h1>
  </div>

  <div class="flex flex-1 w-full">
    <div class="bg-gray-50 w-full">
      <div>
        <p>Stroke</p>
        <input
          on:change={handleChangeStroke}
          type="range"
          min="0"
          max="100"
          bind:value={p5Stroke}
          class="range range-sm"
        />
      </div>
    </div>

    <div
      bind:this={canvasContainer}
      id="canvas"
      class="flex-1  flex items-center justify-center max-w-[90vw]"
    >
      <div bind:this={canvas} />
    </div>
    <!-- <div>
      <h1 class="text-gray-700 text-lg">{socketStatus} {uid}</h1>
      <div>
        <input bind:value={zoomId} class="input" type="text" />
        <button on:click={joinZoom} class="btn btn-md">Join</button>
        <button on:click={clearCanvas} class="btn btn-md">Clear</button>
      </div>
    </div> -->
  </div>
</div>

<style>
  canvas {
    aspect-ratio: auto 1920 / 1080;
    width: 100%;
    height: 100%;
    z-index: 10;
    border-radius: 90px;
  }
  #canvas {
    aspect-ratio: auto 1920 / 1080;
  }
</style>
