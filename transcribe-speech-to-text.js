// https://cloud.google.com/speech-to-text/docs/async-time-offsets
// https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries



async function main() {
		// Imports the Google Cloud client library
		const speech = require('@google-cloud/speech');
		const fs = require('fs');
	
		// Creates a client
		const client = new speech.SpeechClient();
	
		// The name of the audio file to transcribe
		const fileName = './resources/IMG_3334_1.mp3';
	
		// Reads a local audio file and converts it to base64
		const file = fs.readFileSync(fileName);
		const audioBytes = file.toString('base64');
	
		// The audio file's encoding, sample rate in hertz, and BCP-47 language code
		const audio = {
			content: audioBytes,
		};
		const config = {
			enableWordTimeOffsets: true,
			encoding: 'MP3',
			sampleRateHertz: 44100,
			languageCode: 'en-US',
		};
		const request = {
			audio: audio,
			config: config,
		};
	
		// Detects speech in the audio file
		const [response] = await client.recognize(request);
		const transcription = response.results
			.map(result => result.alternatives[0].transcript)
			.join('\n');

		console.log(`\n\nTranscription (whole): ${transcription}`);

		console.log('\n------------------------------------ \n');

		response.results.forEach(result => {

			

			// get start time of first word
			const wordInfo = result.alternatives[0].words[0]
			const startSecs =
				`${wordInfo.startTime.seconds}` +
				`.` +
				wordInfo.startTime.nanos / 100000000;
			const endSecs =
				`${wordInfo.endTime.seconds}` +
				`.` +
				wordInfo.endTime.nanos / 100000000;

			console.log(`\t ${startSecs} secs - ${endSecs} secs`);
			console.log(`Transcription: ${result.alternatives[0].transcript}`);
			
			

			// loop through words in each transcript line
			// result.alternatives[0].words.forEach(wordInfo => {
			//   // NOTE: If you have a time offset exceeding 2^32 seconds, use the
			//   // wordInfo.{x}Time.seconds.high to calculate seconds.
			//   const startSecs =
			// 	`${wordInfo.startTime.seconds}` +
			// 	`.` +
			// 	wordInfo.startTime.nanos / 100000000;
			//   const endSecs =
			// 	`${wordInfo.endTime.seconds}` +
			// 	`.` +
			// 	wordInfo.endTime.nanos / 100000000;
			//   console.log(`Word: ${wordInfo.word}`);
			//   console.log(`\t ${startSecs} secs - ${endSecs} secs`);
			// });
		  });
	}
	main().catch(console.error);