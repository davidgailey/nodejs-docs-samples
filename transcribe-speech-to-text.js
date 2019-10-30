// https://cloud.google.com/speech-to-text/docs/async-time-offsets
// https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries


// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs')

// Creates a client
const client = new speech.SpeechClient();

// The name of the audio file to transcribe
const fileName = './resources/audio.raw';

// Reads a local audio file and converts it to base64
const file = fs.readFileSync(fileName);
const audioBytes = file.toString('base64');

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
const encoding = 'MP3';
const sampleRateHertz = 44100;
const languageCode = 'en-US';

const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
};

// The audio file's encoding, sample rate in hertz, and BCP-47 language code
const audio = {
    content: audioBytes,
};

const request = {
    config: config,
    audio: audio,
};

// Detects speech in the audio file. This creates a recognition job that you
// can wait for now, or get its result later.
const [operation] = await client.recognize(request);

// Get a Promise representation of the final result of the job
const [response] = await operation.promise();
response.results.forEach(result => {
    console.log(`Transcription: ${result.alternatives[0].transcript}`);
    result.alternatives[0].words.forEach(wordInfo => {
        // NOTE: If you have a time offset exceeding 2^32 seconds, use the
        // wordInfo.{x}Time.seconds.high to calculate seconds.
        const startSecs =
            `${wordInfo.startTime.seconds}` +
            `.` +
            wordInfo.startTime.nanos / 100000000;
        const endSecs =
            `${wordInfo.endTime.seconds}` +
            `.` +
            wordInfo.endTime.nanos / 100000000;
        console.log(`Word: ${wordInfo.word}`);
        console.log(`\t ${startSecs} secs - ${endSecs} secs`);
    });
});