window.onload = function () {
    document.addEventListener('DOMContentLoaded', function(){  
        var v = document.getElementById('video');  
        var canvas = document.getElementById('canvas');  
        var context = canvas.getContext('2d');   
        var cw = Math.floor(canvas.clientWidth);  
        var ch = Math.floor(canvas.clientHeight);  
    
        canvas.width  = cw;  
        canvas.height = ch;  
    
        video.addEventListener('play', function() {  
            draw(this, context, cw, ch );  
        }, false);  
    }, false);
    
    function draw(v, c, w, h) {  
        if(v.paused || v.ended) return false;
    
        // Define the Sobel filter
        var sobel = [
            [-1, 0, 1],
            [-2, 0, 2],
            [-1, 0, 1]
        ];
    
        // Apply the Sobel filter to the video frame
        var imgData = c.getImageData(0, 0, w, h);
        var pixels = imgData.data;
        var grayPixels = new Uint8ClampedArray(pixels.length / 4);
    
        // Convert the video frame to grayscale
        for (var i = 0; i < pixels.length; i += 4) {
            var r = pixels[i];
            var g = pixels[i + 1];
            var b = pixels[i + 2];
            grayPixels[i / 4] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
    
        // Convolve the grayscale image with the Sobel filter
        var edgePixels = new Uint8ClampedArray(grayPixels.length);
        for (var y = 1; y < h - 1; y++) {
            for (var x = 1; x < w - 1; x++) {
                var i = y * w + x;
                var j = i - w - 1;
                var gx = sobel[0][0] * grayPixels[j] +
                         sobel[0][1] * grayPixels[j + 1] +
                         sobel[0][2] * grayPixels[j + 2] +
                         sobel[1][0] * grayPixels[i - 1] +
                         sobel[1][1] * grayPixels[i] +
                         sobel[1][2] * grayPixels[i + 1] +
                         sobel[2][0] * grayPixels[j + w] +
                         sobel[2][1] * grayPixels[j + w + 1] +
                         sobel[2][2] * grayPixels[j + w + 2];
                var gy = sobel[0][0] * grayPixels[j + 2] +
                         sobel[0][1] * grayPixels[i - w + 1] +
                         sobel[0][2] * grayPixels[i - w + 2] +
                         sobel[1][0] * grayPixels[j + 1] +
                         sobel[1][1] * grayPixels[i] +
                         sobel[1][2] * grayPixels[i + 1] +
                         sobel[2][0] * grayPixels[j] +
                         sobel[2][1] * grayPixels[i - w] +
                         sobel[2][2] * grayPixels[i - w + 1];
                var mag = Math.sqrt(gx * gx + gy * gy);
                // Apply thresholding to the edges
                var threshold = 128;
                if (mag > threshold) {
                    edgePixels[i] = 255;
                } else {
                    edgePixels[i] = 0;
                }
            }
        }
        // Copy the edge pixels back to the canvas
        for (var i = 0; i < pixels.length; i += 4) {
            var gray = edgePixels[i / 4];
            pixels[i] = gray;
            pixels[i + 1] = gray;
            pixels[i + 2] = gray;
        }
        // Update the canvas with the new image
        c.putImageData(imgData, 0, 0);
        setTimeout(draw, 30, v, c, w, h);
    }
}