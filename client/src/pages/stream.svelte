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
    streamId = id;
  });

  let stream: MediaStream;
  let video: HTMLVideoElement;
  let display: HTMLVideoElement;
  let chunks = [];
  let canvas: HTMLCanvasElement;
  let videos: HTMLVideoElement[];

  let streamId = "";

  onMount(async () => {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    video.srcObject = stream;
    video.play();

    myPeer.on("call", (call) => {
      call.answer(stream);  
      console.log("hàm call đã được gọi")    
    }); 
  });  

  function handleStopVideo() {
    stream.getVideoTracks()[0].enabled = false;
  }
  function handleStartVideo() {
    stream.getVideoTracks()[0].enabled = true;
  }

  function changeSteamId(e){
    e.preventDefault();
    alert("change steam id"+ streamId);
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
       <form on:submit="{changeSteamId}" class="">
          <input
            class="input focus:outline-none"
            type="text "
            placeholder="Stream id..."
            bind:value="{streamId}"
          />
          <button class="btn">Set id</button>
       </form>
      </div>
    </div>
  </div>
</main>

<style>
</style>
