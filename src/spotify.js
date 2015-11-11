'use strict';

import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
	redirectUri: 'http://macr.ae/',
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

spotifyApi.authorizationCodeGrant(process.env.SPOTIFY_ACCESS_TOKEN)
		.then(function(data) {
			spotifyApi.setAccessToken(data.body['access_token']);
			spotifyApi.setRefreshToken(data.body['refresh_token']);
		})
		.catch(function (err) {
			console.error('Spotify broke:', err);
		});

/**
 * Adds an array of tracks to a playlist.
 *
 * @param {Array} tracks Spotify URIs of the tracks to add.
 * @returns {Promise} API promise from Spotify API.
 */
export function addToPlaylist(tracks) {
	const user = process.env.SPOTIFY_PLAYLIST_USER;
	const playlist = process.env.SPOTIFY_PLAYLIST_ID;
	return spotifyApi.addTracksToPlaylist(user, playlist, tracks)
}

/**
 * Get track URIs from spotify URI.
 *
 * @param {string} rawUri Spotify URI.
 * @returns {Promise} Promise which will resolve with track URIs.
 */
export function getTracks(rawUri) {
	const uri = parseUri(rawUri);

	if (uri.playlist) {
		return spotifyApi.getPlaylistTracks(uri.user, uri.playlist)
			.then(getTracks);
	} else if (uri.album) {
		return spotifyApi.getAlbumTracks(uri.album)
			.then(getTracks);
	} else if (uri.track) {
		// Special case: doesn't need handling
		return new Promise(function (resolve) {
			resolve([ rawUri ]);
		});
	}

	function getTracks(data) {
		return data.body.items.map(function (item) {
			// item.uri for albums, item.track.uri for playlists
			return item.uri || item.track.uri;
		});
	}
}

/**
 * Takes a URI and returns an object.
 *
 * @param {string} uri Spotify URI starting "spotify:"
 * @returns {object} Parsed URI.
 */
function parseUri(uri) {
	if (!uri.startsWith('spotify:')) {
		throw new Error('Not a valid URI');
	}

	const uriSplit = uri.split(':').slice(1);
	const uriObj = {};

	for (var i = 0; i < uriSplit.length; i += 2) {
		uriObj[uriSplit[i]] = uriSplit[i + 1];
	}

	return uriObj;
}