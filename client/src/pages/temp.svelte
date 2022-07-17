<script lang="ts">
  import { onMount } from "svelte";
  import { Peer } from "peerjs";
  import { io } from "socket.io-client";
  const socket = io("ws://localhost:5000", {
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("connected");
  });

  const myPeer = new Peer(undefined, {
    path: "/peerjs",
    host: "localhost",
    port: 9000,
  });
  myPeer.on("open", (id) => {
    // socket.emit("join-room", ROOM_ID, id);
    console.log("myid", id);
  });

  let stream: MediaStream;
  let video: HTMLVideoElement;
  let display: HTMLVideoElement;
  let chunks = [];
  let canvas: HTMLCanvasElement;
  let videos: HTMLVideoElement[];

  onMount(async () => {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    video.srcObject = stream;
    video.play();

    console.log(stream.getVideoTracks());
    const mediaRecorder = new MediaRecorder(stream);
    const myStream = mediaRecorder.stream;
    console.log(myStream);
    mediaRecorder.start();
    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };

    setTimeout(() => {
      mediaRecorder.stop();
      console.log(chunks);
      const blob = new Blob(chunks[0], { type: "video/webm" });
      console.log(blob);
      const url = URL.createObjectURL(blob);
      console.log(url);
    }, 5000);
  });
  // onMount(async () => {
  //   stream = await navigator.mediaDevices.getDisplayMedia({
  //     video: true,
  //     audio: false,
  //   });
  //   display.srcObject = stream;
  //   display.play();
  //   // console.log(stream.getVideoTracks());
  //   const mediaRecorder = new MediaRecorder(stream);
  // });
  // onMount(() => {
  //   const ctx = canvas.getContext("2d");
  //   let frame = requestAnimationFrame(loop);

  //   function loop(t) {
  //     frame = requestAnimationFrame(loop);
  //     ctx.drawImage(video, 0, 0, video.width, video.height);

  //     // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  //     // for (let p = 0; p < imageData.data.length; p += 4) {
  //     // 	const i = p / 4;
  //     // 	const x = i % canvas.width;
  //     // 	const y = i / canvas.width >>> 0;

  //     // 	const r = 64 + (128 * x / canvas.width) + (64 * Math.sin(t / 1000));
  //     // 	const g = 64 + (128 * y / canvas.height) + (64 * Math.cos(t / 1000));
  //     // 	const b = 128;

  //     // 	imageData.data[p + 0] = r;
  //     // 	imageData.data[p + 1] = g;
  //     // 	imageData.data[p + 2] = b;
  //     // 	imageData.data[p + 3] = 255;
  //     // }

  //     // ctx.putImageData(imageData, 0, 0);
  //   }

  //   return () => {
  //     cancelAnimationFrame(frame);
  //   };
  // });

  function handleStopVideo() {
    stream.getVideoTracks()[0].enabled = false;
  }
  function handleStartVideo() {
    stream.getVideoTracks()[0].enabled = true;
  }

  let sources = Array(16).fill(0);
</script>

<main class="w-screen h-screen max-h-screen bg-gray-200">
  <div class="flex flex-col w-full h-full">
    <div class="flex flex-1 ">
      <div class="flex flex-1 p-2">
        <video class=" w-[90%] rounded-md" bind:this={video}>
          <track kind="captions" />
        </video>
      </div>
      <div class="w-48 h-full bg-gray-800">
        <!-- Chat -->
      </div>
    </div>
    <div class="flex flex-row bg-gray-800">
      <button class="btn" on:click={handleStartVideo}>Start</button>
      <button class="btn" on:click={handleStopVideo}>Stop</button>
      <div>
       <form class="">
          <input
            class="input focus:outline-none"
            type="text "
            placeholder="Stream id..."
          />
          <button class="btn">Set id</button>
       </form>
      </div>
    </div>
  </div>
</main>

<style>
</style>
