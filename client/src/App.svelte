<script lang="ts">
  import Toastify from "toastify-js";

  import "toastify-js/src/toastify.css";

  import { Link, Route, Router } from "svelte-navigator";
  import Stream from "./pages/stream.svelte";
  import Views from "./pages/views.svelte";
  import P5, { Image, VIDEO } from "p5";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";

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

  onMount(() => {
    const sketch = (p5: P5) => {
      p5.setup = () => {
        const canvas = p5.createCanvas(700, 500);
        p5.background(255);
      };
      p5.draw = () => {
        if (p5.mouseIsPressed) {
          p5.strokeWeight(8);
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

        p5.strokeWeight(8);
        p5.line(data.mouseX, data.mouseY, data.pmouseX, data.pmouseY);
      });
    };

    p5js = new P5(sketch, canvas);
  });

  function joinZoom() {
    socket.emit("join-zoom", zoomId, socket.id);
  }
  socket.on("user-connected",(data)=>{
    console.log("user-connected",data);
  })

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
</script>

<div
  class="flex flex-col items-center justify-center w-screen h-screen bg-gray-200"
>
  <div class="">
    <div>
      <div bind:this={canvas} />
    </div>
    <div>
      <h1 class="text-gray-700 text-lg">{socketStatus} {uid}</h1>
      <div>
        <input bind:value={zoomId} class="input" type="text" />
        <button on:click={joinZoom} class="btn btn-md">Join</button>
        <button on:click={clearCanvas} class="btn btn-md">Clear</button>
      </div>
    </div>
  </div>
</div>
