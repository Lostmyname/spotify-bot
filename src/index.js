import * as spotify from './spotify';
import SlackBot from 'slackbots';

var bot = new SlackBot({
	token: process.env.SLACK_TOKEN,
	name: 'Spotify'
});

bot.on('start', function () {
	console.log('Connected to Slack');
});

bot.on('message', function (data) {
	if (data.text && data.text.startsWith('<spotify:')) {
		const spotifyUri = data.text.slice(1).split('>')[0];
		spotify.getTracks(spotifyUri)
				.then(spotify.addToPlaylist)
				.then(function () {
					return sendMessage(data.channel, 'Added! :)');
				})
				.catch(function (err) {
					console.error(err);
					return sendMessage(data.channel, 'Failed to add :(');
				});
	}
});

function sendMessage(channel, message) {
	return bot.postMessage(channel, message, {
		icon_url: process.env.SLACK_ICON_URL
	});
}