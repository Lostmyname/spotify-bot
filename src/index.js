import * as spotify from './spotify';

spotify.getTracks('spotify:user:spotify:playlist:3hpgM1U3bD6kvo7wJubQ8z')
	.then(spotify.addToPlaylist)
	.catch(function (err) {
		console.error(err);
	});
