// authenticate for current shell session
// https://cloud.google.com/docs/authentication/getting-started
// export GOOGLE_APPLICATION_CREDENTIALS="path-to/transcription-api-257518-1de89915ba82.json"

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

// Creates a client
const clientSpeech = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const gcsUri = 'gs://my-bucket/audio.raw';
// const encoding = 'Encoding of the audio file, e.g. LINEAR16';
// const sampleRateHertz = 16000;
// const languageCode = 'BCP-47 language code, e.g. en-US';

const gcsUri = 'gs://transcription-api-bucket/00001.wav';
const encoding = 'WAV';
const sampleRateHertz = 48000;
const languageCode = 'en-US';

const config = {
	encoding: encoding,
	sampleRateHertz: sampleRateHertz,
	languageCode: languageCode,
	audioChannelCount: 2,
};

const audio = {
	uri: gcsUri,
};

const speechRequest = {
	config: config,
	audio: audio,
};

// storeData function
const storeData = (data, path) => {
	try {
		// fs.writeFileSync(path, JSON.stringify(data))
		fs.writeFileSync(`./transcriptions/00001-${Date.now()}.txt` , data);
	} catch (err) {
		console.error(err)
	}
}

// // Detects speech in the audio file. This creates a recognition job that you
// // can wait for now, or get its result later.
// const [operation] = client.longRunningRecognize(request);
// // Get a Promise representation of the final result of the job
// const [response] = operation.promise();
// const transcription = response.results
//   .map(result => result.alternatives[0].transcript)
//   .join('\n');
// console.log(`Transcription: ${transcription}`);

// clientSpeech.longRunningRecognize(speechRequest)
// 	.then(function(transcript) {
// 		console.log("success transcript",transcript);
// 	}).catch(err => {
// 		console.error("transcript error", err);
// 	});

clientSpeech
      .longRunningRecognize(speechRequest)
      .then(data => {
        const operation = data[0];
        console.log('got a promise representation', data);

        const errorHandler = err => {
          console.log(err);
          throw(err)
        }
        const completeHandler = longRRResponse => {
          console.log('**** response ****');
		  console.log(JSON.stringify(longRRResponse, null, '\t'));
		  storeData(JSON.stringify(longRRResponse, null, '\t'));
        }
        const progressHandler = (metadata, apiResponse) => {
          console.log('progress ', metadata);
        }
        operation.on('error', errorHandler)
        operation.on('complete', completeHandler)
        operation.on('progress', progressHandler)
      })
      .catch(err => {
        console.error('ERROR:', err);
        // fs.unlink(name);
      });