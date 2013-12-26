/*jshint asi: true*/

function BufferLoader(context, urlList, callback, progressCallback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.progressCallback = progressCallback
  this.bufferList = [];
  this.loadCount = 0;
  this.progress = []
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        loader.progress[index] = 100
        loader.progressCallback(loader.progress)
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function(error) {
    alert('BufferLoader: XHR error – ', error);
  }

  request.send();
  var setProgressForIndex = function(e) {
    // After the mp3 loads it still needs to decode, which is slow.
    // Leave some percent for AudioContext#decodeAudioData to eat up.
    this.progress[index] = e.loaded / e.total * 80
    this.progressCallback(this.progress)
  }
  request.addEventListener("progress", setProgressForIndex.bind(this))
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i) {
    var req = this.loadBuffer(this.urlList[i], i);
  }
}
