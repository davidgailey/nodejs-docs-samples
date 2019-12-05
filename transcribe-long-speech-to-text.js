// authenticate for current shell session
// https://cloud.google.com/docs/authentication/getting-started
// export GOOGLE_APPLICATION_CREDENTIALS="path-to/transcription-api-257518-1de89915ba82.json"

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');

const fs = require('fs');

// Creates a client
const clientSpeech = new speech.SpeechClient();

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
// const gcsUri = 'gs://my-bucket/audio.raw';
// const encoding = 'Encoding of the audio file, e.g. LINEAR16';
// const sampleRateHertz = 16000;
// const languageCode = 'BCP-47 language code, e.g. en-US';

// james farrah wav - 1h 37m
// const gcsUri = 'gs://transcription-api-bucket/00001.wav';
// const transcriptionFilename = '00001.wav';
// const encoding = 'WAV';
// const sampleRateHertz = 48000;
// const languageCode = 'en-US';
// const audioChannelCount = 2;

// take note wideman and Cheraine - 28m
const gcsUri = 'gs://transcription-api-bucket/tn-weidman.mp3';
const transcriptionFilename = 'tn-weidman.mp3';
const encoding = 'MP3';
const sampleRateHertz = 44100;
const languageCode = 'en-US';
const audioChannelCount = 1;
const diarizationConfig = {
	"enableSpeakerDiarization": true,
	"minSpeakerCount": 2,
	"maxSpeakerCount": 2
};
enableWordTimeOffsets = true;
enableAutomaticPunctuation = true;

const config = {
	encoding: encoding,
	sampleRateHertz: sampleRateHertz,
	languageCode: languageCode,
	audioChannelCount: audioChannelCount,
	diarizationConfig: diarizationConfig,
	enableWordTimeOffsets: enableWordTimeOffsets,
	enableAutomaticPunctuation: enableAutomaticPunctuation,
};

const audio = {
	uri: gcsUri,
};

const speechRequest = {
	config: config,
	audio: audio,
};

// readData function
const readData = (data, path) => {
	try {
		// fs.writeFileSync(path, JSON.stringify(data))
		// fs.writeFileSync(`./transcriptions/${transcriptionFilename}-${Date.now()}.txt`, data);
		var text = fs.readFileSync('transcriptions/tn-weidman.mp3-1575490620201.txt','utf8');
		return text;
	} catch (err) {
		console.error(err)
	}
}

// storeData function
const storeData = (data, path) => {
	try {
		// fs.writeFileSync(path, JSON.stringify(data))
		fs.writeFileSync(`./transcriptions/${transcriptionFilename}-${Date.now()}.txt`, data);
	} catch (err) {
		console.error(err)
	}
}

// sec2time function
function sec2time(timeInSeconds) {
	var pad = function(num, size) { return ('000' + num).slice(size * -1); },
	time = parseFloat(timeInSeconds).toFixed(3),
	hours = Math.floor(time / 60 / 60),
	minutes = Math.floor(time / 60) % 60,
	seconds = Math.floor(time - minutes * 60),
	milliseconds = time.slice(-3);

	// return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
	return pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's';
}

// formatTranscript function
const formatTranscript = (data) => {
	const transcription = data.results
		.map(result => {
			// get start time of first word
			const wordInfo = result.alternatives[0].words[0]
			const startSecs =
				`${wordInfo.startTime.seconds}` +
				`.` +
				wordInfo.startTime.nanos / 100000000;
			
			// const endSecs =
			// 	`${wordInfo.endTime.seconds}` +
			// 	`.` +
			// 	wordInfo.endTime.nanos / 100000000;

			// get speaker 
			const speaker = wordInfo.speakerTag || 1;

			if(typeof result.alternatives[0].transcript !== 'undefined')
				return `${sec2time(startSecs)}:\n\t${result.alternatives[0].transcript}`;
		})
		.join('\n');

	

	storeData(transcription);
}




// formatTranscript with Speakers function
const formatSpeakerTranscript = (data) => {

	// initialize variable to keep track of speaker
	global.lastSpeaker = 0;

	// last results object is different, it has one big alternatives array with speaker tags for each word
	const transcription = () => {
		return data.results[data.results.length -1].alternatives[0].words
		.map((wordInfo, index) => {

			// wordInfo looks like this:
				// {
				// 	"startTime": {
				// 		"seconds": "4",
				// 		"nanos": 200000000
				// 	},
				// 	"endTime": {
				// 		"seconds": "4",
				// 		"nanos": 800000000
				// 	},
				// 	"word": "Welcome",
				// 	"speakerTag": 1
				// },

			// get start time of first word
			
			const startSecs =
				`${wordInfo.startTime.seconds}` +
				`.` +
				wordInfo.startTime.nanos / 100000000;
			
			// const endSecs =
			// 	`${wordInfo.endTime.seconds}` +
			// 	`.` +
			// 	wordInfo.endTime.nanos / 100000000;

			// get speaker 
			const speaker = wordInfo.speakerTag;

			// init last speaker - leave as is if it is set, 
			// lastSpeaker = lastSpeaker !== 0 ? lastSpeaker : speaker;

			// if last speaker is different, add speaker label and time with word
			if (global.lastSpeaker !== speaker){

				// set last speaker to current speaker
				global.lastSpeaker = speaker;


				return `\nSpeaker ${speaker} (${sec2time(startSecs)}) \n\t${wordInfo.word}`;

			}else{

				// set last speaker to current speaker
				global.lastSpeaker = speaker;

				return wordInfo.word;
			}

			

			// if(typeof result.alternatives[0].transcript !== 'undefined')
			// 	return `${sec2time(startSecs)}:\n\t${result.alternatives[0].transcript}`;
		})
		.join(' ');
	}

	storeData(transcription());
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

// clientSpeech
// 	.longRunningRecognize(speechRequest)
// 	.then(data => {
// 		const operation = data[0];
// 		console.log('got a promise representation', data);

// 		const errorHandler = err => {
// 			console.log(err);
// 			throw (err)
// 		}
// 		const completeHandler = longRRResponse => {
// 			console.log('**** response ****');
// 			console.log(longRRResponse);
// 			console.log('**** response ****');
// 			console.log(JSON.stringify(longRRResponse, null, '\t'));
// 			// storeData(JSON.stringify(longRRResponse, null, '\t'));

// 			formatTranscript(longRRResponse);
// 		}
// 		const progressHandler = (metadata, apiResponse) => {
// 			console.log('progress ', metadata);
// 		}
// 		operation.on('error', errorHandler)
// 		operation.on('complete', completeHandler)
// 		operation.on('progress', progressHandler)
// 	})
// 	.catch(err => {
// 		console.error('ERROR:', err);
// 		// fs.unlink(name);
// 	});

formatSpeakerTranscript(JSON.parse(readData()));