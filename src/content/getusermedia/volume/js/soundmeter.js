/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Meter class that generates a number correlated to audio volume.
// The meter class itself displays nothing, but it makes the
// instantaneous and time-decaying volumes available for inspection.
// It also reports on the fraction of samples that were at or near
// the top of the measurement range.
function SoundMeter(context) {
  this.context = context;
  this.instant = 0.0;
  this.slow = 0.0;
  this.clip = 0.0;
  this.script = new AnalyserNode(context);
  this.bins = new Float32Array(this.script.fftSize);
}

SoundMeter.prototype.analyze = function() {
  this.script.getFloatTimeDomainData(this.bins);
  let i;
  let sum = 0.0;
  let clipcount = 0;
  for (i = 0; i < this.bins.length; ++i) {
    sum += this.bins[i] * this.bins[i];
    if (Math.abs(this.bins[i]) > 0.99) {
      clipcount += 1;
    }
  }
  this.instant = Math.sqrt(sum / this.bins.length);
  this.slow = 0.95 * this.slow + 0.05 * this.instant;
  this.clip = clipcount / this.bins.length;
}

SoundMeter.prototype.connectToSource = function(stream, callback) {
  console.log('SoundMeter connecting');
  try {
    this.mic = this.context.createMediaStreamSource(stream);
    this.mic.connect(this.script);
    if (typeof callback !== 'undefined') {
      callback(null);
    }
  } catch (e) {
    console.error(e);
    if (typeof callback !== 'undefined') {
      callback(e);
    }
  }
};

SoundMeter.prototype.stop = function() {
  console.log('SoundMeter stopping');
  this.mic.disconnect();
  this.script.disconnect();
};
