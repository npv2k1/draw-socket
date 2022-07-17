<script lang="ts">
  import { onMount } from "svelte";
  import { Peer } from "peerjs";
  import { io } from "socket.io-client";
  import createMediaStreamFake from "../lib/mediaFake";
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
    socket.emit("join-room", "ROOM_ID", id);
  });

  let stream: MediaStream;
  let video: HTMLVideoElement;
  let display: HTMLVideoElement;
  let chunks = [];
  let canvas: HTMLCanvasElement;
  let videos: HTMLVideoElement[];

  let streamId = "";


  // socket.on("user-connected", (userId) => {
  //   console.log({ userId });
  //   streamId = userId;

  //   console.log(call);

  // });
  // onMount(async () => {
  //   // stream = await navigator.mediaDevices.getUserMedia({
  //   //   video: true,
  //   // });
  //   const call = myPeer.call(streamId, stream);
  //   console.log(call);
  //   call?.on("stream", function (s) {
  //     // `stream` is the MediaStream of the remote peer.
  //     // Here you'd add it to an HTML video/canvas element.
  //     video.srcObject = s;
  //     video.play();
  //   });
  // });

  function handleStopVideo() {
    stream.getVideoTracks()[0].enabled = false;
  }
  function handleStartVideo() {
    stream.getVideoTracks()[0].enabled = true;
  }

  async function changeSteamId(e) {
    e.preventDefault();
    const myVideoStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const call = myPeer.call(streamId, createMediaStreamFake());
    call?.on("stream", function (s) {
      video.srcObject = s;
      video.play();
    });
    console.log("call", call)
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
        <form on:submit={changeSteamId} class="">
          <input
            class="input focus:outline-none"
            type="text "
            placeholder="Stream id..."
            bind:value={streamId}
          />
          <button class="btn">Join id</button>
        </form>
      </div>
    </div>
  </div>
</main>

<style>
</style>
